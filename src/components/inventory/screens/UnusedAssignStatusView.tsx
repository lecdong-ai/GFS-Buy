'use client';

import React, { useState, useEffect } from 'react';
import { InventoryActionBar } from '../common/InventoryActionBar';
import { InventoryDataGrid, InventoryGridColumnDef } from '../common/InventoryDataGrid';
import { Calendar } from 'lucide-react';

interface UnusedStatusRow {
  id: number;
  assignDate: string;
  itemCode: string;
  category: string;
  partName: string;
  partSpec: string;
  unit: string;
  unusedQty: number;
  unitPrice: number;
  unusedAmount: number;
  assignReason: string;
  status: string;
}

const SAMPLE_ASSIGN_STATUS: UnusedStatusRow[] = [
  { id: 1, assignDate: '2026-10-30', itemCode: 'SM-OLD-01', category: '부재료', partName: '구형 샌드위치 필름(2025버전)', partSpec: '500m/롤', unit: '롤', unusedQty: 25, unitPrice: 32000, unusedAmount: 800000, assignReason: '패키지 리뉴얼', status: '지정완료' },
  { id: 2, assignDate: '2026-10-28', itemCode: 'RM-OLD-02', category: '원재료', partName: '계절한정 밤고구마 무스', partSpec: '1kg*10팩', unit: 'box', unusedQty: 12, unitPrice: 48000, unusedAmount: 576000, assignReason: '시즌 종료 단종', status: '폐기대기' },
  { id: 3, assignDate: '2026-10-25', itemCode: 'SM-OLD-03', category: '부재료', partName: '기획용 띠지 라벨(단종)', partSpec: '1000장/롤', unit: '롤', unusedQty: 8, unitPrice: 15000, unusedAmount: 120000, assignReason: '행사 종료', status: '지정완료' },
];

export const UnusedAssignStatusView: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [periodType, setPeriodType] = useState('월간');
  const [dataList, setDataList] = useState<UnusedStatusRow[]>(SAMPLE_ASSIGN_STATUS);

  useEffect(() => {
    fetch('/api/inventory/unused-material')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const mapped: UnusedStatusRow[] = json.data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            assignDate: item.assignDate || '2026-10-30',
            itemCode: item.productCode || `SM-OLD-${idx + 1}`,
            category: item.category || '부재료',
            partName: item.productName || item.productCode || '불용품목',
            partSpec: '표준규격',
            unit: item.unit || 'ea',
            unusedQty: Number(item.assignQty) || 0,
            unitPrice: 20000,
            unusedAmount: (Number(item.assignQty) || 0) * 20000,
            assignReason: item.remark || '불용 지정',
            status: item.status || '지정완료',
          }));
          setDataList(mapped);
        }
      })
      .catch((err) => console.error('Fetch unused status failed:', err));
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
    if (val === '일간') setEndDate(startDate);
    else if (val === '주간') {
      const end = new Date(cur);
      end.setDate(end.getDate() + 6);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (val === '월간') {
      const end = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const COLUMNS: InventoryGridColumnDef[] = [
    { key: 'assignDate', label: '지정일자', width: '90px', align: 'center', format: 'date' },
    { key: 'itemCode', label: '품목코드', width: '95px', align: 'center' },
    { key: 'category', label: '구분', width: '65px', align: 'center' },
    { key: 'partName', minWidth: '260px', label: '파트명', align: 'left' },
    { key: 'partSpec', label: '파트규격', width: '100px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    { key: 'unusedQty', label: '불용수량', width: '80px', align: 'right', format: 'number' },
    { key: 'unitPrice', label: '단가', width: '85px', align: 'right', format: 'currency' },
    { key: 'unusedAmount', label: '불용금액', width: '105px', align: 'right', format: 'currency' },
    { key: 'assignReason', label: '지정사유', width: '160px', align: 'left' },
    { key: 'status', label: '상태', width: '80px', align: 'center' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      <InventoryActionBar
        title="불용자재지정현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('조회 완료') },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('초기화 완료') },
        ]}
        helpContent="지정된 불용 자재의 목록과 금액, 처리 진행 상태(지정완료, 폐기대기, 전용 등)를 조회합니다."
      />

      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              조회기간:
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

        <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
          데이터수: <span className="text-blue-700 font-bold">{dataList.length}</span> 건
        </span>
      </div>

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

