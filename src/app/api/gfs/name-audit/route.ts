import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { parseOrderSheetBom, buildAuditMap, normName } from '@/lib/gfs/canonical';

// GET /api/gfs/name-audit — ERP 품명 vs 엑셀 정본(자재+메뉴) 대조
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const orderCandidates = [
      `${process.cwd()}/★★발주서양식통합★★(정준오)(v.260831) (2).xlsx`,
      `${process.cwd()}/GFS.xlsx`,
    ];
    let orderFile: string | null = null;
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

    const wb = XLSX.readFile(orderFile);
    const mats = parseOrderSheetBom(wb);
    const excelMaterials = [...new Set(mats.map((m) => m.name))];
    const menuSet = new Map<string, string>();
    mats.forEach((m) => m.menus.forEach((l) => {
      if (!menuSet.has(l.normMenu)) menuSet.set(l.normMenu, l.menu);
    }));
    const excelMenus = [...menuSet.values()];

    const erpProducts = await prisma.product.findMany({
      where: { isUsed: true },
      select: { name: true, category: true, productCode: true },
    });
    const erpNorms = new Map<string, { name: string; category: string }>();
    erpProducts.forEach((p) => {
      const k = normName(p.name);
      if (k && !erpNorms.has(k)) erpNorms.set(k, { name: p.name, category: p.category });
    });

    const missingMaterials = excelMaterials.filter((n) => !erpNorms.has(normName(n)));
    const missingMenus = excelMenus.filter((n) => !erpNorms.has(normName(n)));
    const excelNorms = new Set([...excelMaterials, ...excelMenus].map((n) => normName(n)));
    const erpNotInExcel = erpProducts
      .filter((p) => !excelNorms.has(normName(p.name)))
      .map((p) => `${p.name} [${p.category}]`);

    // 같은 이름 + 다른 구분 (완성품/자재 겹침)
    const byNorm = new Map<string, Set<string>>();
    erpProducts.forEach((p) => {
      const k = normName(p.name);
      if (!k) return;
      if (!byNorm.has(k)) byNorm.set(k, new Set());
      byNorm.get(k)!.add(p.category);
    });
    const dupNames = [...byNorm.entries()]
      .filter(([, cats]) => cats.size > 1)
      .map(([k, cats]) => `${erpProducts.find((p) => normName(p.name) === k)?.name} (${[...cats].join('/')})`);

    return NextResponse.json({
      success: true,
      data: {
        excelMaterials: excelMaterials.length,
        excelMenus: excelMenus.length,
        erpCount: erpProducts.length,
        missingMaterials,
        missingMenus,
        erpNotInExcel,
        dupNames,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'name-audit 실패' },
      { status: 500 }
    );
  }
}
