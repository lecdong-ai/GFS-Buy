'use client';

import React, { useState, useEffect } from 'react';
import { InventoryActionBar } from '../common/InventoryActionBar';
import { InventoryDataGrid, InventoryGridColumnDef } from '../common/InventoryDataGrid';
import { Calendar } from 'lucide-react';

interface DiscontinuedRow {
  id: number;
  discontinuedDate: string;
  status: string;
  itemName: string;
  spec: string;
  unit: string;
}

const SAMPLE_DISCONTINUED: DiscontinuedRow[] = [
  { id: 1, discontinuedDate: '2026-10-25', status: '단종완료', itemName: '구)치즈불닭삼각김밥', spec: '105g*1개', unit: 'ea' },
  { id: 2, discontinuedDate: '2026-10-20', status: '단종완료', itemName: '시즌한정)추억의도시락', spec: '420g*1팩', unit: 'ea' },
  { id: 3, discontinuedDate: '2026-10-15', status: '불용처리', itemName: '구형 원형용기 400ml(PP)', spec: '100ea*1줄', unit: 'box' },
  { id: 4, discontinuedDate: '2026-10-10', status: '단종완료', itemName: '통새우패티버거(단종)', spec: '190g*1개', unit: 'ea' },
  { id: 5, discontinuedDate: '2026-10-01', status: '불용처리', itemName: '구버전 비닐 쇼핑백(GFS)', spec: '1000장/롤', unit: '롤' },
];

export const DiscontinuedStatusView: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [periodType, setPeriodType] = useState('월간');
  const [dataList, setDataList] = useState<DiscontinuedRow[]>(SAMPLE_DISCONTINUED);

  useEffect(() => {
    fetch('/api/inventory/discontinued')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const mapped: DiscontinuedRow[] = json.data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            discontinuedDate: item.discontinuedDate || '2026-10-25',
            status: item.status || '단종완료',
            itemName: item.productName || item.productCode || '단종품목',
            spec: '표준규격',
            unit: 'ea',
          }));
          setDataList(mapped);
        }
      })
      .catch((err) => console.error('Fetch discontinued failed:', err));
  }, []);

  const handleShiftDay = (direction: -1 | 1) => {
    const cur = new Date(startDate);
    cur.setDate(cur.getDate() + direction);
    const newStr = cur.toISOString().split('T')[0];
    setStartDate(newStr);
    setEndDate(newStr);
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

  const COLUMNS: InventoryGridColumnDef[] = [
    { key: 'discontinuedDate', label: '단종(불용)일', width: '130px', align: 'center', format: 'date' },
    {
      key: 'status',
      label: '상태',
      width: '100px',
      align: 'center',
      render: (val) => {
        const isDone = val === '단종완료';
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${
              isDone
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-amber-50 text-amber-700 border-amber-300'
            }`}
          >
            {val}
          </span>
        );
      },
    },
    { key: 'itemName', minWidth: '260px', label: '품명', align: 'left' },
    { key: 'spec', label: '규격', width: '130px', align: 'center' },
    { key: 'unit', label: '단위', width: '70px', align: 'center' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <InventoryActionBar
        title="제품단종현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('제품단종현황이 조회되었습니다.') },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('조회 조건이 초기화되었습니다.') },
        ]}
        helpContent="단종 처리된 완제품 및 불용 처리된 부자재 목록과 단종 이력을 조회합니다."
      />

      {/* 2. 조회 조건바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              기준일자:
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
          <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
            데이터수: <span className="text-blue-700 font-bold">{dataList.length}</span> 건
          </span>
        </div>
      </div>

      {/* 3. 단일 그리드 */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full flex flex-col bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="flex-1 min-h-0">
            <InventoryDataGrid
              columns={COLUMNS}
              data={dataList}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

