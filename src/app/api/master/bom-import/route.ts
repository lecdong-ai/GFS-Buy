import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';
import {
  parseOrderSheetBom,
  buildAuditMap,
  normName,
  inferBomUnit,
  inferMenuKind,
} from '@/lib/gfs/canonical';

function cleanSupplier(header: string): string {
  return header
    .replace(/\(.*?\)/g, '')
    .replace(/월화수목금토|월수금|화목토|매일|D-\d|D\d|수시|주\d/g, '')
    .trim();
}

// POST /api/master/bom-import — 발주서 정본 내장 BOM 일괄적재
// body: { dryRun?: boolean }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }
    const me = session.user as any;
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun !== false; // 기본 미리보기
    const today = new Date().toISOString().slice(0, 10);

    // 메모성 메뉴: 품목으로 만들지 않고 목록만 보고 (집계메모/작업메모/삭제됨)
    const MEMO_MENU_PATTERN = /전체물량|전처리실|밥비닐|삭제/;

    // 정본 파일 로드
    const orderCandidates = [
      `${process.cwd()}/★★발주서양식통합★★(정준오)(v.260831) (2).xlsx`,
      `${process.cwd()}/GFS.xlsx`,
      '/Users/bunker/GFS/★★발주서양식통합★★(정준오)(v.260831) (2).xlsx',
    ];
    const auditCandidates = [
      `${process.cwd()}/일일 재고조사표 새 양식(10월 29일) (2).xlsx`,
      '/Users/bunker/GFS/일일 재고조사표 새 양식(10월 29일) (2).xlsx',
    ];
    let orderFile: string | null = null;
    let auditMap = new Map();
    for (const c of orderCandidates) {
      try {
        const fs = await import('fs');
        if (fs.existsSync(c)) {
          orderFile = c;
          break;
        }
      } catch {}
    }
    if (!orderFile) {
      return NextResponse.json({ success: false, error: '발주서 정본 파일을 찾을 수 없습니다.' }, { status: 400 });
    }
    for (const c of auditCandidates) {
      try {
        const fs = await import('fs');
        if (fs.existsSync(c)) {
          auditMap = buildAuditMap(XLSX.readFile(c));
          break;
        }
      } catch {}
    }

    const wb = XLSX.readFile(orderFile);
    const mats = parseOrderSheetBom(wb);

    // 메뉴 기준 역전개: menu -> [{material, perUnit}] (메모성은 제외하고 목록만)
    const menuMap = new Map<string, { menu: string; links: { mat: (typeof mats)[number]; perUnit: number }[] }>();
    const skippedMemo: string[] = [];
    for (const m of mats) {
      for (const link of m.menus) {
        if (!link.menu || link.perUnit <= 0) continue;
        if (MEMO_MENU_PATTERN.test(link.menu)) {
          if (!skippedMemo.includes(link.menu)) skippedMemo.push(link.menu);
          continue;
        }
        const e = menuMap.get(link.normMenu) || { menu: link.menu, links: [] };
        e.links.push({ mat: m, perUnit: link.perUnit });
        menuMap.set(link.normMenu, e);
      }
    }

    // 기존 품목 일괄 조회 (이름 기준)
    const allNames = [...new Set([...mats.map((m) => m.name), ...[...menuMap.values()].map((e) => e.menu)])];
    const existing = await prisma.product.findMany({ where: { name: { in: allNames } } });
    const existingByName = new Map(existing.map((p) => [p.name, p]));

    const newMaterials = mats.filter((m) => !existingByName.has(m.name));
    const newMenus = [...menuMap.values()].filter((e) => !existingByName.has(e.menu));
    const linkCount = [...menuMap.values()].reduce((a, e) => a + e.links.length, 0);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        data: {
          dryRun: true,
          materialCount: mats.length,
          menuCount: menuMap.size,
          linkCount,
          existingMaterials: mats.length - newMaterials.length,
          newMaterials: newMaterials.length,
          existingMenus: menuMap.size - newMenus.length,
          newMenus: newMenus.length,
          skippedMemo,
          sampleNewMaterials: newMaterials.slice(0, 10).map((m) => m.name),
          sampleNewMenus: newMenus.slice(0, 10).map((e) => e.menu),
          sampleLinks: [...menuMap.values()].slice(0, 5).map((e) => ({
            menu: e.menu,
            materials: e.links.slice(0, 5).map((l) => `${l.mat.name} x${l.perUnit}`),
          })),
        },
      });
    }

    // ---- 실행 ----
    let createdProducts = 0;
    let createdPartners = 0;
    let createdHeaders = 0;
    let createdDetails = 0;
    const errors: string[] = [];
    let pSeq = 0;
    let vSeq = 0;
    const dateTag = today.replace(/-/g, '');

    const ensurePartner = async (rawName: string): Promise<{ id: string; name: string } | null> => {
      const name = cleanSupplier(rawName).split('(')[0].trim();
      if (!name) return null;
      const found = await prisma.partner.findFirst({ where: { name } });
      if (found) return { id: found.id, name: found.name };
      vSeq += 1;
      const id = `VG${dateTag.slice(2)}${String(vSeq).padStart(3, '0')}`;
      const created = await prisma.partner.create({
        data: { id, name, partnerType: 'P', remark: 'BOM 일괄적재 자동생성' },
      });
      createdPartners += 1;
      return { id: created.id, name: created.name };
    };

    const productCache = new Map<string, any>(existingByName);

    const ensureMaterial = async (m: (typeof mats)[number]): Promise<any> => {
      const hit = productCache.get(m.name);
      if (hit) return hit;
      const ref: any = (auditMap as Map<string, any>).get(normName(m.name));
      const vendorRaw = ref?.vendor || m.supplierHeader;
      const partner = vendorRaw ? await ensurePartner(vendorRaw) : null;
      const isSub = ref?.warehouse === '부자재';
      pSeq += 1;
      let codeBase =
        ref?.itemId && String(ref.itemId).trim() ? String(ref.itemId).trim() : `GFS-${dateTag}-${String(pSeq).padStart(3, '0')}`;
      let productCode = codeBase;
      let n = 1;
      while (await prisma.product.findUnique({ where: { productCode } })) {
        productCode = `${codeBase}-${n++}`;
      }
      const bagPrice = Number(ref?.bagPrice) || 0;
      // 안전재고 자동계산: 일사용량(G발주서 H열)×입수량×조달일수(공급사 D-N, 없으면 2)×1.5
      const packForSafety = Number(ref?.packUnit) || 0;
      const leadM = /D-(\d+)/.exec(m.supplierHeader || '');
      const leadDays = leadM ? Math.max(1, parseInt(leadM[1], 10)) : 2;
      const autoSafety =
        m.dailyUsage > 0 && packForSafety > 0 ? Math.round(m.dailyUsage * packForSafety * leadDays * 1.5) : 0;
      const created = await prisma.product.create({
        data: {
          productCode,
          name: m.name,
          spec: '',
          unit: 'box',
          category: isSub ? '부자재' : '원재료',
          kind: '',
          boxQty: Number(ref?.packUnit) || 0,
          warehouse: ref?.warehouse || '',
          safetyStockQty: autoSafety,
          partnerId: partner?.id || null,
          remark: 'BOM 일괄적재 자동생성(확인필요)',
        },
      });
      if (bagPrice > 0) {
        await prisma.productPrice.create({
          data: {
            productId: created.id,
            purchasePrice: bagPrice,
            deliveryPrice: 0,
            effectiveDate: today,
            remark: 'BOM 일괄적재 단가(봉단가)',
          },
        });
      }
      createdProducts += 1;
      productCache.set(m.name, created);
      return created;
    };

    const ensureMenu = async (menu: string): Promise<any> => {
      const hit = productCache.get(menu);
      if (hit) return hit;
      pSeq += 1;
      let productCode = `FG-${dateTag.slice(2)}-${String(pSeq).padStart(3, '0')}`;
      let n = 1;
      while (await prisma.product.findUnique({ where: { productCode } })) {
        productCode = `${productCode}-${n++}`;
      }
      const created = await prisma.product.create({
        data: {
          productCode,
          name: menu,
          spec: '',
          unit: 'ea',
          category: '완성품',
          kind: inferMenuKind(menu),
          boxQty: 1,
          remark: 'BOM 일괄적재 자동생성(신메뉴, v1.0)',
        },
      });
      createdProducts += 1;
      productCache.set(menu, created);
      return created;
    };

    const sortedMenus = [...menuMap.values()].sort((a, b) => a.menu.localeCompare(b.menu, 'ko'));
    for (const entry of sortedMenus) {
      try {
        const parent = await ensureMenu(entry.menu);
        let header = await prisma.bomHeader.findFirst({
          where: { parentProductId: parent.id, version: '1.0' },
        });
        if (!header) {
          header = await prisma.bomHeader.create({
            data: { parentProductId: parent.id, version: '1.0', effectiveDate: today, remark: 'BOM 일괄적재' },
          });
          createdHeaders += 1;
        }
        await prisma.bomDetail.deleteMany({ where: { bomHeaderId: header.id } });
        let sortOrder = 0;
        for (const link of entry.links) {
          const child = await ensureMaterial(link.mat);
          await prisma.bomDetail.create({
            data: {
              bomHeaderId: header.id,
              childProductId: child.id,
              level: 3,
              unitQty: link.perUnit,
              unit: inferBomUnit(link.mat.name),
              yieldRate: 100,
              sortOrder: ++sortOrder,
              remark: 'GFS 일괄적재',
            },
          });
          createdDetails += 1;
        }
      } catch (e: any) {
        errors.push(`${entry.menu}: ${e.message}`);
      }
    }

    await prisma.systemLog
      .create({
        data: {
          logDate: new Date().toISOString(),
          userId: Number(me.id) || undefined,
          loginId: String(me.loginId || ''),
          userName: String(me.name || ''),
          action: 'BOM일괄적재',
          menuId: 'master-bom-normal',
          menuName: 'BOM(일반)',
          detail: `${me.name || me.loginId} BOM 일괄적재: 메뉴 ${sortedMenus.length}종, 품목생성 ${createdProducts}건, 상세 ${createdDetails}건${skippedMemo.length ? `, 메모제외 ${skippedMemo.length}건` : ''}${errors.length ? `, 실패 ${errors.length}건` : ''}`,
        },
      })
      .catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        menuCount: sortedMenus.length,
        createdProducts,
        createdPartners,
        createdHeaders,
        createdDetails,
        skippedMemo,
        errors: errors.slice(0, 20),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'BOM 일괄적재 실패' },
      { status: 500 }
    );
  }
}
