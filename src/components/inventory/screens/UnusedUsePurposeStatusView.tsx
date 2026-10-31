'use client';

import React, { useState, useEffect } from 'react';
import { InventoryActionBar } from '../common/InventoryActionBar';
import { InventoryDataGrid, InventoryGridColumnDef } from '../common/InventoryDataGrid';
import { Calendar } from 'lucide-react';

interface PurposeUseRow {
  id: number;
  useDate: string;
  purpose: string;
  itemCode: string;
  partName: string;
  partSpec: string;
  unit: string;
  useQty: number;
  targetProduct: string;
  remark: string;
}

const SAMPLE_PURPOSE_USE: PurposeUseRow[] = [
  { id: 1, useDate: '2026-10-30', purpose: '연구개발 테스트', itemCode: 'SM-OLD-01', partName: '구형 샌드위치 필름(2025버전)', partSpec: '500m/롤', unit: '롤', useQty: 5, targetProduct: '시제품 연구실', remark: '신제품 포장 강도 테스트' },
  { id: 2, useDate: '2026-10-29', purpose: '대체 투입', itemCode: 'RM-OLD-02', partName: '계절한정 밤고구마 무스', partSpec: '1kg*10팩', unit: 'box', useQty: 2, targetProduct: '고구마샐러드샌드', remark: '정규 레시피 대체 승인' },
  { id: 3, useDate: '2026-10-26', purpose: '교육 실습용', itemCode: 'SM-OLD-03', partName: '기획용 띠지 라벨(단종)', partSpec: '1000장/롤', unit: '롤', useQty: 3, targetProduct: '현장 교육훈련', remark: '신규 입사자 포장 라인 실습' },
];

export const UnusedUsePurposeStatusView: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [periodType, setPeriodType] = useState('월간');
  const [dataList, setDataList] = useState<PurposeUseRow[]>(SAMPLE_PURPOSE_USE);

  useEffect(() => {
    fetch('/api/inventory/unused-material')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const usedOnly = json.data.filter((item: any) => item.status === '사용' || (Number(item.useQty) || 0) > 0);
          if (usedOnly.length > 0) {
            const mapped: PurposeUseRow[] = usedOnly.map((item: any, idx: number) => ({
              id: item.id || idx + 1,
              useDate: item.assignDate || '2026-10-30',
              purpose: item.usePurpose || '연구개발 테스트',
              itemCode: item.productCode || `SM-OLD-${idx + 1}`,
              partName: item.productName || item.productCode || '불용품목',
              partSpec: '표준규격',
              unit: item.unit || 'ea',
              useQty: Number(item.useQty) || Number(item.assignQty) || 0,
              targetProduct: '시제품 연구실',
              remark: item.remark || '',
            }));
            setDataList(mapped);
          }
        }
      })
      .catch((err) => console.error('Fetch unused purpose use failed:', err));
  }, []);

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
    { key: 'useDate', label: '사용일자', width: '90px', align: 'center', format: 'date' },
    { key: 'purpose', label: '사용목적', width: '140px', align: 'left' },
    { key: 'itemCode', label: '품목코드', width: '95px', align: 'center' },
    { key: 'partName', minWidth: '260px', label: '파트명', align: 'left' },
    { key: 'partSpec', label: '파트규격', width: '100px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    { key: 'useQty', label: '사용수량', width: '80px', align: 'right', format: 'number' },
    { key: 'targetProduct', label: '대체투입처', width: '150px', align: 'left' },
    { key: 'remark', label: '비고', width: '180px', align: 'left' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      <InventoryActionBar
        title="불용자재사용현황(목적별)"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('조회 완료') },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('초기화 완료') },
        ]}
        helpContent="불용 자재의 사용 목적(연구개발, 대체투입, 교육실습 등)별 출고 수량과 활용 내역을 조회합니다."
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

