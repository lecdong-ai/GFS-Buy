'use client';

import React, { useState, useEffect } from 'react';
import { InventoryActionBar } from '../common/InventoryActionBar';
import { InventoryDataGrid, InventoryGridColumnDef } from '../common/InventoryDataGrid';
import { Calendar, RotateCw } from 'lucide-react';

interface DiscardSummaryRow {
  id: number;
  discardDate: string;
  discardAmount: number;
}

interface DiscardDetailRow {
  id: number;
  discardDate: string;
  gyeName: string;
  category: string;
  itemName: string;
  spec: string;
  unit: string;
  discardQty: number;
  discardAmount: number;
}

const SAMPLE_SUMMARY: DiscardSummaryRow[] = [
  { id: 1, discardDate: '2026-10-30', discardAmount: 184500 },
  { id: 2, discardDate: '2026-10-29', discardAmount: 242000 },
  { id: 3, discardDate: '2026-10-28', discardAmount: 156000 },
];

const SAMPLE_DETAILS: DiscardDetailRow[] = [
  { id: 1, discardDate: '2026-10-30', gyeName: '성형장(김밥)', category: '반제품', itemName: '참치마요김밥(밥김)', spec: '230g*1줄', unit: 'kg', discardQty: 5.2, discardAmount: 48500 },
  { id: 2, discardDate: '2026-10-30', gyeName: '조리실(데침/삶기)', category: '원재료', itemName: '시금치(데침용)', spec: '10kg/상자', unit: 'kg', discardQty: 8.0, discardAmount: 64000 },
  { id: 3, discardDate: '2026-10-30', gyeName: '튀김실(튀김)', category: '반제품', itemName: '등심돈까스 튀김', spec: '120g*10ea', unit: 'kg', discardQty: 4.5, discardAmount: 72000 },
  { id: 4, discardDate: '2026-10-29', gyeName: '성형장(도시락)', category: '반제품', itemName: '11찬도시락 밥반찬', spec: '460g*1팩', unit: 'kg', discardQty: 12.0, discardAmount: 132000 },
  { id: 5, discardDate: '2026-10-29', gyeName: '선별실(커팅)', category: '원재료', itemName: '양배추(세척)', spec: '15kg/망', unit: 'kg', discardQty: 15.0, discardAmount: 110000 },
  { id: 6, discardDate: '2026-10-28', gyeName: '취반(미반류)', category: '반제품', itemName: '백미 초밥미반', spec: '50kg*1통', unit: 'kg', discardQty: 20.0, discardAmount: 156000 },
];

export const DiscardStatusGsrView: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-10-30');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [periodType, setPeriodType] = useState('일간');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-30');
  const [details, setDetails] = useState<DiscardDetailRow[]>(SAMPLE_DETAILS);

  useEffect(() => {
    fetch('/api/production/discard')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const mapped: DiscardDetailRow[] = json.data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            discardDate: item.discardDate || '2026-10-30',
            gyeName: item.gyeName || '성형장(김밥)',
            category: item.category || '원재료',
            itemName: item.productName || item.productCode || '폐기품목',
            spec: '표준규격',
            unit: item.unit || 'kg',
            discardQty: Number(item.discardQty) || 0,
            discardAmount: Number(item.costAmount) || 0,
          }));
          setDetails(mapped);
        }
      })
      .catch((err) => console.error('Fetch discard failed:', err));
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

  // Filter details by selected date
  const filteredDetails = details.filter((d) => d.discardDate === selectedDate);
  const displayDetails = filteredDetails.length > 0 ? filteredDetails : details;

  // Left columns
  const SUMMARY_COLUMNS: InventoryGridColumnDef[] = [
    { key: 'discardDate', label: '폐기일', width: '110px', align: 'center', format: 'date' },
    { key: 'discardAmount', label: '폐기금액', width: '130px', align: 'right', format: 'currency' },
  ];

  // Right columns
  const DETAIL_COLUMNS: InventoryGridColumnDef[] = [
    { key: 'discardDate', label: '폐기일', width: '90px', align: 'center', format: 'date' },
    { key: 'gyeName', label: '계명칭', width: '130px', align: 'left' },
    { key: 'category', label: '구분', width: '65px', align: 'center' },
    { key: 'itemName', minWidth: '260px', label: '품명', align: 'left' },
    { key: 'spec', label: '규격', width: '100px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    {
      key: 'discardQty',
      label: '폐기량',
      width: '85px',
      align: 'right',
      render: (val) => Number(val || 0).toFixed(1),
    },
    { key: 'discardAmount', label: '폐기금액', width: '110px', align: 'right', format: 'currency' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <InventoryActionBar
        title="폐기현황(GSR)"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('폐기현황이 조회되었습니다.') },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('조회 조건이 초기화되었습니다.') },
        ]}
        helpContent="일자별/공정별 발생한 원부자재 및 반제품 폐기 실적 및 폐기금액을 종합 조회합니다."
      />

      {/* 2. 조회 조건바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              폐기일자:
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
              onRowClick={(row) => setSelectedDate(row.discardDate)}
              summaryValues={{
                discardAmount: 0,
              }}
              summaryRowTitle="합계"
            />
          </div>
        </div>

        {/* 우측: 내역 그리드 */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">내역 ▶</span>
              <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.2 rounded border border-blue-300 font-semibold">
                선택일자: {selectedDate}
              </span>
            </div>
            <span className="text-[11px] text-gray-600 font-medium">
              내역수: <span className="font-bold text-blue-700">{displayDetails.length}</span> 건
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <InventoryDataGrid
              columns={DETAIL_COLUMNS}
              data={displayDetails}
              summaryValues={{
                discardQty: '0.0',
                discardAmount: 0,
              }}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

