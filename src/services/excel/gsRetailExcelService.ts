import * as XLSX from 'xlsx';
import { OrderIntakeItem } from '../pipeline/types';
import { SAMPLE_STORE_ORDERS, REPR_MAPPINGS } from '../pipeline/ProductionCostPipeline';

export interface ParsedExcelResult {
  orders: OrderIntakeItem[];
  totalLines: number;
  totalQty: number;
  shift1Qty: number;
  shift2Qty: number;
  validItemCount: number;
  unrecognizedBarcodes: string[];
  rawRowCount: number;
}

/**
 * GS리테일 표준 점포 발주 샘플 엑셀 파일 생성 및 다운로드
 */
export function generateSampleGsRetailExcel(): void {
  const sampleRows = [
    {
      납품요청일: '2026-10-30',
      편수: '1편',
      점포코드: 'GS25-1001',
      점포명: 'GS25 역삼스타점',
      상품바코드: '28607290144',
      상품명: '더 큰)스팸2배계란볶음밥',
      발주수량: 120,
      납품단가: 3600,
      배송온도: '냉장',
      비고: '오전 06:00 납품',
    },
    {
      납품요청일: '2026-10-30',
      편수: '1편',
      점포코드: 'GS25-1002',
      점포명: 'GS25 강남중앙점',
      상품바코드: '28607290004',
      상품명: '삼각)전주비빔',
      발주수량: 250,
      납품단가: 950,
      배송온도: '냉장',
      비고: '오전 06:00 납품',
    },
    {
      납품요청일: '2026-10-30',
      편수: '1편',
      점포코드: 'GS25-1003',
      점포명: 'GS25 종로타워점',
      상품바코드: '28607290008',
      상품명: '슈퍼)착한참치마요김밥',
      발주수량: 180,
      납품단가: 1850,
      배송온도: '냉장',
      비고: '오전 06:00 납품',
    },
    {
      납품요청일: '2026-10-30',
      편수: '1편',
      점포코드: 'GS25-1004',
      점포명: 'GS25 판교테크노점',
      상품바코드: '28607290014',
      상품명: '토네이도후랑크소시지크루아상',
      발주수량: 90,
      납품단가: 2150,
      배송온도: '냉장',
      비고: '오전 06:00 납품',
    },
    {
      납품요청일: '2026-10-30',
      편수: '2편',
      점포코드: 'GS25-1001',
      점포명: 'GS25 역삼스타점',
      상품바코드: '28607290144',
      상품명: '더 큰)스팸2배계란볶음밥',
      발주수량: 80,
      납품단가: 3600,
      배송온도: '냉장',
      비고: '야간 21:00 납품',
    },
    {
      납품요청일: '2026-10-30',
      편수: '2편',
      점포코드: 'GS25-1005',
      점포명: 'GS25 영등포역점',
      상품바코드: '28607290004',
      상품명: '삼각)전주비빔',
      발주수량: 220,
      납품단가: 950,
      배송온도: '냉장',
      비고: '야간 21:00 납품',
    },
    {
      납품요청일: '2026-10-30',
      편수: '2편',
      점포코드: 'GS25-1006',
      점포명: 'GS25 홍대입구점',
      상품바코드: '28607290008',
      상품명: '슈퍼)착한참치마요김밥',
      발주수량: 160,
      납품단가: 1850,
      배송온도: '냉장',
      비고: '야간 21:00 납품',
    },
    {
      납품요청일: '2026-10-30',
      편수: '2편',
      점포코드: 'GS25-1007',
      점포명: 'GS25 부산서면점',
      상품바코드: '28607290010',
      상품명: '삼각)소고기고추장',
      발주수량: 140,
      납품단가: 950,
      배송온도: '냉장',
      비고: '야간 21:00 납품',
    },
    {
      납품요청일: '2026-10-30',
      편수: '1편',
      점포코드: 'GS25-1008',
      점포명: 'GS25 대전둔산점',
      상품바코드: '28607290013',
      상품명: '11가지찬많은도시락',
      발주수량: 110,
      납품단가: 4200,
      배송온도: '냉장',
      비고: '오전 06:00 납품',
    },
    {
      납품요청일: '2026-10-30',
      편수: '2편',
      점포코드: 'GS25-1009',
      점포명: 'GS25 대구동성로점',
      상품바코드: '28607290013',
      상품명: '11가지찬많은도시락',
      발주수량: 95,
      납품단가: 4200,
      배송온도: '냉장',
      비고: '야간 21:00 납품',
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleRows);

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, // 납품요청일
    { wch: 8 },  // 편수
    { wch: 12 }, // 점포코드
    { wch: 18 }, // 점포명
    { wch: 16 }, // 상품바코드
    { wch: 28 }, // 상품명
    { wch: 10 }, // 발주수량
    { wch: 10 }, // 납품단가
    { wch: 10 }, // 배송온도
    { wch: 16 }, // 비고
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'GS리테일_점포발주서');
  XLSX.writeFile(wb, `GS리테일_점포발주양식_20261030.xlsx`);
}

