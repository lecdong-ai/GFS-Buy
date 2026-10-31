// 발주현황(카톡보내기) 수주 파서 — GFS app.js parseOrderStatusDedicatedSheet 미러 (클라이언트 공용, fs 없음)
export interface IntakeOrderRow {
  menuName: string;
  category: string;
  qty1: number;
  qty2: number;
  total: number;
}

function parseNumber(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (val == null) return 0;
  const n = parseFloat(String(val).replace(/,/g, '').replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

const MENU_RE = /(삼각|김밥|도시락|무스비|볶음밥|제육|스팸|불고기|돈까스|치즈|리조또|한상|우동|국수|면|버거|샌드위치|핫도그|떡갈비|치킨|만두|죽)/;
const SKIP_RE = /(소계|합계|TOTAL|총계|비고|구분|단위|아래 수식|품명|제품명|메뉴명)/i;

/** 단일 시트 rows(header:1) 파싱 → 주문행 목록 (없으면 null) */
export function parseOrderStatusRows(rows: any[][]): IntakeOrderRow[] | null {
  let catCol = -1;
  let nameCol = -1;
  let p1Col = -1;
  let p2Col = -1;
  let totCol = -1;
  let dataStartRow = -1;

  for (let r = 0; r < Math.min(8, rows.length); r++) {
    const row = rows[r] || [];
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] ?? '').replace(/\s+/g, '');
      if (val === '분류' && catCol === -1) catCol = c;
      else if (val === '품명' && nameCol === -1) nameCol = c;
      else if (val.includes('1편') && p1Col === -1) p1Col = c;
      else if (val.includes('2편') && p2Col === -1) p2Col = c;
      else if (val.includes('합계수량') && totCol === -1) totCol = c;
    }
  }
  if (nameCol === -1 || (p1Col === -1 && totCol === -1)) return null;

  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const val = String(rows[r]?.[nameCol] ?? '').trim();
    if (MENU_RE.test(val)) {
      dataStartRow = r;
      break;
    }
  }
  if (dataStartRow === -1) return null;

  const out: IntakeOrderRow[] = [];
  let curCat = '기타';
  for (let r = dataStartRow; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    if (catCol !== -1 && row[catCol]) {
      const cval = String(row[catCol]).trim();
      if (cval && !/(소계|합계|TOTAL|총계)/i.test(cval)) curCat = cval.replace(/\n/g, ' ');
    }
    const name = String(row[nameCol] ?? '').trim();
    if (!name || SKIP_RE.test(name)) continue;
    const p1 = p1Col !== -1 && row[p1Col] !== undefined ? parseNumber(row[p1Col]) : 0;
    const p2 = p2Col !== -1 && row[p2Col] !== undefined ? parseNumber(row[p2Col]) : 0;
    let tot = totCol !== -1 && row[totCol] !== undefined ? parseNumber(row[totCol]) : 0;
    if (tot === 0 && p1 + p2 > 0) tot = p1 + p2;
    if (tot <= 0 && p1 + p2 <= 0) continue;
    out.push({ menuName: name, category: curCat, qty1: p1, qty2: p2, total: tot });
  }
  return out.length > 0 ? out : null;
}

/** 워크북에서 발주현황 시트 선택 (발주현황* 우선, 없으면 전 시트 탐색) */
export function pickOrderSheetName(sheetNames: string[]): string[] {
  const preferred = sheetNames.filter((n) => n.includes('발주현황'));
  const rest = sheetNames.filter((n) => !n.includes('발주현황'));
  return [...preferred, ...rest];
}
