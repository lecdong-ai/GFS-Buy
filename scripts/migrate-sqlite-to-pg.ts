// 로컬 SQLite → Supabase Postgres 이관 (일회성)
// 실행: npx tsx scripts/migrate-sqlite-to-pg.ts
// - 대상 테이블 전체 삭제 후 복사 (순수 복제)
// - Boolean 컬럼 0/1 -> false/true 변환, autoincrement 시퀀스 리셋
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const SQLITE = '/Users/bunker/GFS-ERP/prisma/gfs-erp.db';
// FK 순서: 부모 먼저
const ORDER = [
  'BaseCodeClass',
  'Partner',
  'GyeMaster',
  'GsCenter',
  'User',
  'CvsStore',
  'Product',
  'ProductPrice',
  'PackagingSpec',
  'BomHeader',
  'BomDetail',
  'ReprProduct',
  'SalesOrder',
  'SalesOrderDetail',
  'Delivery',
  'DeliveryDetail',
  'ShippingOrder',
  'Statement',
  'MaterialRequirement',
  'PurchaseOrder',
  'PurchaseOrderDetail',
  'Receiving',
  'ReceivingDetail',
  'WorkOrder',
  'ProductionResult',
  'ProductionSeq',
  'ExtraProduction',
  'DiscardRecord',
  'FoodWaste',
  'Inventory',
  'MaterialLedger',
  'StocktakeRecord',
  'WarehouseMove',
  'ReturnRecord',
  'SafetyStock',
  'DiscontinuedProduct',
  'UnusedMaterial',
  'MaterialExtraIssue',
  'ExpiryDiscardMgmt',
  'OverheadFixed',
  'OverheadVariable',
  'ProductPnL',
  'MonthlyPnL',
  'RecipeCostRate',
  'KpiRecord',
  'SalesPurchaseStatus',
  'ProvisionalSalesStatus',
  'ChangeRequest',
  'SystemLog',
  'UserPermission',
  'BaseCodeDetail',
  'GfsSnapshot',
];
const BOOL_COLS = new Set(['isUsed', 'isActive', 'canRead', 'canWrite', 'canDelete', 'canExport']);

// Prisma delegate 이름 매핑 (camelCase)
const DELEGATE: Record<string, string> = {
  BaseCodeClass: 'baseCodeClass',
  BaseCodeDetail: 'baseCodeDetail',
  Partner: 'partner',
  GyeMaster: 'gyeMaster',
  GsCenter: 'gsCenter',
  User: 'user',
  CvsStore: 'cvsStore',
  Product: 'product',
  ProductPrice: 'productPrice',
  PackagingSpec: 'packagingSpec',
  BomHeader: 'bomHeader',
  BomDetail: 'bomDetail',
  ReprProduct: 'reprProduct',
  SalesOrder: 'salesOrder',
  SalesOrderDetail: 'salesOrderDetail',
  Delivery: 'delivery',
  DeliveryDetail: 'deliveryDetail',
  ShippingOrder: 'shippingOrder',
  Statement: 'statement',
  MaterialRequirement: 'materialRequirement',
  PurchaseOrder: 'purchaseOrder',
  PurchaseOrderDetail: 'purchaseOrderDetail',
  Receiving: 'receiving',
  ReceivingDetail: 'receivingDetail',
  WorkOrder: 'workOrder',
  ProductionResult: 'productionResult',
  ProductionSeq: 'productionSeq',
  ExtraProduction: 'extraProduction',
  DiscardRecord: 'discardRecord',
  FoodWaste: 'foodWaste',
  Inventory: 'inventory',
  MaterialLedger: 'materialLedger',
  StocktakeRecord: 'stocktakeRecord',
  WarehouseMove: 'warehouseMove',
  ReturnRecord: 'returnRecord',
  SafetyStock: 'safetyStock',
  DiscontinuedProduct: 'discontinuedProduct',
  UnusedMaterial: 'unusedMaterial',
  MaterialExtraIssue: 'materialExtraIssue',
  ExpiryDiscardMgmt: 'expiryDiscardMgmt',
  OverheadFixed: 'overheadFixed',
  OverheadVariable: 'overheadVariable',
  ProductPnL: 'productPnL',
  MonthlyPnL: 'monthlyPnL',
  RecipeCostRate: 'recipeCostRate',
  KpiRecord: 'kpiRecord',
  SalesPurchaseStatus: 'salesPurchaseStatus',
  ProvisionalSalesStatus: 'provisionalSalesStatus',
  ChangeRequest: 'changeRequest',
  SystemLog: 'systemLog',
  UserPermission: 'userPermission',
  GfsSnapshot: 'gfsSnapshot',
};