/**
 * 엑셀 파일 바이너리 ArrayBuffer로부터 GS리테일 발주 데이터 파싱
 */
export function parseGsRetailExcelBuffer(buffer: ArrayBuffer): ParsedExcelResult {
  const wb = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  return aggregateOrderRows(rows);
}

/**
 * 엑셀/클립보드에서 복사된 TSV/CSV 텍스트 파싱
 */
export function parseGsRetailText(text: string): ParsedExcelResult {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return aggregateOrderRows([]);
  }

  const delimiter = text.includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));

  const rows: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''));
    if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;
    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] !== undefined ? cols[idx] : '';
    });
    rows.push(rowObj);
  }

  return aggregateOrderRows(rows);
}

/**
 * 점포별 발주 행들을 ERP 파이프라인 규격(OrderIntakeItem)으로 N:1 집계
 */
function aggregateOrderRows(rows: Record<string, any>[]): ParsedExcelResult {
  const itemMap: Record<
    string,
    {
      orderItemCode: string;
      orderItemName: string;
      orderQty1: number;
      orderQty2: number;
      deliveryPrice: number;
      category: string;
    }
  > = {};

  const unrecognizedBarcodes: Set<string> = new Set();

  rows.forEach((row) => {
    // 유연한 컬럼명 매핑
    const barcode = String(
      row['상품바코드'] ||
        row['바코드'] ||
        row['상품코드'] ||
        row['ITEM_CD'] ||
        row['Barcode'] ||
        ''
    ).trim();
    if (!barcode) return;

    const itemName = String(
      row['상품명'] ||
        row['품명'] ||
        row['ITEM_NM'] ||
        row['ItemName'] ||
        '미지정상품'
    ).trim();

    const shiftRaw = String(row['편수'] || row['배송구분'] || row['차수'] || '1편').trim();
    const isShift2 = shiftRaw.includes('2') || shiftRaw.includes('야간') || shiftRaw.includes('2편');

    const qty = Number(
      String(row['발주수량'] || row['수량'] || row['ORDER_QTY'] || 0).replace(/,/g, '')
    ) || 0;

    const unitPrice = Number(
      String(row['납품단가'] || row['단가'] || row['PRICE'] || 0).replace(/,/g, '')
    ) || 0;

    // Check if known in REPR_MAPPINGS or SAMPLE_STORE_ORDERS
    const knownMapping = REPR_MAPPINGS.find((m) => m.orderItemCode === barcode);
    const knownSample = SAMPLE_STORE_ORDERS.find((s) => s.orderItemCode === barcode);

    if (!knownMapping && !knownSample) {
      unrecognizedBarcodes.add(barcode);
    }

    if (!itemMap[barcode]) {
      itemMap[barcode] = {
        orderItemCode: barcode,
        orderItemName: knownMapping ? knownMapping.reprItemName : itemName,
        orderQty1: 0,
        orderQty2: 0,
        deliveryPrice: unitPrice > 0 ? unitPrice : knownSample ? knownSample.deliveryPrice : 2000,
        category: knownMapping ? knownMapping.category : '일반식품',
      };
    }

    if (isShift2) {
      itemMap[barcode].orderQty2 += qty;
    } else {
      itemMap[barcode].orderQty1 += qty;
    }
  });

  const orders: OrderIntakeItem[] = Object.values(itemMap).map((item, idx) => ({
    orderId: `GSR-ORD-20261030-${String(idx + 1).padStart(3, '0')}`,
    storeCode: 'GSR-ALL',
    storeName: 'GS25 전국 점포 통합',
    orderItemCode: item.orderItemCode,
    orderItemName: item.orderItemName,
    orderQty1: item.orderQty1,
    orderQty2: item.orderQty2,
    totalOrderQty: item.orderQty1 + item.orderQty2,
    deliveryPrice: item.deliveryPrice,
  }));

  const totalQty = orders.reduce((sum, o) => sum + o.totalOrderQty, 0);
  const shift1Qty = orders.reduce((sum, o) => sum + o.orderQty1, 0);
  const shift2Qty = orders.reduce((sum, o) => sum + o.orderQty2, 0);

  return {
    orders,
    totalLines: orders.length,
    totalQty,
    shift1Qty,
    shift2Qty,
    validItemCount: orders.length - unrecognizedBarcodes.size,
    unrecognizedBarcodes: Array.from(unrecognizedBarcodes),
    rawRowCount: rows.length,
  };
}
