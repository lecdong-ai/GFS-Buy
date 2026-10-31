'use client';

import React, { useState, useMemo } from 'react';
import { CostActionBar } from '../common/CostActionBar';
import { useCost } from '../context/CostContext';
import { RotateCw, Search, AlertTriangle } from 'lucide-react';

import { useInlineEdit } from '@/components/common/EditableCell';
import { EditableTableWrapper } from '@/components/common/EditableTableWrapper';
export const RecipeCostRateView: React.FC = () => {
  const { recipeCostRates } = useCost();

  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedLine, setSelectedLine] = useState('전체');
  const [onlyLoss, setOnlyLoss] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  // Categories & Lines
  const categories = useMemo(() => {
    const set = new Set<string>();
    recipeCostRates.forEach((r) => set.add(r.category));
    return ['전체', ...Array.from(set)];
  }, [recipeCostRates]);

  const lines = useMemo(() => {
    const set = new Set<string>();
    recipeCostRates.forEach((r) => set.add(r.lineName));
    return ['전체', ...Array.from(set)];
  }, [recipeCostRates]);

  // Filter
  const filteredData = useMemo(() => {
    return recipeCostRates.filter((item) => {
      if (selectedCategory !== '전체' && item.category !== selectedCategory) return false;
      if (selectedLine !== '전체' && item.lineName !== selectedLine) return false;
      if (onlyLoss && item.diff >= 0) return false;
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        const matchName = item.itemName.toLowerCase().includes(kw);
        const matchCode = item.itemCode.toLowerCase().includes(kw);
        if (!matchName && !matchCode) return false;
      }
      return true;
    });
  }, [recipeCostRates, selectedCategory, selectedLine, onlyLoss, keyword]);

  // Summaries
  const summaries = useMemo(() => {
    let sumRecipeCost = 0;
    let sumDeliveryPrice = 0;
    let sumDiff = 0;
    let countValid = 0;

    filteredData.forEach((row) => {
      if (row.recipeCost > 0) sumRecipeCost += row.recipeCost;
      if (row.deliveryPrice > 0) sumDeliveryPrice += row.deliveryPrice;
      sumDiff += row.diff;
      if (row.deliveryPrice > 0) countValid++;
    });

    const avgCostRate =
      sumDeliveryPrice > 0 ? Number(((sumRecipeCost / sumDeliveryPrice) * 100).toFixed(1)) : 0;

    return {
      sumRecipeCost,
      sumDeliveryPrice,
      sumDiff,
      avgCostRate,
    };
  }, [filteredData]);

  const lossCount = useMemo(() => {
    return recipeCostRates.filter((r) => r.diff < 0).length;
  }, [recipeCostRates]);

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
    setKeyword('');
    setSelectedCategory('전체');
    setSelectedLine('전체');
    setOnlyLoss(false);
    setSelectedRowId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] text-[12.5px] select-none">
      {/* 1. Header Action Bar */}
      <CostActionBar
        title="완성품레시피원가율"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => {} },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: handleReset },
        ]}
        helpContent="완성품의 표준 레시피 원가와 실제 납품단가를 비교하여 제품별 마진(차이 = 납품단가 - 레시피원가) 및 원가율(%)을 분석합니다. 미등록 단가(-9) 및 역마진(차이 < 0) 품목은 붉은색으로 강조 표시됩니다."
      />

      {/* 2. Filter Bar */}
      <div className="bg-[#e4e8ee] border-b border-[#b0b8c2] px-3 py-1.5 flex items-center justify-between gap-4 text-[12.5px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">검색어</span>
            <div className="relative">
              <input
                type="text"
                placeholder="품명 / 품번 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12.5px] w-48 focus:outline-none focus:border-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">품종</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12.5px] focus:outline-none focus:border-blue-600"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">계명칭</span>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12.5px] focus:outline-none focus:border-blue-600"
            >
              {lines.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 ml-3 cursor-pointer text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
            <input
              type="checkbox"
              checked={onlyLoss}
              onChange={(e) => setOnlyLoss(e.target.checked)}
              className="rounded border-red-400 text-red-600 focus:ring-0"
            />
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>역마진 품목만 보기 ({lossCount}건)</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12.5px] font-bold text-gray-700">
            데이터수: <span className="text-blue-700">{filteredData.length}</span>
          </span>
          <button
            onClick={handleReset}
            title="새로고침"
            className="p-1 text-gray-600 hover:text-black rounded hover:bg-gray-200 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Main DataGrid Table */}
      <div className="flex-1 p-2 bg-[#d8dde5] overflow-hidden flex flex-col">
        <div className="flex-1 bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          <div className="bg-[#dde3ea] px-3 py-1 border-b border-[#b8c1cc] flex items-center justify-between">
            <span className="font-bold text-gray-800 text-[12.5px]">
              완성품 레시피 원가 및 마진 분석표
            </span>
            <span className="text-[11px] text-gray-600">
              * 차이 = 납품단가 - 레시피원가 | * 원가율 = (레시피원가 / 납품단가) * 100
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            <EditableTableWrapper><table className="w-full border-collapse text-[12.5px] min-w-[1300px]">
              <thead className="whitespace-nowrap sticky top-0 bg-[#c0c7ea] text-gray-900 border-b border-[#9aa2ad] z-10 shadow-sm">
                <tr className="h-[27px]">
                  <th className="w-12 border-r border-[#a0a8be] text-center font-bold">순번</th>
                  <th className="w-24 border-r border-[#a0a8be] text-center font-bold">품번</th>
                  <th className="w-16 border-r border-[#a0a8be] text-center font-bold">구분</th>
                  <th className="w-20 border-r border-[#a0a8be] text-center font-bold">품종</th>
                  <th className="w-56 border-r border-[#a0a8be] text-center font-bold">품명</th>
                  <th className="w-20 border-r border-[#a0a8be] text-center font-bold">규격</th>
                  <th className="w-16 border-r border-[#a0a8be] text-center font-bold">단위</th>
                  <th className="w-24 border-r border-[#a0a8be] text-center font-bold">포장타입</th>
                  <th className="w-36 border-r border-[#a0a8be] text-center font-bold">계명칭</th>
                  <th className="w-28 border-r border-[#a0a8be] text-center font-bold">레시피원가</th>
                  <th className="w-28 border-r border-[#a0a8be] text-center font-bold">납품단가</th>
                  <th className="w-28 border-r border-[#a0a8be] text-center font-bold">차이</th>
                  <th className="w-20 border-r border-[#a0a8be] text-center font-bold">원가율</th>
                  <th className="border-r border-[#a0a8be] text-center font-bold">비고</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => {
                  const isSelected = selectedRowId === row.id;
                  const isNegativeDiff = row.diff < 0;
                  const isUnregisteredPrice = row.deliveryPrice === -9 || row.recipeCost === -9;

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRowId(row.id)}
                      className={`border-b border-gray-200 transition-colors h-[26px] cursor-pointer ${
                        isSelected
                          ? 'bg-blue-100 font-medium'
                          : isNegativeDiff
                          ? 'bg-red-50/70 hover:bg-red-100/70'
                          : index % 2 === 1
                          ? 'bg-gray-50/70 hover:bg-blue-50/50'
                          : 'bg-white hover:bg-blue-50/50'
                      }`}
                    >
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 text-center bg-[#f2f2f2] border-r border-gray-300 font-semibold text-gray-600">
                        {index + 1}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-center border-r border-gray-300 font-medium text-gray-800">
                        {row.itemCode}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-1 text-center border-r border-gray-300 text-gray-700">
                        {row.itemType}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-1.5 text-center border-r border-gray-300 text-gray-800">
                        {row.category}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2.5 border-r border-gray-300 font-medium text-gray-900 whitespace-nowrap">
                        {row.itemName}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-1 text-center border-r border-gray-300 text-gray-600">
                        {row.spec}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-1 text-center border-r border-gray-300 text-gray-600">
                        {row.unit}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-1.5 text-center border-r border-gray-300 text-gray-700">
                        {row.packType}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 border-r border-gray-300 text-gray-800">
                        {row.lineName}
                      </td>

                      {/* 레시피원가 */}
                      <td
                        className={`cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 ${
                          row.recipeCost === -9
                            ? 'text-red-600 font-bold'
                            : 'font-semibold text-gray-800'
                        }`}
                      >
                        {row.recipeCost === -9 ? '-9' : row.recipeCost.toLocaleString()}
                      </td>

                      {/* 납품단가 */}
                      <td
                        className={`cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 ${
                          row.deliveryPrice === -9
                            ? 'text-red-600 font-bold'
                            : 'font-semibold text-gray-800'
                        }`}
                      >
                        {row.deliveryPrice === -9 ? '-9' : row.deliveryPrice.toLocaleString()}
                      </td>

                      {/* 차이 */}
                      <td
                        className={`cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 font-bold ${
                          isNegativeDiff
                            ? 'text-red-600'
                            : row.diff === 0
                            ? 'text-gray-500'
                            : 'text-blue-800'
                        }`}
                      >
                        {isNegativeDiff
                          ? row.diff.toLocaleString()
                          : `+${row.diff.toLocaleString()}`}
                      </td>

                      {/* 원가율 */}
                      <td
                        className={`cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 font-semibold ${
                          row.costRate > 80
                            ? 'text-amber-700 font-bold'
                            : row.costRate === 0
                            ? 'text-gray-400'
                            : 'text-emerald-700'
                        }`}
                      >
                        {row.costRate}%
                      </td>

                      {/* 비고 */}
                      <td
                        className={`cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 border-r border-gray-300 text-[11px] ${
                          isNegativeDiff
                            ? 'text-red-700 font-bold'
                            : isUnregisteredPrice
                            ? 'text-amber-800'
                            : 'text-gray-600'
                        }`}
                      >
                        {row.remark}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="sticky bottom-0 bg-[#ffffcc] font-bold border-t-2 border-[#9aa2ad] z-10 shadow-md">
                <tr className="h-[28px]">
                  <td colSpan={9} className="text-center border-r border-[#c8c890] text-gray-900">
                    합계 / 가중평균
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-gray-900 font-bold">
                    {summaries.sumRecipeCost.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-gray-900 font-bold">
                    {summaries.sumDeliveryPrice.toLocaleString()}
                  </td>
                  <td
                    className={`cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] font-bold ${
                      summaries.sumDiff < 0 ? 'text-red-600' : 'text-blue-900'
                    }`}
                  >
                    {summaries.sumDiff.toLocaleString()}
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-[#c8c890] text-emerald-800 font-bold">
                    {summaries.avgCostRate}%
                  </td>
                  <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-gray-600 text-[11px]">
                    (전체 {filteredData.length}개 품목 기준)
                  </td>
                </tr>
              </tfoot>
            </table></EditableTableWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

