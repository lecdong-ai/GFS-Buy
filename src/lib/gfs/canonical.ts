import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export interface AuditEntry {
  name: string;
  norm: string;
  warehouse: string; // 냉장1 | 냉장2 | 냉동 | 상온 | 부자재
  vendor: string;
  itemId: string;
  packUnit: number;
  bagPrice: number;
}

export interface OrderSheetItem {
  name: string;
  norm: string;
  supplierHeader: string;
  boxes: number;
  packUnit: number;
  dailyUsage: number;
  incoming: number;
  currentStock: number;
  bagPrice: number;
}

export const AUDIT_SHEETS = ['부자재', '냉장1', '냉장2', '냉동', '상온'] as const;

/** 품명 정규화: [접두어]/괄호/기호 제거 + 소문자 */
export function normName(s: unknown): string {
  return String(s ?? '')
    .replace(/\[.+?\]/g, '')
    .replace(/\(.+?\)/g, '')
    .replace(/[^가-힣a-zA-Z0-9]/g, '')
    .toLowerCase();
}

/** 프로젝트 루트 기준 엑셀 경로 탐색 (GFS-ERP 안에 커밋된 정본 우선) */
function findFile(candidates: string[]): string | null {
  const root = process.cwd();
  for (const c of candidates) {
    const p = path.isAbsolute(c) ? c : path.join(root, c);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function getAuditFilePath(): string | null {
  return findFile([
    '일일 재고조사표 새 양식(10월 29일) (2).xlsx',
    '/Users/bunker/GFS/일일 재고조사표 새 양식(10월 29일) (2).xlsx',
  ]);
}

export function getOrderSheetFilePath(): string | null {
  return findFile([
    '★★발주서양식통합★★(정준오)(v.260831) (2).xlsx',
    'GFS.xlsx',
    '/Users/bunker/GFS/★★발주서양식통합★★(정준오)(v.260831) (2).xlsx',
    '/Users/bunker/GFS/GFS.xlsx',
  ]);
}

/** 재고조사표 5시트 → 정본 맵 (norm → AuditEntry) */
export function buildAuditMap(wb: XLSX.WorkBook): Map<string, AuditEntry> {
  const map = new Map<string, AuditEntry>();
  for (const sheet of AUDIT_SHEETS) {
    const ws = wb.Sheets[sheet];
    if (!ws) continue;
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    // R3 헤더, R4부터 데이터: 1거래처 2ID 3제품명 7박스 8낱개 9현재고 10입수량 12봉단가
    for (let i = 4; i < rows.length; i++) {
      const r = rows[i];
      if (!r) continue;
      const name = r[3];
      if (!name || String(name).trim().length < 2) continue;
      const norm = normName(name);
      if (!norm || map.has(norm)) continue;
      map.set(norm, {
        name: String(name).trim(),
        norm,
        warehouse: sheet,
        vendor: String(r[1] ?? '').trim(),
        itemId: r[2] != null ? String(r[2]).trim() : '',
        packUnit: Number(r[10]) || 0,
        bagPrice: Number(r[12]) || 0,
      });
    }
  }
  return map;
}

/** 발주시트 파싱 (발주서양식통합 / GFS.xlsx 공용) */
export function parseOrderSheet(wb: XLSX.WorkBook): { items: OrderSheetItem[]; suppliers: string[] } {
  const ws = wb.Sheets['발주시트'];
  if (!ws) return { items: [], suppliers: [] };
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const items: OrderSheetItem[] = [];
  const suppliers = new Set<string>();
  let header = '';
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    const a = r[0];
    if (a && typeof a === 'string' && a.trim().length > 1) {
      header = a.trim();
      suppliers.add(header);
      continue;
    }
    const name = r[2];
    const boxes = r[3];
    if (name && String(name).trim().length > 1) {
      items.push({
        name: String(name).trim(),
        norm: normName(name),
        supplierHeader: header,
        boxes: typeof boxes === 'number' ? boxes : 0,
        packUnit: Number(r[4]) || 0,
        dailyUsage: Number(r[7]) || 0,
        incoming: Number(r[8]) || 0,
        currentStock: Number(r[9]) || 0,
        bagPrice: Number(r[16]) || 0,
      });
    }
  }
  return { items, suppliers: [...suppliers] };
}

/** 서버 커밋된 정본 파일에서 정본 맵 로드 */
export function loadCanonicalFromRepo(): {
  audit: AuditEntry[];
  orderItems: OrderSheetItem[];
  suppliers: string[];
  auditFile: string | null;
  orderFile: string | null;
} {
  let audit: AuditEntry[] = [];
  let orderItems: OrderSheetItem[] = [];
  let suppliers: string[] = [];
  const auditFile = getAuditFilePath();
  const orderFile = getOrderSheetFilePath();
  if (auditFile) {
    const wb = XLSX.readFile(auditFile);
    audit = [...buildAuditMap(wb).values()];
  }
  if (orderFile) {
    const wb = XLSX.readFile(orderFile);
    const parsed = parseOrderSheet(wb);
    orderItems = parsed.items;
    suppliers = parsed.suppliers;
  }
  return { audit, orderItems, suppliers, auditFile, orderFile };
}
