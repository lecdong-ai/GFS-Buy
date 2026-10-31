'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { HelpCircle, Plus, RotateCcw, Calendar, Eye, Save } from 'lucide-react';

import { useInlineEdit } from '@/components/common/EditableCell';
import { EditableTableWrapper } from '@/components/common/EditableTableWrapper';
export interface MatOrderNormalItem {
  id: number;
  category: string; // 구분 (원재료, 부재료)
  variety: string; // 품종 (육가공, 소스, 용기, 곡류 등)
  itemName: string; // 품명
  spec: string; // 규격
  unit: string; // 단위
  orderQty: number; // 발주수량
  unitPrice: number; // 발주단가
  orderAmt: number; // 발주금액
  recvDate: string; // 입고일
  minOrderQty: number; // 최소발주수량
  unitQty: number; // Unit 수량
  safetyStock: number; // 안전재고
  currentStock: number; // 현재고
  stockDesc: string; // 재고설명
  incomingScheduled: number; // 입고예정량
  totalStockQty: number; // 합계수량
  lotNo: string; // LOT no.
  remark: string; // 비고
}

export const INITIAL_NORMAL_DATA: MatOrderNormalItem[] = [
  {
    id: 1,
    category: '원재료',
    variety: '곡류',
    itemName: '국내산 경기미 20kg',
    spec: '20kg/포',
    unit: '포',
    orderQty: 100,
    unitPrice: 52000,
    orderAmt: 5200000,
    recvDate: '2026-10-31',
    minOrderQty: 50,
    unitQty: 1,
    safetyStock: 30,
    currentStock: 45,
    stockDesc: '정상 재고 유지',
    incomingScheduled: 0,
    totalStockQty: 45,
    lotNo: 'LOT-261030-R01',
    remark: '주말 밥류 증산 대비',
  },
  {
    id: 2,
    category: '원재료',
    variety: '김류',
    itemName: '[상온]1/2절김',
    spec: '200매*30ea',
    unit: 'box',
    orderQty: 5,
    unitPrice: 48000,
    orderAmt: 240000,
    recvDate: '2026-10-31',
    minOrderQty: 2,
    unitQty: 30,
    safetyStock: 10,
    currentStock: 8,
    stockDesc: '적정',
    incomingScheduled: 0,
    totalStockQty: 8,
    lotNo: 'LOT-261030-G01',
    remark: '',
  },
  {
    id: 3,
    category: '원재료',
    variety: '김류',
    itemName: '[상온]삼각김밥김',
    spec: '100매*32ea',
    unit: 'box',
    orderQty: 4,
    unitPrice: 52000,
    orderAmt: 208000,
    recvDate: '2026-10-31',
    minOrderQty: 2,
    unitQty: 32,
    safetyStock: 15,
    currentStock: 12,
    stockDesc: '정상',
    incomingScheduled: 0,
    totalStockQty: 12,
    lotNo: 'LOT-261030-G02',
    remark: '',
  },
  {
    id: 4,
    category: '원재료',
    variety: '수산가공',
    itemName: '[냉장]다진맛살',
    spec: '10kg*2ea',
    unit: 'box',
    orderQty: 6,
    unitPrice: 52000,
    orderAmt: 312000,
    recvDate: '2026-10-31',
    minOrderQty: 2,
    unitQty: 2,
    safetyStock: 8,
    currentStock: 5,
    stockDesc: '주의',
    incomingScheduled: 0,
    totalStockQty: 5,
    lotNo: 'LOT-261030-C01',
    remark: '냉장유지 필수',
  },
  {
    id: 5,
    category: '원재료',
    variety: '절임류',
    itemName: '[냉장]볶음김치',
    spec: '5kg*3ea',
    unit: 'box',
    orderQty: 12,
    unitPrice: 42000,
    orderAmt: 504000,
    recvDate: '2026-10-31',
    minOrderQty: 3,
    unitQty: 3,
    safetyStock: 20,
    currentStock: 15,
    stockDesc: '정상',
    incomingScheduled: 0,
    totalStockQty: 15,
    lotNo: 'LOT-261030-K01',
    remark: '',
  },
  {
    id: 6,
    category: '원재료',
    variety: '난가공',
    itemName: '[냉장]계란구이',
    spec: '1020g*12ea',
    unit: 'box',
    orderQty: 8,
    unitPrice: 78000,
    orderAmt: 624000,
    recvDate: '2026-10-31',
    minOrderQty: 2,
    unitQty: 12,
    safetyStock: 15,
    currentStock: 10,
    stockDesc: '정상',
    incomingScheduled: 0,
    totalStockQty: 10,
    lotNo: 'LOT-261030-E01',
    remark: '',
  },
  {
    id: 7,
    category: '부재료',
    variety: '용기',
    itemName: '두레)ET-30 용기',
    spec: '50ea*2줄',
    unit: 'box',
    orderQty: 10,
    unitPrice: 38000,
    orderAmt: 380000,
    recvDate: '2026-10-31',
    minOrderQty: 5,
    unitQty: 2,
    safetyStock: 25,
    currentStock: 18,
    stockDesc: '정상',
    incomingScheduled: 0,
    totalStockQty: 18,
    lotNo: 'LOT-261030-D01',
    remark: '',
  },
  {
    id: 8,
    category: '부재료',
    variety: '용기',
    itemName: '정우)PP]5찬도시락용기',
    spec: '80ea*4pk/box',
    unit: 'box',
    orderQty: 8,
    unitPrice: 72000,
    orderAmt: 576000,
    recvDate: '2026-10-31',
    minOrderQty: 4,
    unitQty: 4,
    safetyStock: 20,
    currentStock: 14,
    stockDesc: '정상',
    incomingScheduled: 0,
    totalStockQty: 14,
    lotNo: 'LOT-261030-J01',
    remark: '',
  },
];