function dump(table: string): any[] {
  const out = execSync(`sqlite3 "${SQLITE}" "SELECT * FROM \\"${table}\\";" -json`, { maxBuffer: 256 * 1024 * 1024 }).toString();
  if (!out.trim()) return [];
  return JSON.parse(out);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    // 1. 대상 전체 삭제 (자식 먼저)
    console.log('== 대상 초기화 ==');
    for (const t of [...ORDER].reverse()) {
      const d = (prisma as any)[DELEGATE[t]];
      if (!d) continue;
      try {
        const r = await d.deleteMany({});
        if (r.count > 0) console.log(`  clear ${t}: ${r.count}`);
      } catch (e: any) {
        console.log(`  clear ${t} SKIP: ${String(e.message).split('\n')[0]}`);
      }
    }
    // 2. 복사
    console.log('== 복사 시작 ==');
    let total = 0;
    for (const t of ORDER) {
      let rows: any[];
      try {
        rows = dump(t);
      } catch (e: any) {
        console.log(`  ${t}: dump 실패, skip`);
        continue;
      }
      if (rows.length === 0) continue;
      const d = (prisma as any)[DELEGATE[t]];
      // boolean 변환 + DateTime 정규화(숫자ms / 'YYYY-MM-DD HH:mm:ss' / 빈값 처리)
  const normDT = (v: any): string | undefined => {
    if (v == null || v === '') return undefined;
    if (typeof v === 'number') return new Date(v).toISOString();
    if (typeof v === 'string') {
      const s = v.trim().replace(' ', 'T');
      if (!s) return undefined;
      const d = new Date(s.length === 10 ? s + 'T00:00:00' : s);
      if (!isNaN(d.getTime())) return d.toISOString();
      return undefined;
    }
    return undefined;
  };
      // boolean 변환 + DateTime 정규화
      for (const r of rows) {
        for (const k of Object.keys(r)) {
          if (BOOL_COLS.has(k) && (r[k] === 0 || r[k] === 1)) r[k] = r[k] === 1;
          if (k === 'createdAt' || k === 'updatedAt') {
            const nd = normDT(r[k]);
            if (nd === undefined) delete (r as any)[k];
            else r[k] = nd;
          }
        }
      }
      const B = 300;
      for (let i = 0; i < rows.length; i += B) {
        try {
          await d.createMany({ data: rows.slice(i, i + B), skipDuplicates: true });
        } catch (e: any) {
          // 문제 행 특정: 한 건씩 재시도
          console.log(`  ${t}: 배치 실패, 개별 재시도 (${i}~${i + B})`);
          let ok = 0;
          let fail = 0;
          for (const r of rows.slice(i, i + B)) {
            try {
              await d.create({ data: r });
              ok++;
            } catch (e2: any) {
              fail++;
              if (fail <= 3) console.log(`    제외: ${JSON.stringify(r).slice(0, 200)} / ${String(e2.message).split('\n')[0]}`);
            }
          }
          console.log(`  ${t}: 개별처리 ${ok}건 성공, ${fail}건 제외`);
        }
      }
      total += rows.length;
      console.log(`  ${t}: ${rows.length}건`);
      // 시퀀스 리셋
      try {
        await prisma.$executeRawUnsafe(
          `SELECT setval(pg_get_serial_sequence('"${t}"','id'), (SELECT COALESCE(MAX("id"),1) FROM "${t}"))`
        );
      } catch {}
    }
    console.log(`== 완료: 총 ${total}건 ==`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
