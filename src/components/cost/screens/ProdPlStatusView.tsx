'use client';

import React, { useMemo } from 'react';
import { CostActionBar } from '../common/CostActionBar';
import { useCost } from '../context/CostContext';
import { INITIAL_COST_GROUP_SUMMARY } from '../data/costData';
import { RotateCw, Search } from 'lucide-react';
import { usePrintReport } from '@/context/PrintReportContext';

import { useInlineEdit } from '@/components/common/EditableCell';
import { EditableTableWrapper } from '@/components/common/EditableTableWrapper';
export const ProdPlStatusView: React.FC = () => {
  const { openPrintModal } = usePrintReport();
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    productPlList,
    resetProductPlList,
  } = useCost();

  const [keyword, setKeyword] = React.useState('');
  const [selectedRowId, setSelectedRowId] = React.useState<number | null>(null);

  // Filter products by keyword
  const filteredProducts = useMemo(() => {
    if (!keyword.trim()) return productPlList;
    const kw = keyword.trim().toLowerCase();
    return productPlList.filter((p) => p.productName.toLowerCase().includes(kw));
  }, [productPlList, keyword]);

  // Grand totals
  const totals = useMemo(() => {
    let salesAmount = 0;
    let indirectCostAllocated = 0;
    let logisticsCost = 0;
    let directMaterialCost = 0;
    let totalCost = 0;
    let salesProfit = 0;
    let salesQty = 0;
    let productionQty = 0;

    filteredProducts.forEach((p) => {
      salesAmount += p.salesAmount;
      indirectCostAllocated += p.indirectCostAllocated;
      logisticsCost += p.logisticsCost;
      directMaterialCost += p.directMaterialCost;
      totalCost += p.totalCost;
      salesProfit += p.salesProfit;
      salesQty += p.salesQty;
      productionQty += p.productionQty;
    });

    const profitRate =
      salesAmount > 0 ? Number(((salesProfit / salesAmount) * 100).toFixed(2)) : 100.0;
    const costRatio =
      salesAmount > 0 ? Number(((totalCost / salesAmount) * 100).toFixed(2)) : 0.0;

    return {
      salesAmount,
      indirectCostAllocated,
      logisticsCost,
      directMaterialCost,
      totalCost,
      salesProfit,
      profitRate,
      costRatio,
      salesQty,
      productionQty,
    };
  }, [filteredProducts]);

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

  const handleReset = () => {
    resetProductPlList();
    setKeyword('');
    alert('제품별 손익 분석 데이터 및 원가배분이 초기화되었습니다.');
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] text-[12.5px] select-none">
      {/* 1. Header Action Bar */}
      <CostActionBar
        title="제품별손익현황"
        buttons={[
          { key: 'print', label: '손익계산서인쇄(A4)', icon: 'print', onClick: () => openPrintModal('COST_SHEET') },
          { key: 'search', label: '조회', icon: 'search', onClick: () => {} },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: handleReset },
        ]}
        helpContent="제품별 매출액, 직접재료비, 제품물류비, 배분된 간접비를 집계하여 제품별 매출손익 및 개당 손익을 정밀 분석합니다. 간접비등록 화면에서 [원가배분]을 수행하면 제품별 매출비중에 따라 간접비배분액이 자동 반영됩니다."
      />

      {/* 2. Filter Bar */}
      <div className="bg-[#e4e8ee] border-b border-[#b0b8c2] px-3 py-1.5 flex items-center justify-between gap-4 text-[12.5px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">연도</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12.5px] focus:outline-none focus:border-blue-600"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">월</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12.5px] focus:outline-none focus:border-blue-600"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">품명검색</span>
            <div className="relative">
              <input
                type="text"
                placeholder="제품명 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12.5px] w-48 focus:outline-none focus:border-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1.5 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12.5px] font-bold text-gray-700">
            데이터수: <span className="text-blue-700">{filteredProducts.length}</span>
          </span>
          <button
            onClick={() => setKeyword('')}
            title="새로고침"
            className="p-1 text-gray-600 hover:text-black rounded hover:bg-gray-200 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Main Split View (Top 65% : Bottom 35%) */}
      <div className="flex-1 p-2 bg-[#d8dde5] overflow-hidden flex flex-col gap-2">
        {/* UPPER: 제품별 손익 분석 (65% height) */}
        <div className="h-[65%] bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          <div className="bg-[#dde3ea] px-3 py-1 border-b border-[#b8c1cc] flex items-center justify-between">
            <span className="font-bold text-gray-800 text-[12.5px]">
              제품별 손익 분석 ({selectedYear}년 {selectedMonth}월 기준)
            </span>
            <span className="text-[11px] text-gray-600">
              총 매출액: <span className="font-bold text-blue-700">{totals.salesAmount.toLocaleString()}</span> 원 |
              매출손익: <span className="font-bold text-emerald-700">{totals.salesProfit.toLocaleString()}</span> 원 (이익율: {totals.profitRate}%)
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            <EditableTableWrapper><table className="w-full min-w-full border-collapse text-[12.5px] min-w-[1700px]">
              {/* Grouped Header */}
              <thead className="whitespace-nowrap sticky top-0 bg-[#c0c7ea] text-gray-900 border-b border-[#9aa2ad] z-20 shadow-sm">
                <tr className="h-[25px]">
                  <th
                    rowSpan={2}
                    className="w-12 border-r border-[#a0a8be] text-center font-bold sticky left-0 bg-[#b0b8dc] z-30"
                  >
                    순번
                  </th>
                  <th
                    rowSpan={2}
                    className="w-56 border-r border-[#a0a8be] text-center font-bold sticky left-12 bg-[#b0b8dc] z-30"
                  >
                    품명
                  </th>
                  <th rowSpan={2} className="w-32 border-r border-[#a0a8be] text-center font-bold">
                    매출액
                  </th>
                  <th rowSpan={2} className="w-20 border-r border-[#a0a8be] text-center font-bold">
                    매출비중
                  </th>
                  <th rowSpan={2} className="w-28 border-r border-[#a0a8be] text-center font-bold">
                    간접비배분
                  </th>
                  {/* Cost Summary Group Header */}
                  <th colSpan={6} className="border-r border-[#a0a8be] text-center font-bold bg-[#b5beec]">
                    [ 원가합계 ]
                  </th>
                  <th rowSpan={2} className="w-32 border-r border-[#a0a8be] text-center font-bold">
                    매출손익
                  </th>
                  <th rowSpan={2} className="w-20 border-r border-[#a0a8be] text-center font-bold">
                    이익율
                  </th>
                  <th rowSpan={2} className="w-20 border-r border-[#a0a8be] text-center font-bold">
                    원가비중
                  </th>
                  <th rowSpan={2} className="w-24 border-r border-[#a0a8be] text-center font-bold">
                    판매수량
                  </th>
                  <th rowSpan={2} className="w-24 border-r border-[#a0a8be] text-center font-bold">
                    개당판매단가
                  </th>
                  <th rowSpan={2} className="w-24 border-r border-[#a0a8be] text-center font-bold">
                    단위원가
                  </th>
                  <th rowSpan={2} className="w-24 border-r border-[#a0a8be] text-center font-bold">
                    개당손익
                  </th>
                </tr>
                <tr className="h-[25px] bg-[#d3d9f3]">
                  {/* Under 제품물류비합계 */}
                  <th className="w-16 border-r border-[#a0a8be] text-center font-semibold text-[11px]">
                    물류비율
                  </th>
                  <th className="w-28 border-r border-[#a0a8be] text-center font-semibold text-[11px]">
                    제품물류비
                  </th>
                  {/* Under 직접재료비합계 */}
                  <th className="w-28 border-r border-[#a0a8be] text-center font-semibold text-[11px]">
                    단기총투입재료비
                  </th>
                  <th className="w-24 border-r border-[#a0a8be] text-center font-semibold text-[11px]">
                    생산수량
                  </th>
                  <th className="w-28 border-r border-[#a0a8be] text-center font-semibold text-[11px]">
                    직접재료비
                  </th>
                  {/* Under 합계 */}
                  <th className="w-28 border-r border-[#a0a8be] text-center font-bold text-[11px] bg-[#c3ccf2]">
                    합계
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, idx) => {
                  const isSelected = selectedRowId === p.id;
                  const isNegativeProfit = p.salesProfit < 0;
                  const isNegativeUnitProfit = p.unitProfit < 0;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedRowId(p.id)}
                      className={`border-b border-gray-200 transition-colors h-[26px] cursor-pointer ${
                        isSelected
                          ? 'bg-blue-100/80 font-medium'
                          : idx % 2 === 1
                          ? 'bg-gray-50/70 hover:bg-blue-50/50'
                          : 'bg-white hover:bg-blue-50/50'
                      }`}
                    >
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 text-center bg-[#f2f2f2] border-r border-gray-300 font-semibold text-gray-600 sticky left-0 z-10">
                        {idx + 1}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2.5 border-r border-gray-300 font-medium text-gray-900 sticky left-12 z-10 bg-inherit whitespace-nowrap">
                        {p.productName}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 font-semibold text-gray-800">
                        {p.salesAmount.toLocaleString()}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 text-gray-700">
                        {p.salesRatio}%
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 text-purple-800 font-medium">
                        {p.indirectCostAllocated.toLocaleString()}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 text-gray-600">
                        {p.logisticsRatio > 0 ? `${p.logisticsRatio}%` : '-'}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 text-gray-700">
                        {p.logisticsCost.toLocaleString()}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 text-gray-600">
                        {p.directMaterialUnit > 0 ? p.directMaterialUnit.toFixed(1) : '-'}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 text-gray-700">
                        {p.productionQty.toLocaleString()}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 text-gray-800">
                        {p.directMaterialCost.toLocaleString()}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 font-bold text-gray-900 bg-gray-50/50">
                        {p.totalCost.toLocaleString()}
                      </td>
                      <td
                        className={`cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 font-bold ${
                          isNegativeProfit ? 'text-red-600' : 'text-blue-900'
                        }`}
                      >
                        {p.salesProfit.toLocaleString()}
                      </td>
                      <td
                        className={`cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 font-semibold ${
                          p.profitRate < 0 ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {p.profitRate}%
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 text-gray-600">
                        {p.costRatio}%
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 text-gray-700">
                        {p.salesQty.toLocaleString()}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 font-semibold text-gray-800">
                        {p.unitPrice.toLocaleString()}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 text-gray-700">
                        {p.unitCost.toLocaleString()}
                      </td>
                      <td
                        className={`cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 font-bold ${
                          isNegativeUnitProfit ? 'text-red-600' : 'text-blue-800'
                        }`}
                      >
                        {p.unitProfit.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Grand Summary Row */}
              <tfoot className="sticky bottom-0 bg-[#ffffcc] font-bold border-t-2 border-[#9aa2ad] z-20 shadow-md">
                <tr className="h-[28px]">
                  <td
                    colSpan={2}
                    className="text-center border-r border-[#c8c890] text-gray-900 sticky left-0 bg-[#fbfbb8] z-30"
                  >
                    합계
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-blue-900 font-bold">
                    {totals.salesAmount.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-gray-800">
                    100.0%
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-purple-900">
                    {totals.indirectCostAllocated.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-gray-700">-</td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-gray-900">
                    {totals.logisticsCost.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-gray-700">-</td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-gray-900">
                    {totals.productionQty.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-gray-900">
                    {totals.directMaterialCost.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-gray-900 font-bold">
                    {totals.totalCost.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-blue-900 font-bold">
                    {totals.salesProfit.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-emerald-800 font-bold">
                    {totals.profitRate.toFixed(2)}%
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-gray-800">
                    {totals.costRatio.toFixed(2)}%
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-gray-900">
                    {totals.salesQty.toLocaleString()}
                  </td>
                  <td colSpan={3} className="px-2 text-center text-gray-500 text-[11px]">
                    (전체 품목 가중치 환산 기준)
                  </td>
                </tr>
              </tfoot>
            </table></EditableTableWrapper>
          </div>
        </div>

        {/* LOWER: 항목별 그룹 집계 (35% height) */}
        <div className="h-[35%] bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          <div className="bg-[#dde3ea] px-3 py-1 border-b border-[#b8c1cc] flex items-center justify-between">
            <span className="font-bold text-gray-800 text-[12.5px]">
              항목별 원가 집계 ({selectedYear}년 {selectedMonth}월 그룹별)
            </span>
            <span className="text-[11px] text-gray-600">
              직접재료비 + 노무비 + 제조간접비 + 물류비 종합
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            <EditableTableWrapper><table className="w-full min-w-full border-collapse text-[12.5px]">
              <thead className="whitespace-nowrap sticky top-0 bg-[#c0c7ea] text-gray-900 border-b border-[#9aa2ad] z-10 shadow-sm">
                <tr className="h-[27px]">
                  <th className="w-48 border-r border-[#a0a8be] text-center font-bold">원가그룹명</th>
                  <th className="w-56 border-r border-[#a0a8be] text-center font-bold">원가항목</th>
                  <th className="w-44 border-r border-[#a0a8be] text-center font-bold">원가합계</th>
                  <th className="w-32 border-r border-[#a0a8be] text-center font-bold">원가/매출(%)</th>
                  <th className="border-r border-[#a0a8be] text-center font-bold">그룹소계</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_COST_GROUP_SUMMARY.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors h-[26px]"
                  >
                    <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 border-r border-gray-300 font-semibold text-gray-800 bg-[#f9fafc]">
                      {row.groupName}
                    </td>
                    <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 border-r border-gray-300 font-medium text-gray-700">
                      {row.costItem}
                    </td>
                    <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 text-right border-r border-gray-300 font-semibold text-gray-900">
                      {row.costTotal.toLocaleString()}
                    </td>
                    <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 text-right border-r border-gray-300 text-gray-700">
                      {row.costToSalesRatio.toFixed(2)}%
                    </td>
                    <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 text-right font-bold text-blue-900 bg-gray-50/50">
                      {row.groupSubtotal > 0 ? row.groupSubtotal.toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-[#ffffcc] font-bold border-t-2 border-[#9aa2ad] z-10">
                <tr className="h-[28px]">
                  <td colSpan={2} className="text-center border-r border-[#c8c890] text-gray-900">
                    합계
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 text-right border-r border-[#c8c890] text-blue-900">
                    {(785179247 + 104484265).toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 text-right border-r border-[#c8c890] text-gray-800">
                    {(((785179247 + 104484265) / 3179622813) * 100).toFixed(2)}%
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 text-right text-gray-700"></td>
                </tr>
              </tfoot>
            </table></EditableTableWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

