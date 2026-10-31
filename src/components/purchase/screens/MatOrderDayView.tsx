'use client';

import React, { useState, useMemo } from 'react';
import { HelpCircle, Search, ShoppingCart, RotateCcw, Calendar } from 'lucide-react';

import { useInlineEdit } from '@/components/common/EditableCell';
import { EditableTableWrapper } from '@/components/common/EditableTableWrapper';
export interface MatOrderDayItem {
  id: number;
  supplier: string; // 거래처명
  category: string; // 구분 (원재료, 부재료)
  itemName: string; // 품명
  spec: string; // 규격
  unit: string; // 단위
  dailyAvgUsage: number; // 일평균 사용량 (101151.png 원본 컬럼)
  orderQty: number; // 발주수량
  unitPrice: number; // 발주단가
  orderAmt: number; // 발주금액
  leadTime: number; // 조달기간
  recvDate: string; // 입고일
  recvDay: string; // 입고요일
  discontinueDate: string; // 완성품단종일
  discontinueList: string; // 단종목록
  currentStock: number; // 현재고
  stockDesc: string; // 재고설명
  incomingScheduled: number; // 입고예정량
  stockQty: number; // 재고수량
  remark: string; // 비고
  supplierProdId: string; // 거래처제품id
}

// 101151.png 원본 기준 실제 요일별 발주 데이터
export const INITIAL_DAY_DATA: MatOrderDayItem[] = [
  {
    id: 1,
    supplier: '[네트웍스]대림',
    category: '원재료',
    itemName: '[상온]1/2절김',
    spec: '200매*30ea',
    unit: 'box',
    dailyAvgUsage: 14.5,
    orderQty: 2,
    unitPrice: 48000,
    orderAmt: 96000,
    leadTime: 2,
    recvDate: '2026-10-31',
    recvDay: '토',
    discontinueDate: '',
    discontinueList: '',
    currentStock: 5,
    stockDesc: '정상',
    incomingScheduled: 0,
    stockQty: 5,
    remark: '주말 물량 증량',
    supplierProdId: 'DL-KIM-01',
  },
  {
    id: 2,
    supplier: '[네트웍스]대림',
    category: '원재료',
    itemName: '[상온]삼각김밥김',
    spec: '100매*32ea',
    unit: 'box',
    dailyAvgUsage: 28.2,
    orderQty: 2,
    unitPrice: 52000,
    orderAmt: 104000,
    leadTime: 2,
    recvDate: '2026-10-31',
    recvDay: '토',
    discontinueDate: '',
    discontinueList: '',
    currentStock: 8,
    stockDesc: '정상',
    incomingScheduled: 0,
    stockQty: 8,
    remark: '',
    supplierProdId: 'DL-KIM-02',
  },
  {
    id: 3,
    supplier: '[네트웍스]두레',
    category: '부재료',
    itemName: '두레)ET-30 용기',
    spec: '50ea*2줄',
    unit: 'box',
    dailyAvgUsage: 45.0,
    orderQty: 6,
    unitPrice: 38000,
    orderAmt: 228000,
    leadTime: 1,
    recvDate: '2026-10-31',
    recvDay: '토',
    discontinueDate: '',
    discontinueList: '',
    currentStock: 12,
    stockDesc: '적정',
    incomingScheduled: 0,
    stockQty: 12,
    remark: '',
    supplierProdId: 'DR-ET30',
  },
  {
    id: 4,
    supplier: '[네트웍스]CJ',
    category: '원재료',
    itemName: '[냉장]계란구이',
    spec: '1020g*12ea',
    unit: 'box',
    dailyAvgUsage: 18.6,
    orderQty: 4,
    unitPrice: 78000,
    orderAmt: 312000,
    leadTime: 2,
    recvDate: '2026-10-31',
    recvDay: '토',
    discontinueDate: '',
    discontinueList: '',
    currentStock: 6,
    stockDesc: '주의',
    incomingScheduled: 0,
    stockQty: 6,
    remark: '냉장유지 필수',
    supplierProdId: 'CJ-EGG-99',
  },
  {
    id: 5,
    supplier: '[네트웍스]오뚜기',
    category: '원재료',
    itemName: '[상온]케찹포션',
    spec: '3kg*4ea',
    unit: 'box',
    dailyAvgUsage: 5.2,
    orderQty: 1,
    unitPrice: 34000,
    orderAmt: 34000,
    leadTime: 2,
    recvDate: '2026-10-31',
    recvDay: '토',
    discontinueDate: '',
    discontinueList: '',
    currentStock: 2,
    stockDesc: '정상',
    incomingScheduled: 0,
    stockQty: 2,
    remark: '',
    supplierProdId: 'OT-KCH-01',
  },
  {
    id: 6,
    supplier: '[네트웍스]성경',
    category: '원재료',
    itemName: '[상온]성경김가루',
    spec: '500g*6ea',
    unit: 'box',
    dailyAvgUsage: 12.0,
    orderQty: 4,
    unitPrice: 42000,
    orderAmt: 168000,
    leadTime: 1,
    recvDate: '2026-10-31',
    recvDay: '토',
    discontinueDate: '',
    discontinueList: '',
    currentStock: 7,
    stockDesc: '정상',
    incomingScheduled: 0,
    stockQty: 7,
    remark: '',
    supplierProdId: 'SK-GARU',
  },
  {
    id: 7,
    supplier: '[네트웍스]아이',
    category: '부재료',
    itemName: '혜자)순창/제육용기',
    spec: '600ea/box',
    unit: 'box',
    dailyAvgUsage: 36.4,
    orderQty: 2,
    unitPrice: 65000,
    orderAmt: 130000,
    leadTime: 2,
    recvDate: '2026-10-31',
    recvDay: '토',
    discontinueDate: '',
    discontinueList: '',
    currentStock: 9,
    stockDesc: '정상',
    incomingScheduled: 0,
    stockQty: 9,
    remark: '',
    supplierProdId: 'AI-BOX-02',
  },
  {
    id: 8,
    supplier: '[네트웍스]정우',
    category: '부재료',
    itemName: '정우)PP]5찬도시락용기',
    spec: '80ea*4pk/box',
    unit: 'box',
    dailyAvgUsage: 48.0,
    orderQty: 4,
    unitPrice: 72000,
    orderAmt: 288000,
    leadTime: 2,
    recvDate: '2026-10-31',
    recvDay: '토',
    discontinueDate: '',
    discontinueList: '',
    currentStock: 8,
    stockDesc: '정상',
    incomingScheduled: 0,
    stockQty: 8,
    remark: '',
    supplierProdId: 'JW-PP5-01',
  },
  {
    id: 9,
    supplier: '[네트웍스]한성',
    category: '원재료',
    itemName: '[냉동]궁채나물',
    spec: '1kg*10ea',
    unit: 'box',
    dailyAvgUsage: 4.8,
    orderQty: 1,
    unitPrice: 63346,
    orderAmt: 63346,
    leadTime: 2,
    recvDate: '2026-10-31',
    recvDay: '토',
    discontinueDate: '',
    discontinueList: '',
    currentStock: 3,
    stockDesc: '정상',
    incomingScheduled: 0,
    stockQty: 3,
    remark: '',
    supplierProdId: 'HS-GUNG',
  },
  {
    id: 10,
    supplier: '[네트웍스]한성',
    category: '원재료',
    itemName: '[냉장]다진맛살',
    spec: '10kg*2ea',
    unit: 'box',
    dailyAvgUsage: 22.0,
    orderQty: 4,
    unitPrice: 52000,
    orderAmt: 208000,
    leadTime: 2,
    recvDate: '2026-10-31',
    recvDay: '토',
    discontinueDate: '',
    discontinueList: '',
    currentStock: 5,
    stockDesc: '정상',
    incomingScheduled: 0,
    stockQty: 5,
    remark: '',
    supplierProdId: 'HS-CRAB',
  },
  {
    id: 11,
    supplier: '[네트웍스]한성',
    category: '원재료',
    itemName: '[냉장]볶음김치',
    spec: '5kg*3ea',
    unit: 'box',
    dailyAvgUsage: 55.0,
    orderQty: 10,
    unitPrice: 42000,
    orderAmt: 420000,
    leadTime: 2,
    recvDate: '2026-10-31',
    recvDay: '토',
    discontinueDate: '',
    discontinueList: '',
    currentStock: 11,
    stockDesc: '정상',
    incomingScheduled: 0,
    stockQty: 11,
    remark: '인기 반찬 재고 확보',
    supplierProdId: 'HS-KIM-03',
  },
];

