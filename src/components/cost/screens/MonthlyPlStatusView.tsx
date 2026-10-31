'use client';

import React from 'react';
import { CostActionBar } from '../common/CostActionBar';
import { useCost } from '../context/CostContext';
import { RotateCw, TrendingUp } from 'lucide-react';

import { useInlineEdit } from '@/components/common/EditableCell';
import { EditableTableWrapper } from '@/components/common/EditableTableWrapper';
const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

function getDayHeader(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);
  const dow = DAYS_OF_WEEK[date.getDay()];
  return `${day}(${dow})`;
}

export const MonthlyPlStatusView: React.FC = () => {
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    monthlyPlRows,
  } = useCost();

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayIndices = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleReset = () => {
    alert('월별 손익현황 조회가 새로고침되었습니다.');
  };

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


  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] text-[12.5px] select-none">
      {/* 1. Header Action Bar */}
      <CostActionBar
        title="월별손익현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => {} },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: handleReset },
        ]}
        helpContent="선택한 연월의 1일부터 말일까지 14개 손익 계정별 일자별 추이 및 손익율을 매트릭스 형태로 조회합니다. 간접비 배분 후 일별 원가 및 손익총계, 손익율이 실시간으로 연동되어 표시됩니다."
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

          <div className="flex items-center gap-1.5 ml-4 text-[11px] text-gray-600">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>
              기준: <b>{selectedYear}년 {selectedMonth}월</b> 일자별 손익 집계표 (14개 고정 계정)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12.5px] font-bold text-gray-700">
            데이터수: <span className="text-blue-700">{monthlyPlRows.length}</span>
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

      {/* 3. Main Data Matrix Grid */}
      <div className="flex-1 p-2 bg-[#d8dde5] overflow-hidden flex flex-col">
        <div className="flex-1 bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          <div className="bg-[#dde3ea] px-3 py-1 border-b border-[#b8c1cc] flex items-center justify-between">
            <span className="font-bold text-gray-800 text-[12.5px]">
              {selectedYear}년 {selectedMonth}월 일별 손익계산서 (1일 ~ {daysInMonth}일)
            </span>
            <span className="text-[11px] text-gray-600">
              단위: 원, 비율: %
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            <EditableTableWrapper><table className="w-full min-w-full border-collapse text-[12.5px] min-w-[2800px]">
              <thead className="whitespace-nowrap sticky top-0 bg-[#c0c7ea] text-gray-900 border-b border-[#9aa2ad] z-20 shadow-sm">
                <tr className="h-[27px]">
                  <th className="w-12 border-r border-[#a0a8be] text-center font-bold sticky left-0 bg-[#b0b8dc] z-30">
                    순번
                  </th>
                  <th className="w-44 border-r border-[#a0a8be] text-center font-bold sticky left-12 bg-[#b0b8dc] z-30">
                    원가항목
                  </th>
                  <th className="w-28 border-r border-[#a0a8be] text-center font-bold sticky left-[224px] bg-[#b0b8dc] z-30">
                    원가/매출(%)
                  </th>
                  <th className="w-36 border-r border-[#a0a8be] text-center font-bold sticky left-[336px] bg-[#b0b8dc] z-30">
                    합계
                  </th>
                  {dayIndices.map((day) => {
                    const dowStr = getDayHeader(selectedYear, selectedMonth, day);
                    const isWeekend = dowStr.includes('(토)') || dowStr.includes('(일)');
                    return (
                      <th
                        key={day}
                        className={`min-w-[85px] border-r border-[#a0a8be] text-center font-semibold text-[11px] px-1 ${
                          isWeekend ? 'bg-[#adb6df] text-blue-900' : ''
                        }`}
                      >
                        {dowStr}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {monthlyPlRows.map((row) => {
                  const isSales = row.id === 1;
                  const isSalesRatio = row.id === 2;
                  const isCostTotal = row.id === 3;
                  const isNetProfit = row.id === 13;
                  const isProfitRate = row.id === 14;

                  let rowBg = 'bg-white hover:bg-blue-50/50';
                  let fontClass = 'font-normal text-gray-800';

                  if (isSales) {
                    rowBg = 'bg-[#f4f7fc] hover:bg-[#eaf0fa]';
                    fontClass = 'font-bold text-gray-900';
                  } else if (isSalesRatio) {
                    rowBg = 'bg-white text-gray-600 italic';
                  } else if (isCostTotal) {
                    rowBg = 'bg-[#fffbf0] hover:bg-[#fff7e0]';
                    fontClass = 'font-bold text-gray-900';
                  } else if (isNetProfit) {
                    rowBg = 'bg-[#f0f8f4] hover:bg-[#e4f3eb]';
                    fontClass = 'font-bold text-blue-900';
                  } else if (isProfitRate) {
                    rowBg = 'bg-[#f0f8f4] hover:bg-[#e4f3eb]';
                    fontClass = 'font-bold text-emerald-800';
                  }

                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-200 transition-colors h-[27px] ${rowBg} ${fontClass}`}
                    >
                      {/* Sticky 순번 */}
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 text-center bg-[#f2f2f2] border-r border-gray-300 font-semibold text-gray-600 sticky left-0 z-10">
                        {row.id}
                      </td>

                      {/* Sticky 원가항목 */}
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-3 border-r border-gray-300 sticky left-12 z-10 bg-inherit whitespace-nowrap">
                        {row.costItem}
                      </td>

                      {/* Sticky 원가/매출(%) */}
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2 text-right border-r border-gray-300 sticky left-[224px] z-10 bg-inherit">
                        {row.costToSalesRatio}
                      </td>

                      {/* Sticky 합계 */}
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 px-2.5 text-right border-r border-gray-300 sticky left-[336px] z-10 bg-inherit font-bold">
                        {isSalesRatio || isProfitRate
                          ? `${row.total.toFixed(2)} %`
                          : row.total.toLocaleString()}
                      </td>

                      {/* Daily values */}
                      {dayIndices.map((day, dIdx) => {
                        const val = row.dailyValues[dIdx] ?? 0;
                        const isRatio = isSalesRatio || isProfitRate;

                        return (
                          <td
                            key={day}
                            className={`px-2 text-right border-r border-gray-200 text-[11px] ${
                              val < 0 ? 'text-red-600 font-bold' : ''
                            }`}
                          >
                            {isRatio
                              ? `${val.toFixed(1)} %`
                              : val === 0
                              ? '0'
                              : val.toLocaleString()}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table></EditableTableWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

