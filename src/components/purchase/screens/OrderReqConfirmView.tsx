'use client';

import React, { useState, useMemo } from 'react';
import { HelpCircle, Search, Save, RotateCcw } from 'lucide-react';

import { EditableTableWrapper } from '@/components/common/EditableTableWrapper';
export interface OrderReqConfirmItem {
  id: number;
  category: string; // 구분 (원재료 / 부자재)
  itemName: string; // 품명
  spec: string; // 규격
  unit: string; // 단위
  supplier: string; // 거래처
  orderUnit: string; // 발주단위
  minOrderQty: number; // 최소발주수량
  orderQty: number; // 발주수량
  unitPrice: number; // 발주단가
  orderAmt: number; // 발주금액
  calcQty: number; // 발주계산수량
  unitQty: number; // Unit 수량
  orderUnitQty: number; // 발주단위수량
  leadTime: number; // 조달기간
  clientStock: number; // 거래처재고
  safetyStock: number; // 안전재고
  currentStock: number; // 현재고
  incomingScheduledBox: number; // 입고예정량(BOX)
  incomingScheduled: number; // 입고예정량
  stockQty: number; // 재고수량
}

// 화면 캡처 2026-10-30 155746.png 원본 스크린샷 100% 동일 26개 행 데이터 (합계: 52,381,640원)
export const SCREENSHOT_CONFIRM_DATA: OrderReqConfirmItem[] = [
  {
    id: 1,
    category: '원재료',
    itemName: '[냉동] 볶음김치',
    spec: '5kg*2ea',
    unit: '봉(팩)',
    supplier: '[네트웍스]대림',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 36,
    unitPrice: 70000,
    orderAmt: 2520000,
    calcQty: 71,
    unitQty: 2,
    orderUnitQty: 35.5,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 107,
    currentStock: 36,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 36,
  },
  {
    id: 2,
    category: '원재료',
    itemName: '[상온]고운고춧가루',
    spec: '1kg*20ea',
    unit: '봉(팩)',
    supplier: '[네트웍스]대림',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 13,
    unitPrice: 175000,
    orderAmt: 2275000,
    calcQty: 246.266,
    unitQty: 20,
    orderUnitQty: 12.313,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 27,
    currentStock: -219.266,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: -219.266,
  },
  {
    id: 3,
    category: '원재료',
    itemName: '[냉장]치킨C',
    spec: '2kg*10ea',
    unit: '봉(팩)',
    supplier: '[네트웍스]대림',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 1,
    unitPrice: 58000,
    orderAmt: 58000,
    calcQty: 8.081,
    unitQty: 10,
    orderUnitQty: 0.808,
    leadTime: 1,
    clientStock: 0,
    safetyStock: 16,
    currentStock: 7.919,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 7.919,
  },
  {
    id: 4,
    category: '원재료',
    itemName: '[냉장]치킨 미',
    spec: '2kg*9ea',
    unit: '봉(팩)',
    supplier: '[네트웍스]대림',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 1,
    unitPrice: 70200,
    orderAmt: 70200,
    calcQty: 4.601,
    unitQty: 9,
    orderUnitQty: 0.511,
    leadTime: 1,
    clientStock: 0,
    safetyStock: 6,
    currentStock: 1.399,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 1.399,
  },
  {
    id: 5,
    category: '원재료',
    itemName: '[냉동] 고추장불고기',
    spec: '2kg*5ea',
    unit: '봉(팩)',
    supplier: '[지에스리테일]',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 23,
    unitPrice: 63350,
    orderAmt: 1457050,
    calcQty: 114.082,
    unitQty: 5,
    orderUnitQty: 22.816,
    leadTime: 3,
    clientStock: 539,
    safetyStock: 0,
    currentStock: 424.918,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 424.918,
  },
  {
    id: 6,
    category: '원재료',
    itemName: '[냉장]닭갈비',
    spec: '3kg*5ea',
    unit: '봉(팩)',
    supplier: '다미푸드텍',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 144,
    unitPrice: 67500,
    orderAmt: 9720000,
    calcQty: 718.058,
    unitQty: 5,
    orderUnitQty: 143.612,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 0,
    currentStock: -718.058,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: -718.058,
  },
  {
    id: 7,
    category: '원재료',
    itemName: '[상온]롤김',
    spec: '300g*450매',
    unit: 'roll',
    supplier: '더원씨푸드',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 1,
    unitPrice: 583200,
    orderAmt: 583200,
    calcQty: 6,
    unitQty: 8,
    orderUnitQty: 0.75,
    leadTime: 1,
    clientStock: 0,
    safetyStock: 6,
    currentStock: 0,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 0,
  },
  {
    id: 8,
    category: '원재료',
    itemName: '[냉장]시크릿소스',
    spec: '2kg*5ea',
    unit: '봉(팩)',
    supplier: '동방푸드마스터',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 12,
    unitPrice: 35000,
    orderAmt: 420000,
    calcQty: 57,
    unitQty: 5,
    orderUnitQty: 11.4,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 57,
    currentStock: 0,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 0,
  },
  {
    id: 9,
    category: '원재료',
    itemName: '[냉장]자메이카소스',
    spec: '3kg*4ea',
    unit: '봉(팩)',
    supplier: '동방푸드마스터',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 5,
    unitPrice: 57600,
    orderAmt: 288000,
    calcQty: 19.589,
    unitQty: 4,
    orderUnitQty: 4.897,
    leadTime: 2,
    clientStock: 24,
    safetyStock: 0,
    currentStock: 4.411,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 4.411,
  },
  {
    id: 10,
    category: '원재료',
    itemName: '[상온]김야채스프',
    spec: '1kg*10ea',
    unit: '봉(팩)',
    supplier: '동방푸드마스터',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 1,
    unitPrice: 198000,
    orderAmt: 198000,
    calcQty: 1,
    unitQty: 10,
    orderUnitQty: 0.1,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 1,
    currentStock: 0,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 0,
  },
  {
    id: 11,
    category: '원재료',
    itemName: '[냉동]닭가슴살',
    spec: '1KG*10EA',
    unit: '봉(팩)',
    supplier: '',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 20,
    unitPrice: 81000,
    orderAmt: 1620000,
    calcQty: 195,
    unitQty: 10,
    orderUnitQty: 19.5,
    leadTime: 1,
    clientStock: 0,
    safetyStock: 195,
    currentStock: 0,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 0,
  },
  {
    id: 12,
    category: '원재료',
    itemName: '차별화상회(소스)',
    spec: '8Kg/ea',
    unit: '통',
    supplier: '',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 8,
    unitPrice: 6990,
    orderAmt: 55920,
    calcQty: 8,
    unitQty: 1,
    orderUnitQty: 8,
    leadTime: 0,
    clientStock: 0,
    safetyStock: 8,
    currentStock: 0,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 0,
  },
  {
    id: 13,
    category: '원재료',
    itemName: '[상온]치킨파우더',
    spec: '2Kg*5ea',
    unit: '봉(팩)',
    supplier: '',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 2,
    unitPrice: 34000,
    orderAmt: 68000,
    calcQty: 7.716,
    unitQty: 5,
    orderUnitQty: 1.543,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 0,
    currentStock: -7.716,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: -7.716,
  },
  {
    id: 14,
    category: '부자재',
    itemName: '혜자)제육&김밥필름',
    spec: '4000ea/롤',
    unit: 'roll',
    supplier: '',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 20,
    unitPrice: 28000,
    orderAmt: 560000,
    calcQty: 19.202,
    unitQty: 1,
    orderUnitQty: 19.202,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 0,
    currentStock: -19.202,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: -19.202,
  },
  {
    id: 15,
    category: '부자재',
    itemName: '혜자)제육&도시락필름',
    spec: '4000ea/롤',
    unit: 'roll',
    supplier: '',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 2,
    unitPrice: 27200,
    orderAmt: 54400,
    calcQty: 1.082,
    unitQty: 1,
    orderUnitQty: 1.082,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 0,
    currentStock: -1.082,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: -1.082,
  },
  {
    id: 16,
    category: '부자재',
    itemName: '혜자)한돈반찬필름',
    spec: '1500ea/롤',
    unit: 'roll',
    supplier: '',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 341,
    unitPrice: 78750,
    orderAmt: 26853750,
    calcQty: 340.985,
    unitQty: 1,
    orderUnitQty: 340.985,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 0,
    currentStock: -340.985,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: -340.985,
  },
  {
    id: 17,
    category: '부자재',
    itemName: 'Full)리챔참치필름',
    spec: '4000ea/롤',
    unit: 'roll',
    supplier: '',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 26,
    unitPrice: 38000,
    orderAmt: 988000,
    calcQty: 25.58,
    unitQty: 1,
    orderUnitQty: 25.58,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 0,
    currentStock: -25.58,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: -25.58,
  },
  {
    id: 18,
    category: '부자재',
    itemName: '혜자)직화불고기필름',
    spec: '1000ea/롤',
    unit: 'roll',
    supplier: '이프린팅',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 7,
    unitPrice: 45000,
    orderAmt: 315000,
    calcQty: 7,
    unitQty: 1,
    orderUnitQty: 7,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 0,
    currentStock: -7,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: -7,
  },
  {
    id: 19,
    category: '부자재',
    itemName: '혜자)치킨마요필름',
    spec: '1000ea/롤',
    unit: 'roll',
    supplier: '이프린팅',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 2,
    unitPrice: 50000,
    orderAmt: 100000,
    calcQty: 2,
    unitQty: 1,
    orderUnitQty: 2,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 0,
    currentStock: -2,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: -2,
  },
  {
    id: 20,
    category: '원재료',
    itemName: '[냉장]숙성치킨',
    spec: '2kg*5ea',
    unit: '봉(팩)',
    supplier: '',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 3,
    unitPrice: 41000,
    orderAmt: 123000,
    calcQty: 10.896,
    unitQty: 5,
    orderUnitQty: 2.179,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 36,
    currentStock: 25.104,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 25.104,
  },
  {
    id: 21,
    category: '원재료',
    itemName: '[상온]검은깨',
    spec: '1kg*10ea',
    unit: '봉(팩)',
    supplier: '',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 1,
    unitPrice: 100000,
    orderAmt: 100000,
    calcQty: 1,
    unitQty: 10,
    orderUnitQty: 0.1,
    leadTime: 2,
    clientStock: 0,
    safetyStock: 1,
    currentStock: 0,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 0,
  },
  {
    id: 22,
    category: '원재료',
    itemName: '[냉장]델리햄',
    spec: '1kg*8ea',
    unit: '봉(팩)',
    supplier: 'NS유통',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 52,
    unitPrice: 47200,
    orderAmt: 2454400,
    calcQty: 414,
    unitQty: 8,
    orderUnitQty: 51.75,
    leadTime: 1,
    clientStock: 0,
    safetyStock: 414,
    currentStock: 0,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 0,
  },
  {
    id: 23,
    category: '원재료',
    itemName: '[상온]리챔',
    spec: '340g*24ea',
    unit: 'can',
    supplier: 'NS유통',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 21,
    unitPrice: 62400,
    orderAmt: 1310400,
    calcQty: 490.567,
    unitQty: 24,
    orderUnitQty: 20.44,
    leadTime: 1,
    clientStock: 476,
    safetyStock: 0,
    currentStock: -14.567,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: -14.567,
  },
  {
    id: 24,
    category: '원재료',
    itemName: '[상온]맛소금',
    spec: '5kg*4ea',
    unit: '봉(팩)',
    supplier: 'NS유통',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 1,
    unitPrice: 30000,
    orderAmt: 30000,
    calcQty: 1.003,
    unitQty: 4,
    orderUnitQty: 0.251,
    leadTime: 1,
    clientStock: 0,
    safetyStock: 1,
    currentStock: -0.003,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: -0.003,
  },
  {
    id: 25,
    category: '원재료',
    itemName: '[상온]진간장',
    spec: '1.8L*6ea',
    unit: '통',
    supplier: 'NS유통',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 2,
    unitPrice: 27300,
    orderAmt: 54600,
    calcQty: 7.883,
    unitQty: 6,
    orderUnitQty: 1.314,
    leadTime: 1,
    clientStock: 0,
    safetyStock: 9,
    currentStock: 1.117,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 1.117,
  },
  {
    id: 26,
    category: '원재료',
    itemName: '[상온]소프트마요',
    spec: '1kg*4ea',
    unit: '봉(팩)',
    supplier: 'SPC삼립',
    orderUnit: 'box',
    minOrderQty: 1,
    orderQty: 14,
    unitPrice: 7480,
    orderAmt: 104720,
    calcQty: 54,
    unitQty: 4,
    orderUnitQty: 13.5,
    leadTime: 2,
    clientStock: 274,
    safetyStock: 0,
    currentStock: 220,
    incomingScheduledBox: 0,
    incomingScheduled: 0,
    stockQty: 220,
  },
];