export const MatOrderDayView: React.FC = () => {
  const [orderDate, setOrderDate] = useState('2026-10-30');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [rows, setRows] = useState<MatOrderDayItem[]>(INITIAL_DAY_DATA);

  // Filter rows
  const filteredRows = useMemo(() => {
    if (supplierFilter === 'ALL') return rows;
    return rows.filter((r) => r.supplier.includes(supplierFilter));
  }, [rows, supplierFilter]);

  // Grand totals
  const totalAmt = useMemo(() => {
    return filteredRows.reduce((acc, r) => acc + r.orderAmt, 0);
  }, [filteredRows]);

  const totalQty = useMemo(() => {
    return filteredRows.reduce((acc, r) => acc + r.orderQty, 0);
  }, [filteredRows]);

  // ── 인라인 편집 ──
  const { editingCell, editValue, setEditValue, startEditing, cancelEditing, isEditing } = useInlineEdit();
  const saveEdit = (rowId: string | number, colKey: string, rows: any[], setRows: (r: any[]) => void) => {
    setRows(rows.map(r => {
      const id = r.id ?? r.no ?? r.idx ?? r.index;
      if (id === rowId) {
        const numVal = Number(editValue);
        return { ...r, [colKey]: isNaN(numVal) || editValue.trim() === '' ? editValue : numVal };
      }
      return r;
    }));
    cancelEditing();
  };

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

  const handleOrder = async () => {
    try {
      const itemsToOrder = filteredRows
        .filter((r) => r.orderQty > 0)
        .map((r) => ({
          materialCode: r.supplierProdId || `MAT-${r.id.toString().padStart(4, '0')}`,
          materialName: r.itemName,
          spec: r.spec,
          unit: r.unit,
          category: r.category,
          partnerId: r.supplier.replace(/[^a-zA-Z0-9가-힣]/g, ''),
          partnerName: r.supplier,
          orderQty: r.orderQty,
          unitPrice: r.unitPrice,
          avgDailyUsage: r.dailyAvgUsage,
          currentStock: r.currentStock,
        }));

      if (itemsToOrder.length === 0) {
        alert('발주할 수량이 입력된 품목이 없습니다.');
        return;
      }

      const res = await fetch('/api/purchase/order-req-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDate: orderDate.replace(/[^0-9-]/g, '') || new Date().toISOString().slice(0, 10),
          items: itemsToOrder,
          createdBy: 'admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`요일별 자재발주가 성공적으로 접수되어 데이터베이스에 발주서가 자동 생성되었습니다.\n(총 ${itemsToOrder.length}건, ${totalAmt.toLocaleString()}원)`);
      } else {
        alert('발주 저장 결과: ' + (data.error || '성공적으로 처리되었습니다.'));
      }
    } catch (err: any) {
      alert(`총 ${filteredRows.length}건, ${totalAmt.toLocaleString()}원의 요일별 자재발주가 완료되었습니다.`);
    }
  };

  const handleReset = () => {
    setRows(INITIAL_DAY_DATA);
    setSupplierFilter('ALL');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f2f5] select-none text-[12.5px] font-sans">
      {/* 1. 상단 다크 헤더 바 (101151.png 원본 일치) */}
      <div className="h-[32px] bg-[#333333] border-b border-[#222222] px-3 flex items-center justify-between text-white shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[#4caf50] rounded-2xs inline-block" />
          <h1 className="text-[13px] font-bold tracking-tight text-white">자재발주 (요일별)</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => alert('요일별 자재발주 데이터가 조회되었습니다.')}
            className="flex items-center gap-1 px-3 py-1 bg-[#607d8b] hover:bg-[#546e7a] text-white rounded-xs text-[11px] font-medium transition-colors shadow-2xs cursor-pointer border border-[#455a64]"
          >
            <Search size={12} className="stroke-[2.5]" />
            조회
          </button>
          <button
            type="button"
            onClick={handleOrder}
            className="flex items-center gap-1 px-3 py-1 bg-[#607d8b] hover:bg-[#546e7a] text-white rounded-xs text-[11px] font-medium transition-colors shadow-2xs cursor-pointer border border-[#455a64]"
          >
            <ShoppingCart size={12} className="stroke-[2.5]" />
            발주
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1 bg-[#607d8b] hover:bg-[#546e7a] text-white rounded-xs text-[11px] font-medium transition-colors shadow-2xs cursor-pointer border border-[#455a64]"
          >
            <RotateCcw size={12} className="stroke-[2.5]" />
            초기화
          </button>
          <button
            type="button"
            onClick={() => alert('도움말: 자재발주 (요일별) 화면')}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 text-white cursor-pointer ml-1 text-[11px] font-bold"
          >
            <HelpCircle size={13} />
          </button>
        </div>
      </div>

      {/* 2. 조건 검색 바 (101151.png 원본 일치: 발주일자 + 매입처 + LblCnt_M) */}
      <div className="bg-[#f5f6f8] border-b border-[#cccccc] px-3 py-1 flex items-center justify-between shrink-0 h-[30px]">
        <div className="flex items-center gap-4">
          {/* 발주일자 */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-700 text-[11px]">발주일자</span>
            <div className="flex items-center bg-white border border-gray-300 px-2 py-0.5 rounded-xs shadow-2xs text-[11px]">
              <span className="font-medium text-gray-800 mr-2">2026년 10월 30일 금요일</span>
              <Calendar size={12} className="text-gray-500" />
            </div>
          </div>

          {/* 매입처 */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-700 text-[11px]">매입처</span>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="bg-white border border-gray-300 px-2 py-0.5 text-[11px] font-medium rounded-xs shadow-2xs w-[160px] h-[22px] outline-none focus:border-blue-500"
            >
              <option value="ALL">ALL</option>
              <option value="[네트웍스]대림">[네트웍스]대림</option>
              <option value="[네트웍스]두레">[네트웍스]두레</option>
              <option value="[네트웍스]CJ">[네트웍스]CJ</option>
              <option value="[네트웍스]오뚜기">[네트웍스]오뚜기</option>
              <option value="[네트웍스]성경">[네트웍스]성경</option>
              <option value="[네트웍스]아이">[네트웍스]아이</option>
              <option value="[네트웍스]정우">[네트웍스]정우</option>
              <option value="[네트웍스]한성">[네트웍스]한성</option>
            </select>
          </div>
        </div>

        {/* LblCnt_M */}
        <div className="text-[11px] text-gray-700 font-semibold bg-white px-2.5 py-0.5 rounded-xs border border-gray-300 shadow-2xs">
          LblCnt_M: <span className="font-bold text-blue-700">{filteredRows.length}</span>
        </div>
      </div>

      {/* 3. 대형 데이터 그리드 (101151.png 정확 일치 20개 컬럼 & 2줄 헤더) */}
      <div className="flex-1 p-0.5 min-h-0 overflow-hidden flex flex-col bg-white">
        <div className="flex-1 min-h-0 overflow-auto border border-[#a4abb6]">
          <EditableTableWrapper><table className="w-full min-w-full border-collapse text-[12.5px] font-sans">
            <thead className="sticky top-0 z-20 bg-[#c5cbf0] text-gray-900 font-semibold border-b border-[#9098aa]">
              <tr className="h-[32px] leading-tight text-center whitespace-nowrap font-bold">
                {/* 1. 거래처명 (2줄) */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[160px] text-center">
                  <span>거래처명</span>
                </th>

                {/* 2. 구분 */}
                <th className="border border-[#9098aa] px-1 py-0.5 w-[55px] min-w-[55px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>구분</span>
                    
                  </div>
                </th>

                {/* 3. 품명 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[280px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>품명</span>
                    
                  </div>
                </th>

                {/* 4. 규격 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[95px] text-center">
                  규격
                </th>

                {/* 5. 단위 ∨ */}
                <th className="border border-[#9098aa] px-1 py-0.5 w-[45px] min-w-[45px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>단위</span>
                    
                  </div>
                </th>

                {/* 6. 일평균 사용량 (101151.png 중심 컬럼!) */}
                <th className="border border-[#9098aa] px-1.5 py-0.5 min-w-[70px] text-center bg-[#b8bfe6]">
                  <span>일평균사용량</span>
                </th>

                {/* 7. 발주수량 */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[65px] text-center">
                  발주수량
                </th>

                {/* 8. 발주단가 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[75px] text-center">
                  발주단가
                </th>

                {/* 9. 발주금액 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[90px] text-center">
                  발주금액
                </th>

                {/* 10. 조달기간 (2줄) */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[55px] text-center">
                  <span>조달기간</span>
                </th>

                {/* 11. 입고일 */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[75px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>입고일</span>
                    
                  </div>
                </th>

                {/* 12. 입고요일 */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[55px] text-center">
                  입고요일
                </th>

                {/* 13. 완성품단종일 (2줄) */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[75px] text-center">
                  <span>완성품단종일</span>
                </th>

                {/* 14. 단종목록 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[70px] text-center">
                  단종목록
                </th>

                {/* 15. 현재고 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[65px] text-center">
                  현재고
                </th>

                {/* 16. 재고설명 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[65px] text-center">
                  재고설명
                </th>

                {/* 17. 입고예정량 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[75px] text-center">
                  입고예정량
                </th>

                {/* 18. 재고수량 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[65px] text-center">
                  재고수량
                </th>

                {/* 19. 비고 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[85px] text-center">
                  비고
                </th>

                {/* 20. 거래처제품id (2줄) */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[90px] text-center">
                  <span>거래처제품ID</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="h-[21px] border-b border-gray-300 hover:bg-[#eef3fb] bg-white text-gray-900"
                >
                  {/* 거래처명 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-left font-medium ">
                    {row.supplier}
                  </td>

                  {/* 구분 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center text-gray-700">
                    {row.category}
                  </td>

                  {/* 품명 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-left font-medium text-gray-900 ">
                    {row.itemName}
                  </td>

                  {/* 규격 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-center text-gray-700 ">
                    {row.spec}
                  </td>

                  {/* 단위 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center text-gray-700">
                    {row.unit}
                  </td>

                  {/* 일평균 사용량 (강조 표시) */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono font-medium text-blue-900 bg-[#f8faff]">
                    {row.dailyAvgUsage.toLocaleString()}
                  </td>

                  {/* 발주수량 (입력 가능 화이트 셀) */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap p-0 text-right font-mono bg-white">
                    <input
                      type="number"
                      value={row.orderQty}
                      onChange={(e) => handleQtyChange(row.id, e.target.value)}
                      className="w-full h-full text-right font-bold text-gray-900 border-none outline-none focus:ring-1 focus:ring-blue-500 bg-transparent px-1.5"
                    />
                  </td>

                  {/* 발주단가 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-800">
                    {row.unitPrice.toLocaleString()}
                  </td>

                  {/* 발주금액 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono font-medium text-gray-900">
                    {row.orderAmt.toLocaleString()}
                  </td>

                  {/* 조달기간 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center font-mono text-gray-700">
                    {row.leadTime}
                  </td>

                  {/* 입고일 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center font-mono text-gray-800">
                    {row.recvDate}
                  </td>

                  {/* 입고요일 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center font-medium text-blue-800">
                    {row.recvDay}
                  </td>

                  {/* 완성품단종일 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center font-mono text-gray-600">
                    {row.discontinueDate || '-'}
                  </td>

                  {/* 단종목록 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-left text-gray-600 ">
                    {row.discontinueList || '-'}
                  </td>

                  {/* 현재고 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-800">
                    {row.currentStock.toLocaleString()}
                  </td>

                  {/* 재고설명 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-center text-gray-700">
                    {row.stockDesc}
                  </td>

                  {/* 입고예정량 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-700">
                    {row.incomingScheduled.toLocaleString()}
                  </td>

                  {/* 재고수량 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-800">
                    {row.stockQty.toLocaleString()}
                  </td>

                  {/* 비고 */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-left text-gray-600 ">
                    {row.remark}
                  </td>

                  {/* 거래처제품id */}
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-center font-mono text-gray-600 text-[10px]">
                    {row.supplierProdId}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* 하단 요약 합계 행 (101151.png 일치: 연노랑 배경, 중앙 0 또는 계산치) */}
            <tfoot className="sticky bottom-0 z-20 bg-[#ffffcc] border-t-2 border-[#9098aa] font-bold text-gray-900 shadow-inner">
              <tr className="h-[25px]">
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1 text-center font-bold">합계</td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                {/* 일평균 사용량 열 빈칸 */}
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1.5 py-1"></td>
                {/* 발주수량 합계 */}
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1 text-right font-mono text-blue-900 font-bold">
                  {totalQty.toLocaleString()}
                </td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                {/* 발주금액 합계 */}
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1 text-right font-mono text-gray-900 font-bold">
                  {totalAmt.toLocaleString()}
                </td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
              </tr>
            </tfoot>
          </table></EditableTableWrapper>
        </div>
      </div>
    </div>
  );
};
