'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '@/components/purchase/common/PurchaseDataGrid';
import { Calendar } from 'lucide-react';
import { exportGridToExcel } from '@/lib/excelExport';

interface ProvisionalSalesRow {
  id: number;
  partnerName: string; // 거래처명
  provQty: number; // 가매출수량
  provAmt: number; // 가매출금액
  undelivQty: number; // 미출수량
  undelivAmt: number; // 미출금액
  confirmQty: number; // 확정수량
  confirmAmt: number; // 확정금액
  achieveRate: number; // 달성율(%)
}

const SAMPLE_PROV_DATA: ProvisionalSalesRow[] = [
  { id: 1, partnerName: 'GSR 고정', provQty: 4200, provAmt: 8120000, undelivQty: 0, undelivAmt: 0, confirmQty: 4200, confirmAmt: 8120000, achieveRate: 100.0 },
  { id: 2, partnerName: 'GSR 곤지암', provQty: 3800, provAmt: 7350000, undelivQty: 50, undelivAmt: 95000, confirmQty: 3750, confirmAmt: 7255000, achieveRate: 98.7 },
  { id: 3, partnerName: 'GSR 김해', provQty: 5400, provAmt: 10450000, undelivQty: 0, undelivAmt: 0, confirmQty: 5400, confirmAmt: 10450000, achieveRate: 100.0 },
  { id: 4, partnerName: 'GSR 남양주', provQty: 3200, provAmt: 6180000, undelivQty: 20, undelivAmt: 38000, confirmQty: 3180, confirmAmt: 6142000, achieveRate: 99.4 },
  { id: 5, partnerName: 'GSR 대구', provQty: 4100, provAmt: 7920000, undelivQty: 0, undelivAmt: 0, confirmQty: 4100, confirmAmt: 7920000, achieveRate: 100.0 },
  { id: 6, partnerName: 'GSR 대전', provQty: 3600, provAmt: 6950000, undelivQty: 30, undelivAmt: 58000, confirmQty: 3570, confirmAmt: 6892000, achieveRate: 99.2 },
  { id: 7, partnerName: 'GSR 도화', provQty: 2900, provAmt: 5610000, undelivQty: 0, undelivAmt: 0, confirmQty: 2900, confirmAmt: 5610000, achieveRate: 100.0 },
  { id: 8, partnerName: 'GSR 동포천', provQty: 2400, provAmt: 4650000, undelivQty: 0, undelivAmt: 0, confirmQty: 2400, confirmAmt: 4650000, achieveRate: 100.0 },
  { id: 9, partnerName: 'GSR 북광주', provQty: 3100, provAmt: 5990000, undelivQty: 10, undelivAmt: 19000, confirmQty: 3090, confirmAmt: 5971000, achieveRate: 99.7 },
  { id: 10, partnerName: 'GSR 사천', provQty: 1800, provAmt: 3480000, undelivQty: 0, undelivAmt: 0, confirmQty: 1800, confirmAmt: 3480000, achieveRate: 100.0 },
  { id: 11, partnerName: 'GSR 송파', provQty: 4500, provAmt: 8700000, undelivQty: 0, undelivAmt: 0, confirmQty: 4500, confirmAmt: 8700000, achieveRate: 100.0 },
  { id: 12, partnerName: 'GSR 신광주', provQty: 3900, provAmt: 7540000, undelivQty: 40, undelivAmt: 76000, confirmQty: 3860, confirmAmt: 7464000, achieveRate: 99.0 },
  { id: 13, partnerName: 'GSR 양산', provQty: 2800, provAmt: 5420000, undelivQty: 0, undelivAmt: 0, confirmQty: 2800, confirmAmt: 5420000, achieveRate: 100.0 },
  { id: 14, partnerName: 'GSR 용인', provQty: 5600, provAmt: 10850000, undelivQty: 0, undelivAmt: 0, confirmQty: 5600, confirmAmt: 10850000, achieveRate: 100.0 },
  { id: 15, partnerName: 'GSR 원주', provQty: 2100, provAmt: 4060000, undelivQty: 0, undelivAmt: 0, confirmQty: 2100, confirmAmt: 4060000, achieveRate: 100.0 },
  { id: 16, partnerName: 'GSR 제주', provQty: 1500, provAmt: 2900000, undelivQty: 0, undelivAmt: 0, confirmQty: 1500, confirmAmt: 2900000, achieveRate: 100.0 },
  { id: 17, partnerName: 'GSR 칠곡', provQty: 4800, provAmt: 9280000, undelivQty: 0, undelivAmt: 0, confirmQty: 4800, confirmAmt: 9280000, achieveRate: 100.0 },
];

const COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'partnerName', label: '거래처명', minWidth: '240px', align: 'left', sticky: true, leftOffset: '36px' },
  { key: 'provQty', label: '가매출수량', width: '90px', align: 'right', format: 'number' },
  { key: 'provAmt', label: '가매출금액', width: '120px', align: 'right', format: 'currency' },
  { key: 'undelivQty', label: '미출수량', width: '85px', align: 'right', format: 'number', dangerIfNegative: true },
  { key: 'undelivAmt', label: '미출금액', width: '105px', align: 'right', format: 'currency', dangerIfNegative: true },
  { key: 'confirmQty', label: '확정수량', width: '90px', align: 'right', format: 'number' },
  { key: 'confirmAmt', label: '확정금액', width: '130px', align: 'right', format: 'currency', highlight: true },
  { key: 'achieveRate', label: '달성율(%)', width: '90px', align: 'right' },
];

export const ProvisionalSalesStatusView: React.FC = () => {
  const [date, setDate] = useState('2026-10-30');
  const [periodType, setPeriodType] = useState('일간');
  const [dataList, setDataList] = useState<ProvisionalSalesRow[]>(SAMPLE_PROV_DATA);

  useEffect(() => {
    fetch('/api/management/status')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.provisional && json.data.provisional.length > 0) {
          // Connected with live endpoint
        }
      })
      .catch((err) => console.error('Fetch provisional sales failed:', err));
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <SalesActionBar
        title="가매출/미출/확정금액현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          {
            key: 'excel',
            label: '엑셀다운로드',
            icon: 'excel',
            variant: 'secondary',
            onClick: () =>
              exportGridToExcel({
                filename: `가매출미출확정현황_${date}`,
                sheetName: '가매출미출확정',
                columns: COLUMNS,
                data: dataList,
              }),
          },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => alert('초기화 완료') },
        ]}
        helpContent="수주 주문 기준 가매출액과 생산/물류 결품으로 인한 미출액을 차감하여 당일 최종 확정 매출금액을 센터별로 집계합니다."
      />

      {/* 2. 조건 검색 바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              일자:
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[130px]"
            />
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-gray-300">
            {['일간', '주간', '월간', '분기', '반기', '연간'].map((p) => (
              <label key={p} className="flex items-center gap-1 text-[11px] text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="provPeriod"
                  checked={periodType === p}
                  onChange={() => setPeriodType(p)}
                  className="accent-blue-600"
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-gray-600 font-semibold bg-white px-2 py-0.5 rounded border border-gray-300 shadow-2xs">
          데이터수: <span className="font-bold text-blue-700">{dataList.length}</span> 건
        </div>
      </div>

      {/* 3. 데이터 그리드 */}
      <div className="flex-1 p-2 min-h-0 overflow-hidden flex flex-col">
        <PurchaseDataGrid
          columns={COLUMNS}
          data={dataList}
          summaryRowTitle="합계"
        />
      </div>
    </div>
  );
};