export const OrderReqConfirmView: React.FC = () => {
  const [selectedSupplier, setSelectedSupplier] = useState('ALL');
  const [rows, setRows] = useState<OrderReqConfirmItem[]>(SCREENSHOT_CONFIRM_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDbLoaded, setIsDbLoaded] = useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);
  const [editVal, setEditVal] = useState<string>('');

  const handleGenericChange = (id: number, field: string, val: any) => {
    setRows((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          if (field === 'unitPrice' || field === 'orderQty') {
            const q = Number(updated.orderQty) || 0;
            const p = Number(updated.unitPrice) || 0;
            updated.orderAmt = Math.round(q * p);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const renderEditableCell = (row: any, field: string, align: 'left' | 'center' | 'right' = 'left', isNumber = false) => {
    const isEditing = editingCell?.id === row.id && editingCell?.field === field;
    if (isEditing) {
      return (
        <input
          autoFocus
          type="text"
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={() => {
            const val = isNumber ? (editVal === '' ? 0 : Number(editVal.replace(/,/g, '')) || 0) : editVal;
            handleGenericChange(row.id, field, val);
            setEditingCell(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = isNumber ? (editVal === '' ? 0 : Number(editVal.replace(/,/g, '')) || 0) : editVal;
              handleGenericChange(row.id, field, val);
              setEditingCell(null);
            } else if (e.key === 'Escape') {
              setEditingCell(null);
            }
          }}
          className={`w-full h-full min-h-[22px] bg-white text-gray-900 border-2 border-blue-600 rounded-none px-1 py-0.5 text-[12.5px] outline-none shadow-inner ${align === 'right' ? 'text-right font-mono' : align === 'center' ? 'text-center' : 'text-left'}`}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.target.select()}
        />
      );
    }

    const raw = row[field];
    const display = isNumber ? (Number(raw) || 0).toLocaleString() : (raw !== undefined && raw !== null ? String(raw) : '');

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setEditingCell({ id: row.id, field });
          setEditVal(raw !== undefined && raw !== null ? String(raw) : '');
        }}
        className={`w-full h-full cursor-text hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-1 py-0.5 transition-colors ${align === 'right' ? 'text-right font-mono' : align === 'center' ? 'text-center' : 'text-left'}`}
      >
        {display}
      </div>
    );
  };

  // 실시간 DB 소요량 조회
  const fetchOrderReqs = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch(`/api/purchase/order-req-confirm?date=${today}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setRows(json.data);
        setIsDbLoaded(true);
      }
    } catch (e) {
      console.warn('DB 소요량 조회 실패, 기본 데이터 유지:', e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrderReqs();
  }, []);

  // Filter by 매입처
  const filteredRows = useMemo(() => {
    if (selectedSupplier === 'ALL') return rows;
    return rows.filter((r) => r.supplier.includes(selectedSupplier));
  }, [rows, selectedSupplier]);

  // Grand totals
  const totalAmt = useMemo(() => {
    return filteredRows.reduce((acc, r) => acc + r.orderAmt, 0);
  }, [filteredRows]);

  const totalQty = useMemo(() => {
    return filteredRows.reduce((acc, r) => acc + r.orderQty, 0);
  }, [filteredRows]);

  const handleQtyChange = (id: number, val: string) => {
    const num = Number(val) || 0;
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            orderQty: num,
            orderAmt: num * r.unitPrice,
          };
        }
        return r;
      })
    );
  };

  // 계산수량을 발주수량으로 일괄 적용
  const handleApplyCalcQtyAll = () => {
    setRows((prev) =>
      prev.map((r) => {
        const targetQty = r.calcQty > 0 ? Math.ceil(r.calcQty) : 0;
        return {
          ...r,
          orderQty: targetQty,
          orderAmt: targetQty * r.unitPrice,
        };
      })
    );
  };

  // 발주수량 전체 0으로 초기화
  const handleClearQtyAll = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        orderQty: 0,
        orderAmt: 0,
      }))
    );
  };

  const handleSave = async () => {
    const validItems = rows.filter((r) => r.orderQty > 0);
    if (validItems.length === 0) {
      alert('발주수량이 1 이상인 품목이 없습니다. 발주할 수량을 먼저 입력해주세요.');
      return;
    }

    const totalOrderAmount = validItems.reduce((acc, r) => acc + r.orderAmt, 0);
    const confirmed = window.confirm(
      `[최종 발주 검토 및 승인]\n\n` +
      `• 발주 대상 품목: ${validItems.length}개 품목\n` +
      `• 총 발주 금액: ${totalOrderAmount.toLocaleString()}원\n\n` +
      `사람이 최종 검토한 내용으로 ERP 정식 발주서를 생성하시겠습니까?`
    );

    if (!confirmed) return;

    try {
      const itemsToConfirm = validItems.map((r) => ({
        materialCode: (r as any).materialCode || ('MAT-' + r.id.toString().padStart(4, '0')),
        itemName: r.itemName,
        spec: r.spec,
        unit: r.unit,
        category: r.category,
        partnerId: (r as any).partnerId || r.supplier.replace(/[^a-zA-Z0-9가-힣]/g, ''),
        supplier: r.supplier,
        orderQty: r.orderQty,
        unitPrice: r.unitPrice,
        minOrderQty: r.minOrderQty,
        orderUnitQty: r.orderUnitQty,
        expectedBoxQty: r.incomingScheduledBox,
        currentStock: r.currentStock,
      }));

      const res = await fetch('/api/purchase/order-req-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDate: new Date().toISOString().slice(0, 10),
          items: itemsToConfirm,
          createdBy: 'admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ 발주소요량확정이 정상 완료되었습니다!\n\n' + (data.message || '협력사별 정식 발주서가 데이터베이스에 저장되었습니다.'));
        fetchOrderReqs();
      } else {
        alert('발주 처리 안내: ' + (data.error || '저장 중 오류가 발생했습니다.'));
      }
    } catch (err: any) {
      alert('발주소요량확정 처리 실패: ' + err.message);
    }
  };

  const handleReset = () => {
    fetchOrderReqs();
    setSelectedSupplier('ALL');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f2f5] select-none text-[12.5px] font-sans">
      {/* 1. 상단 다크 헤더 바 (화면 캡처 2026-10-30 155746.png 정확 일치) */}
      <div className="h-[32px] bg-[#333333] border-b border-[#222222] px-3 flex items-center justify-between text-white shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[#4caf50] rounded-2xs inline-block" />
          <h1 className="text-[13px] font-bold tracking-tight text-white">발주소요량확정</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleApplyCalcQtyAll}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xs text-[11px] font-bold transition-colors shadow-2xs cursor-pointer border border-amber-700"
            title="시스템이 계산한 순부족량을 발주수량에 일괄 적용합니다."
          >
            추천수량 일괄적용
          </button>
          <button
            type="button"
            onClick={handleClearQtyAll}
            className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-xs text-[11px] font-medium transition-colors shadow-2xs cursor-pointer border border-gray-700"
            title="발주수량을 전체 0으로 초기화하여 원하는 항목만 입력합니다."
          >
            수량 비우기
          </button>
          <button
            type="button"
            onClick={fetchOrderReqs}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 bg-[#607d8b] hover:bg-[#546e7a] disabled:bg-gray-600 text-white rounded-xs text-[11px] font-medium transition-colors shadow-2xs cursor-pointer border border-[#455a64]"
          >
            <Search size={12} className="stroke-[2.5]" />
            {isLoading ? '조회중...' : '조회'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xs text-[11px] font-bold transition-colors shadow-2xs cursor-pointer border border-blue-700"
            title="사람이 최종 검토한 수량으로 정식 발주서를 생성합니다."
          >
            <Save size={12} className="stroke-[2.5]" />
            발주확정(저장)
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1 bg-[#607d8b] hover:bg-[#546e7a] text-white rounded-xs text-[11px] font-medium transition-colors shadow-2xs cursor-pointer border border-[#455a64]"
          >
            <RotateCcw size={12} className="stroke-[2.5]" />
            새로고침
          </button>
          <button
            type="button"
            onClick={() => alert('도움말: 발주소요량확정 화면')}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 text-white cursor-pointer ml-1 text-[11px] font-bold"
          >
            <HelpCircle size={13} />
          </button>
        </div>
      </div>

      {/* 2. 조건 검색 바 (매입처 ALL + 우측 데이터수: 76) */}
      <div className="bg-[#f5f6f8] border-b border-[#cccccc] px-3 py-1 flex items-center justify-between shrink-0 h-[30px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700 text-[11px]">매입처</span>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="bg-white border border-gray-300 px-2 py-0.5 text-[11px] font-medium rounded-xs shadow-2xs w-[180px] h-[22px] outline-none focus:border-blue-500"
          >
            <option value="ALL">ALL</option>
            <option value="대림">[네트웍스]대림</option>
            <option value="지에스리테일">[지에스리테일]</option>
            <option value="다미푸드텍">다미푸드텍</option>
            <option value="더원씨푸드">더원씨푸드</option>
            <option value="동방푸드마스터">동방푸드마스터</option>
            <option value="차별화상회">차별화상회</option>
            <option value="이프린팅">이프린팅</option>
            <option value="NS유통">NS유통</option>
            <option value="SPC삼립">SPC삼립</option>
          </select>
        </div>

        <div className="text-[11px] text-gray-700 font-semibold bg-white px-2.5 py-0.5 rounded-xs border border-gray-300 shadow-2xs">
          데이터수: <span className="font-bold text-blue-700">76</span>
        </div>
      </div>

      {/* 3. 대형 데이터 그리드 (화면 캡처 2026-10-30 155746.png 정확 일치 21개 헤더 및 데이터) */}
      <div className="flex-1 p-0.5 min-h-0 overflow-hidden flex flex-col bg-white">
        <div className="flex-1 min-h-0 overflow-auto border border-[#a4abb6]">
          <EditableTableWrapper><table className="w-full min-w-full border-collapse text-[12.5px] font-sans">
            <thead className="sticky top-0 z-20 bg-[#c5cbf0] text-gray-900 font-semibold border-b border-[#9098aa]">
              <tr className="h-[32px] leading-tight text-center whitespace-nowrap font-bold">
                {/* 행 인덱스 헤더 */}
                <th className="border border-[#9098aa] px-1 py-0.5 bg-[#e2e6f3] w-[32px] min-w-[32px]"></th>

                {/* 구분 */}
                <th className="border border-[#9098aa] px-1 py-0.5 w-[55px] min-w-[55px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>구분</span>
                    
                  </div>
                </th>

                {/* 품명 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[280px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>품명</span>
                    
                  </div>
                </th>

                {/* 규격 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[120px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>규격</span>
                    
                  </div>
                </th>

                {/* 단위 */}
                <th className="border border-[#9098aa] px-1 py-0.5 w-[45px] min-w-[45px] text-center">
                  단위
                </th>

                {/* 거래처 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[160px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>거래처</span>
                    
                  </div>
                </th>

                {/* 발주단위 ∨ */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[65px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>발주단위</span>
                    
                  </div>
                </th>

                {/* 최소발주수량 (2줄) */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[65px] text-center">
                  <span>최소발주수량</span>
                </th>

                {/* 발주수량 */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[65px] text-center">
                  발주수량
                </th>

                {/* 발주단가 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[75px] text-center">
                  발주단가
                </th>

                {/* 발주금액 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[90px] text-center">
                  발주금액
                </th>

                {/* 발주계산수량 (2줄) */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[75px] text-center">
                  <span>발주계산수량</span>
                </th>

                {/* Unit 수량 */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[65px] text-center">
                  Unit 수량
                </th>

                {/* 발주단위수량 (2줄) */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[75px] text-center">
                  <span>발주단위수량</span>
                </th>

                {/* 조달기간 (2줄) */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[55px] text-center">
                  <span>조달기간</span>
                </th>

                {/* 거래처재고 */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[75px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>거래처재고</span>
                    
                  </div>
                </th>

                {/* 안전재고 */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[65px] text-center">
                  안전재고
                </th>

                {/* 현재고 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[75px] text-center">
                  현재고
                </th>

                {/* 입고예정량(BOX) (2줄) */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[80px] text-center">
                  <span>입고예정량(BOX)</span>
                </th>

                {/* 입고예정량 */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[75px] text-center">
                  입고예정량
                </th>

                {/* 재고수량 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[75px] text-center">
                  재고수량
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="h-[21px] border-b border-gray-300 hover:bg-[#eef3fb] bg-white text-gray-900"
                >
                  {/* 행 인덱스 번호 */}
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center text-gray-700 bg-[#f4f5f8] font-mono text-[10px]">
                    {row.id}
                  </td>

                  {/* 구분 (원재료 / 부자재) */}
                  <td className="border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-center font-medium">
                    {row.category}
                  </td>

                  {/* 품명 */}
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-left font-medium ">
                    {row.itemName}
                  </td>

                  {/* 규격 */}
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-left text-gray-800 ">
                    {row.spec}
                  </td>

                  {/* 단위 */}
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center text-gray-700">
                    {row.unit}
                  </td>

                  {/* 거래처 (스크린샷처럼 빈값이거나 [네트웍스]대림 등 표시 + 드롭다운 화살표 느낌) */}
                  <td className="border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-left ">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{row.supplier}</span>
                      
                    </div>
                  </td>

                  {/* 발주단위 (box ∨) */}
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center text-gray-700">
                    <div className="flex items-center justify-center gap-0.5">
                      <span>{row.orderUnit}</span>
                      
                    </div>
                  </td>

                  {/* 최소발주수량 */}
                  <td className="border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-right font-mono text-gray-800">
                    {row.minOrderQty}
                  </td>

                  {/* 발주수량 (입력 가능 화이트 셀) */}
                  <td className="border border-gray-300 whitespace-nowrap p-0 text-right font-mono bg-white">
                    <input
                      type="number"
                      value={row.orderQty}
                      onChange={(e) => handleQtyChange(row.id, e.target.value)}
                      className="w-full h-full text-right font-bold text-gray-900 border-none outline-none focus:ring-1 focus:ring-blue-500 bg-transparent px-1.5"
                    />
                  </td>

                  {/* 발주단가 */}
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-800">
                    {row.unitPrice.toLocaleString()}
                  </td>

                  {/* 발주금액 */}
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono font-medium text-gray-900">
                    {row.orderAmt.toLocaleString()}
                  </td>

                  {/* 발주계산수량 */}
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-700">
                    {row.calcQty.toLocaleString()}
                  </td>

                  {/* Unit 수량 */}
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-700">
                    {row.unitQty}
                  </td>

                  {/* 발주단위수량 */}
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-700">
                    {row.orderUnitQty.toLocaleString()}
                  </td>

                  {/* 조달기간 */}
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center font-mono text-gray-700">
                    {row.leadTime}
                  </td>

                  {/* 거래처재고 */}
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-700">
                    {row.clientStock > 0 ? row.clientStock.toLocaleString() : '0'}
                  </td>

                  {/* 안전재고 */}
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-700">
                    {row.safetyStock.toLocaleString()}
                  </td>

                  {/* 현재고 (음수 적색 볼드) */}
                  <td
                    className={`border border-gray-300 px-2 py-0.5 text-right font-mono ${
                      row.currentStock < 0 ? 'text-red-600 font-bold' : 'text-gray-800'
                    }`}
                  >
                    {row.currentStock.toLocaleString()}
                  </td>

                  {/* 입고예정량(BOX) */}
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-700">
                    {row.incomingScheduledBox}
                  </td>

                  {/* 입고예정량 */}
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-700">
                    {row.incomingScheduled}
                  </td>

                  {/* 재고수량 (음수 적색 볼드) */}
                  <td
                    className={`border border-gray-300 px-2 py-0.5 text-right font-mono ${
                      row.stockQty < 0 ? 'text-red-600 font-bold' : 'text-gray-800'
                    }`}
                  >
                    {row.stockQty.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* 하단 요약 합계 행 (화면 캡처 2026-10-30 155746.png 일치: 연노랑 배경, 52,381,640원) */}
            <tfoot className="sticky bottom-0 z-20 bg-[#ffffcc] border-t-2 border-[#9098aa] font-bold text-gray-900 shadow-inner">
              <tr className="h-[25px]">
                {/* 인덱스 열 빈칸 */}
                <td className="border border-[#9098aa] px-1 py-1 bg-[#ffffcc]"></td>

                {/* 구분 */}
                <td className="border border-[#9098aa] px-1.5 py-1 text-center font-bold">합계</td>

                {/* 품명 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* 규격 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* 단위 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* 거래처 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* 발주단위 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* 최소발주수량 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* 발주수량 합계 */}
                <td className="border border-[#9098aa] px-1.5 py-1 text-right font-mono font-bold text-blue-900">
                  {totalQty.toLocaleString()}
                </td>

                {/* 발주단가 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* 발주금액 총합계 */}
                <td className="border border-[#9098aa] px-2 py-1 text-right font-mono text-gray-900 font-bold text-[12px]">
                  {totalAmt.toLocaleString()}
                </td>

                {/* 발주계산수량 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* Unit 수량 */}
                <td className="border border-[#9098aa] px-2 py-1 bg-[#ffffcc]"></td>

                {/* 발주단위수량 */}
                <td className="border border-[#9098aa] px-2 py-1 bg-[#ffffcc]"></td>

                {/* 조달기간 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* 거래처재고 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* 안전재고 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* 현재고 */}
                <td className="border border-[#9098aa] px-1.5 py-1 bg-[#ffffcc]"></td>

                {/* 입고예정량(BOX) */}
                <td className="border border-[#9098aa] px-2 py-1 bg-[#ffffcc]"></td>

                {/* 입고예정량 */}
                <td className="border border-[#9098aa] px-2 py-1 bg-[#ffffcc]"></td>

                {/* 재고수량 */}
                <td className="border border-[#9098aa] px-2 py-1 bg-[#ffffcc]"></td>
              </tr>
            </tfoot>
          </table></EditableTableWrapper>
        </div>
      </div>
    </div>
  );
};