export const MatOrderNormalView: React.FC = () => {
  const [supplier, setSupplier] = useState('[네트웍스]광주식품');
  const [rows, setRows] = useState<MatOrderNormalItem[]>(INITIAL_NORMAL_DATA);

  useEffect(() => {
    fetch('/api/purchase/order-req-confirm')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: MatOrderNormalItem[] = json.data.map((r: any, idx: number) => ({
            id: r.id || idx + 1,
            category: r.category || '원재료',
            variety: '원부자재',
            itemName: r.materialName || '원료',
            spec: r.spec || '',
            unit: r.unit || 'kg',
            orderQty: r.requiredQty || 10,
            unitPrice: r.unitPrice || 2500,
            orderAmt: (r.requiredQty || 10) * (r.unitPrice || 2500),
            inDate: '2026-10-31',
            minOrderQty: 10,
            unitQty: 1,
            safetyStock: 50,
            currentStock: r.currentStock || 0,
            stockDesc: '정상',
            expectedInQty: 0,
            totalQty: r.requiredQty || 10,
            lotNo: '',
            usageQty: r.requiredQty || 10,
            remark: r.remark || '',
          }));
          setRows(loaded);
        }
      })
      .catch((err) => console.error('Failed to load normal order requirements', err));
  }, []);

  const handleSaveOrder = async () => {
    try {
      const res = await fetch('/api/purchase/order-req-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_and_order',
          deliveryDate: '2026-10-31',
          items: rows.map((r) => ({
            materialCode: `MAT-${r.id}`,
            materialName: r.itemName,
            category: r.category,
            requiredQty: r.orderQty,
            currentStock: r.currentStock,
            shortageQty: r.orderQty,
            orderQty: r.orderQty,
            unitPrice: r.unitPrice,
            amount: r.orderAmt,
            partnerId: 'V001',
            partnerName: supplier,
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('자재발주가 성공적으로 확정되어 발주서가 생성되었습니다.');
      } else {
        alert('발주 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('발주 저장 중 오류: ' + err.message);
    }
  };

  const totalAmt = useMemo(() => {
    return rows.reduce((acc, r) => acc + r.orderAmt, 0);
  }, [rows]);

  const totalQty = useMemo(() => {
    return rows.reduce((acc, r) => acc + r.orderQty, 0);
  }, [rows]);

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

  const handleNew = () => {
    alert('새로운 일반 자재발주 항목 등록 모달을 호출합니다.');
  };

  const handleReset = () => {
    setRows(INITIAL_NORMAL_DATA);
  };

  const handleViewProducts = (item: MatOrderNormalItem) => {
    alert(`[${item.itemName}]을 사용하는 생산 레시피 및 제품 목록을 조회합니다.`);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f2f5] select-none text-[12.5px] font-sans">
      {/* 1. 상단 다크 헤더 바 (101223.png 원본 일치) */}
      <div className="h-[32px] bg-[#333333] border-b border-[#222222] px-3 flex items-center justify-between text-white shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[#4caf50] rounded-2xs inline-block" />
          <h1 className="text-[13px] font-bold tracking-tight text-white">자재발주 (일반)</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSaveOrder}
            className="flex items-center gap-1 px-3 py-1 bg-[#2e7d32] hover:bg-[#1b5e20] text-white rounded-xs text-[11px] font-bold transition-colors shadow-2xs cursor-pointer border border-[#1b5e20]"
          >
            <Save size={12} className="stroke-[2.5]" />
            발주확정/저장
          </button>
          <button
            type="button"
            onClick={handleNew}
            className="flex items-center gap-1 px-3 py-1 bg-[#607d8b] hover:bg-[#546e7a] text-white rounded-xs text-[11px] font-medium transition-colors shadow-2xs cursor-pointer border border-[#455a64]"
          >
            <Plus size={12} className="stroke-[2.5]" />
            신규
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
            onClick={() => alert('도움말: 자재발주 (일반) 화면')}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 text-white cursor-pointer ml-1 text-[11px] font-bold"
          >
            <HelpCircle size={13} />
          </button>
        </div>
      </div>

      {/* 2. 조건 검색 바 (101223.png 원본 일치) */}
      <div className="bg-[#f5f6f8] border-b border-[#cccccc] px-3 py-1 flex items-center justify-between shrink-0 h-[30px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-700 text-[11px]">발주일자</span>
            <div className="flex items-center bg-white border border-gray-300 px-2 py-0.5 rounded-xs shadow-2xs text-[11px]">
              <span className="font-medium text-gray-800 mr-2">2026년 10월 30일 금요일</span>
              <Calendar size={12} className="text-gray-500" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-700 text-[11px]">거래처</span>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="bg-white border border-gray-300 px-2 py-0.5 text-[11px] font-medium rounded-xs shadow-2xs w-[180px] h-[22px] outline-none focus:border-blue-500"
            >
              <option value="[네트웍스]광주식품">[네트웍스]광주식품</option>
              <option value="[네트웍스]대림">[네트웍스]대림</option>
              <option value="[네트웍스]CJ">[네트웍스]CJ</option>
              <option value="다미푸드텍">다미푸드텍</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-gray-700 font-semibold bg-white px-2.5 py-0.5 rounded-xs border border-gray-300 shadow-2xs">
          LblCnt_M: <span className="font-bold text-blue-700">{rows.length}</span>
        </div>
      </div>

      {/* 3. 대형 데이터 그리드 (101223.png 정확 일치 19개 컬럼) */}
      <div className="flex-1 p-0.5 min-h-0 overflow-hidden flex flex-col bg-white">
        <div className="flex-1 min-h-0 overflow-auto border border-[#a4abb6]">
          <EditableTableWrapper><table className="w-full min-w-full border-collapse text-[12.5px] font-sans">
            <thead className="sticky top-0 z-20 bg-[#c5cbf0] text-gray-900 font-semibold border-b border-[#9098aa]">
              <tr className="h-[32px] leading-tight text-center whitespace-nowrap font-bold">
                {/* 구분 */}
                <th className="border border-[#9098aa] px-1.5 py-0.5 w-[55px] min-w-[55px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>구분</span>
                    
                  </div>
                </th>

                {/* 품종 */}
                <th className="border border-[#9098aa] px-1.5 py-0.5 w-[65px] min-w-[65px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>품종</span>
                    
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

                {/* 입고일 */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[75px] text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>입고일</span>
                    
                  </div>
                </th>

                {/* 최소발주수량 (2줄) */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[65px] text-center">
                  <span>최소발주수량</span>
                </th>

                {/* Unit 수량 */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[65px] text-center">
                  Unit 수량
                </th>

                {/* 안전재고 */}
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[65px] text-center">
                  안전재고
                </th>

                {/* 현재고 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[65px] text-center">
                  현재고
                </th>

                {/* 재고설명 (101223.png 컬럼) */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[80px] text-center">
                  재고설명
                </th>

                {/* 입고예정량 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[75px] text-center">
                  입고예정량
                </th>

                {/* 합계수량 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[65px] text-center">
                  합계수량
                </th>

                {/* LOT no. */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[100px] text-center">
                  LOT no.
                </th>

                {/* 비고 */}
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[85px] text-center">
                  비고
                </th>

                {/* 사용제품보기 (2줄) */}
                <th className="border border-[#9098aa] px-1.5 py-0.5 min-w-[65px] text-center">
                  <span>사용제품보기</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="h-[21px] border-b border-gray-300 hover:bg-[#eef3fb] bg-white text-gray-900"
                >
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center text-gray-700">
                    {row.category}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-center text-gray-700 font-medium">
                    {row.variety}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-left font-medium text-gray-900 ">
                    {row.itemName}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-center text-gray-700 ">
                    {row.spec}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center text-gray-700">
                    {row.unit}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap p-0 text-right font-mono bg-white">
                    <input
                      type="number"
                      value={row.orderQty}
                      onChange={(e) => handleQtyChange(row.id, e.target.value)}
                      className="w-full h-full text-right font-bold text-gray-900 border-none outline-none focus:ring-1 focus:ring-blue-500 bg-transparent px-1.5"
                    />
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-800">
                    {row.unitPrice.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono font-medium text-gray-900">
                    {row.orderAmt.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center font-mono text-gray-800">
                    {row.recvDate}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-right font-mono text-gray-800">
                    {row.minOrderQty}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-right font-mono text-gray-800">
                    {row.unitQty}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-right font-mono text-gray-700">
                    {row.safetyStock.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-800">
                    {row.currentStock.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-center text-gray-700 ">
                    {row.stockDesc}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-700">
                    {row.incomingScheduled.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono font-medium text-gray-900">
                    {row.totalStockQty.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-center font-mono text-gray-600 text-[10px]">
                    {row.lotNo}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-left text-gray-600 ">
                    {row.remark}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 whitespace-nowrap px-1 py-0.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleViewProducts(row)}
                      className="px-1.5 py-0.5 bg-[#4a6b82] hover:bg-[#3b5568] text-white rounded-2xs text-[10px] flex items-center justify-center gap-0.5 mx-auto shadow-2xs"
                    >
                      <Eye size={10} />
                      보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* 하단 요약 합계 행 (101223.png 일치: 연노랑 배경) */}
            <tfoot className="sticky bottom-0 z-20 bg-[#ffffcc] border-t-2 border-[#9098aa] font-bold text-gray-900 shadow-inner">
              <tr className="h-[25px]">
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1.5 py-1 text-center font-bold">합계</td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1 text-right font-mono text-blue-900 font-bold">
                  {totalQty.toLocaleString()}
                </td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1 text-right font-mono text-gray-900 font-bold">
                  {totalAmt.toLocaleString()}
                </td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-2 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
                <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-[#9098aa] px-1 py-1"></td>
              </tr>
            </tfoot>
          </table></EditableTableWrapper>
        </div>
      </div>
    </div>
  );
};
