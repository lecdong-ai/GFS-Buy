'use client';

import React, { useState, useEffect } from 'react';
import { InventoryActionBar } from '../common/InventoryActionBar';
import { InventoryDataGrid, InventoryGridColumnDef } from '../common/InventoryDataGrid';
import { Calendar, RotateCw } from 'lucide-react';

interface FoodWasteSummaryRow {
  id: number;
  dischargeDate: string;
  wasteQty: number;
}

interface FoodWasteDetailRow {
  id: number;
  dischargeDate: string;
  gyeName: string;
  wasteQty: number;
}

const SAMPLE_SUMMARY: FoodWasteSummaryRow[] = [
  { id: 1, dischargeDate: '2026-10-30', wasteQty: 245 },
  { id: 2, dischargeDate: '2026-10-29', wasteQty: 310 },
  { id: 3, dischargeDate: '2026-10-28', wasteQty: 280 },
];

const SAMPLE_DETAILS: FoodWasteDetailRow[] = [
  { id: 1, dischargeDate: '2026-10-30', gyeName: '선별실(커팅)', wasteQty: 75 },
  { id: 2, dischargeDate: '2026-10-30', gyeName: '채소작업실(세척)', wasteQty: 60 },
  { id: 3, dischargeDate: '2026-10-30', gyeName: '성형장(도시락)', wasteQty: 45 },
  { id: 4, dischargeDate: '2026-10-30', gyeName: '성형장(김밥)', wasteQty: 35 },
  { id: 5, dischargeDate: '2026-10-30', gyeName: '조리실(데침/삶기)', wasteQty: 30 },
  { id: 6, dischargeDate: '2026-10-29', gyeName: '선별실(커팅)', wasteQty: 90 },
  { id: 7, dischargeDate: '2026-10-29', gyeName: '채소작업실(커팅)', wasteQty: 85 },
  { id: 8, dischargeDate: '2026-10-29', gyeName: '성형장(도시락)', wasteQty: 55 },
  { id: 9, dischargeDate: '2026-10-29', gyeName: '조리실(볶음)', wasteQty: 45 },
  { id: 10, dischargeDate: '2026-10-29', gyeName: '성형장(삼각김밥)', wasteQty: 35 },
];

export const FoodWasteStatusView: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-10-30');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [periodType, setPeriodType] = useState('일간');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-30');
  const [details, setDetails] = useState<FoodWasteDetailRow[]>(SAMPLE_DETAILS);

  useEffect(() => {
    fetch('/api/production/food-waste')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const mapped: FoodWasteDetailRow[] = json.data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            dischargeDate: item.wasteDate || '2026-10-30',
            gyeName: item.gyeName || '선별실(커팅)',
            wasteQty: Number(item.wasteQty) || 0,
          }));
          setDetails(mapped);
        }
      })
      .catch((err) => console.error('Fetch food-waste failed:', err));
  }, []);

  const handleShiftDay = (direction: -1 | 1) => {
    const cur = new Date(startDate);
    cur.setDate(cur.getDate() + direction);
    const newStr = cur.toISOString().split('T')[0];
    setStartDate(newStr);
    setEndDate(newStr);
    setSelectedDate(newStr);
  };

  const handlePeriodChange = (val: string) => {
    setPeriodType(val);
    const cur = new Date(startDate);
    if (val === '일간') {
      setEndDate(startDate);
    } else if (val === '주간') {
      const end = new Date(cur);
      end.setDate(end.getDate() + 6);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (val === '월간') {
      const end = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const filteredDetails = details.filter((d) => d.dischargeDate === selectedDate);
  const displayDetails = filteredDetails.length > 0 ? filteredDetails : details.slice(0, 5);

  const SUMMARY_COLUMNS: InventoryGridColumnDef[] = [
    { key: 'dischargeDate', label: '배출일', width: '120px', align: 'center', format: 'date' },
    { key: 'wasteQty', label: '폐기량(kg)', width: '120px', align: 'right', format: 'number' },
  ];

  const DETAIL_COLUMNS: InventoryGridColumnDef[] = [
    { key: 'gyeName', label: '계명칭', width: '160px', align: 'left' },
    { key: 'wasteQty', label: '폐기량(kg)', width: '130px', align: 'right', format: 'number' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <InventoryActionBar
        title="음식물쓰레기현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('음식물쓰레기 현황이 조회되었습니다.') },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('조회 조건이 초기화되었습니다.') },
        ]}
        helpContent="일자별 음식물쓰레기 총 배출량 및 각 공정/작업장 계별 배출 비중을 분석합니다."
      />

      {/* 2. 조회 조건바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              기간:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-gray-400 px-1.5 py-0.5 text-[12px] font-mono rounded-xs shadow-2xs"
            />
            <span className="text-gray-500">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-gray-400 px-1.5 py-0.5 text-[12px] font-mono rounded-xs shadow-2xs"
            />
            <div className="flex items-center ml-0.5">
              <button
                type="button"
                onClick={() => handleShiftDay(-1)}
                className="px-1.5 py-0.5 bg-[#4a72b2] hover:bg-[#3b5e96] text-white rounded-l-xs text-[11px] font-bold"
                title="이전일"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => handleShiftDay(1)}
                className="px-1.5 py-0.5 bg-[#4a72b2] hover:bg-[#3b5e96] text-white rounded-r-xs text-[11px] font-bold border-l border-blue-400"
                title="다음일"
              >
                &gt;
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-gray-300 text-[11px]">
            {['일간', '주간', '월간', '분기', '반기', '연간'].map((mode) => (
              <label key={mode} className="flex items-center gap-1 cursor-pointer font-medium text-gray-800">
                <input
                  type="radio"
                  name="periodType"
                  value={mode}
                  checked={periodType === mode}
                  onChange={() => handlePeriodChange(mode)}
                  className="accent-blue-600 cursor-pointer"
                />
                {mode}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert('새로고침')}
            className="p-1 text-gray-600 hover:text-blue-700 hover:bg-gray-200 rounded border border-gray-300 bg-white cursor-pointer shadow-2xs"
            title="새로고침"
          >
            <RotateCw size={13} />
          </button>
        </div>
      </div>

      {/* 3. 좌우 2분할 레이아웃 (좌측 약 30% : 우측 약 70%) */}
      <div className="flex-1 flex min-h-0 p-2 gap-2">
        {/* 좌측: 요약 그리드 */}
        <div className="w-[300px] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs shrink-0">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <span className="font-bold text-gray-800">요약</span>
            <span className="text-[11px] text-gray-600 font-medium">
              데이터수: <span className="font-bold text-blue-700">{SAMPLE_SUMMARY.length}</span>
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <InventoryDataGrid
              columns={SUMMARY_COLUMNS}
              data={SAMPLE_SUMMARY}
              selectedRowId={selectedDate}
              onRowClick={(row) => setSelectedDate(row.dischargeDate)}
              summaryValues={{
                wasteQty: 0,
              }}
              summaryRowTitle="합계"
            />
          </div>
        </div>

        {/* 우측: 내역 그리드 */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">공정별 내역 ▶</span>
              <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.2 rounded border border-blue-300 font-semibold">
                배출일: {selectedDate}
              </span>
            </div>
            <span className="text-[11px] text-gray-600 font-medium">
              공정수: <span className="font-bold text-blue-700">{displayDetails.length}</span> 개소
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <InventoryDataGrid
              columns={DETAIL_COLUMNS}
              data={displayDetails}
              summaryValues={{
                wasteQty: 0,
              }}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

