// BOM 일괄적재 본실행 (일회성) — npx tsx scripts/bom-import.exec.ts
import { PrismaClient } from '@prisma/client';
import { findRepoFiles, loadBomBundle, buildPreview, executeImport } from '../src/lib/gfs/bomImport';

async function main() {
  const prisma = new PrismaClient();
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { orderFile, auditFile } = findRepoFiles();
    console.log('정본:', orderFile);
    const bundle = await loadBomBundle(orderFile, auditFile, today);

    const allNames = [
      ...new Set([...bundle.mats.map((m) => m.name), ...[...bundle.menuMap.values()].map((e) => e.menu)]),
    ];
    const existing = await prisma.product.findMany({ where: { name: { in: allNames } } });
    const existingByName = new Map(existing.map((p) => [p.name, p]));
    const preview = buildPreview(bundle.mats, bundle.menuMap, bundle.skippedMemo, existingByName);
    console.log(
      `미리보기: 자재 ${preview.materialCount}종(신규 ${preview.newMaterials}) · 메뉴 ${preview.menuCount}종(신규 ${preview.newMenus}) · 연결 ${preview.linkCount}건 · 메모제외 ${preview.skippedMemo.length}건`
    );

    const result = await executeImport(prisma as any, bundle, existingByName, today, (done, total, label) => {
      if (done % 10 === 0 || done === total) console.log(`  진행 ${done}/${total} ... ${label}`);
    });
    console.log('완료:', JSON.stringify({ ...result, errors: result.errors.slice(0, 10) }, null, 1));

    await prisma.systemLog
      .create({
        data: {
          logDate: new Date().toISOString(),
          userId: 1,
          loginId: 'console',
          userName: 'console',
          action: 'BOM일괄적재',
          menuId: 'master-bom-normal',
          menuName: 'BOM(일반)',
          detail: `console BOM 일괄적재: 메뉴 ${result.menuCount}종, 품목생성 ${result.createdProducts}건, 상세 ${result.createdDetails}건, 실패 ${result.errors.length}건`,
        },
      })
      .catch(() => {});
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
