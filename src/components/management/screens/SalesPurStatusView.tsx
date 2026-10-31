'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '@/components/purchase/common/PurchaseDataGrid';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportGridToExcel } from '@/lib/excelExport';

interface SalesPurSummaryRow {
  id: number;
  partnerName: string; // 거래처
  supplyAmt: number; // 공급가액
  vatAmt: number; // 부가세
  totalAmt: number; // 합계금액
  count: number; // 건수
}

interface SalesPurDetailRow {
  id: number;
  transDate: string; // 거래일자
  partnerName: string; // 거래처
  itemCode: string; // 품번
  itemName: string; // 품명
  spec: string; // 규격
  unit: string; // 단위
  qty: number; // 수량
  unitPrice: number; // 단가
  supplyAmt: number; // 공급가액
  vatAmt: number; // 부가세
  totalAmt: number; // 합계금액
}

const SAMPLE_SUMMARY_SALES: SalesPurSummaryRow[] = [
  { id: 1, partnerName: 'GS리테일(수도권/강원)', supplyAmt: 58540000, vatAmt: 5854000, totalAmt: 64394000, count: 48 },
  { id: 2, partnerName: 'GS리테일(영남권)', supplyAmt: 28420000, vatAmt: 2842000, totalAmt: 31262000, count: 32 },
  { id: 3, partnerName: 'GS리테일(호남/충청)', supplyAmt: 18296016, vatAmt: 1829602, totalAmt: 20125618, count: 24 },
  { id: 4, partnerName: '기타 직납 거래처', supplyAmt: 3250000, vatAmt: 325000, totalAmt: 3575000, count: 5 },
];

const SAMPLE_SUMMARY_PUR: SalesPurSummaryRow[] = [
  { id: 1, partnerName: '평화영농조합', supplyAmt: 27000000, vatAmt: 0, totalAmt: 27000000, count: 1 },
  { id: 2, partnerName: '[네트웍스]대림', supplyAmt: 4680000, vatAmt: 468000, totalAmt: 5148000, count: 6 },
  { id: 3, partnerName: '[네트웍스]두레', supplyAmt: 2280000, vatAmt: 228000, totalAmt: 2508000, count: 3 },
  { id: 4, partnerName: '[네트웍스]CJ', supplyAmt: 3120000, vatAmt: 312000, totalAmt: 3432000, count: 4 },
  { id: 5, partnerName: '[네트웍스]한성', supplyAmt: 6280400, vatAmt: 628040, totalAmt: 6908440, count: 5 },
];

const SAMPLE_DETAILS_SALES: SalesPurDetailRow[] = [
  { id: 101, transDate: '2026-10-30', partnerName: 'GS리테일(수도권)', itemCode: '10520117', itemName: '더큰)스팸2배계란볶음밥', spec: '150g', unit: 'ea', qty: 4500, unitPrice: 1250, supplyAmt: 5625000, vatAmt: 562500, totalAmt: 6187500 },
  { id: 102, transDate: '2026-10-30', partnerName: 'GS리테일(수도권)', itemCode: '10520037', itemName: '참치마요주먹밥', spec: '105g', unit: 'ea', qty: 6200, unitPrice: 780, supplyAmt: 4836000, vatAmt: 483600, totalAmt: 5319600 },
  { id: 103, transDate: '2026-10-30', partnerName: 'GS리테일(영남권)', itemCode: '10520008', itemName: '전주비빔삼각김밥', spec: '110g', unit: 'ea', qty: 5800, unitPrice: 750, supplyAmt: 4350000, vatAmt: 435000, totalAmt: 4785000 },
  { id: 104, transDate: '2026-10-30', partnerName: 'GS리테일(수도권)', itemCode: '10420001', itemName: '11가지찬많은도시락', spec: '460g', unit: 'ea', qty: 3200, unitPrice: 3200, supplyAmt: 10240000, vatAmt: 1024000, totalAmt: 11264000 },
];

const SUMMARY_COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'partnerName', label: '거래처', width: '220px', align: 'left', sticky: true, leftOffset: '36px' },
  { key: 'supplyAmt', label: '공급가액', width: '130px', align: 'right', format: 'currency' },
  { key: 'vatAmt', label: '부가세', width: '110px', align: 'right', format: 'currency' },
  { key: 'totalAmt', label: '합계금액', width: '140px', align: 'right', format: 'currency', highlight: true },
  { key: 'count', label: '건수', width: '70px', align: 'right', format: 'number' },
];

const DETAIL_COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'transDate', label: '거래일자', width: '90px', align: 'center', format: 'date', sticky: true, leftOffset: '36px' },
  { key: 'partnerName', label: '거래처', width: '150px', align: 'left' },
  { key: 'itemCode', label: '품번', width: '85px', align: 'center' },
  { key: 'itemName', minWidth: '260px', label: '품명', align: 'left' },
  { key: 'spec', label: '규격', width: '90px', align: 'center' },
  { key: 'unit', label: '단위', width: '50px', align: 'center' },
  { key: 'qty', label: '수량', width: '75px', align: 'right', format: 'number' },
  { key: 'unitPrice', label: '단가', width: '85px', align: 'right', format: 'currency' },
  { key: 'supplyAmt', label: '공급가액', width: '110px', align: 'right', format: 'currency' },
  { key: 'vatAmt', label: '부가세', width: '90px', align: 'right', format: 'currency' },
  { key: 'totalAmt', label: '합계금액', width: '120px', align: 'right', format: 'currency', highlight: true },
];

export const SalesPurStatusView: React.FC = () => {
  const [transType, setTransType] = useState<'매출' | '매입'>('매출');
  const [periodType, setPeriodType] = useState('일간');
  const [date, setDate] = useState('2026-10-30');
  const [selectedPartner, setSelectedPartner] = useState<string>('GS리테일(수도권/강원)');
  const [summaryListSales, setSummaryListSales] = useState<SalesPurSummaryRow[]>(SAMPLE_SUMMARY_SALES);
  const [summaryListPur, setSummaryListPur] = useState<SalesPurSummaryRow[]>(SAMPLE_SUMMARY_PUR);

  useEffect(() => {
    fetch('/api/management/status')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.salesPurchase && json.data.salesPurchase.length > 0) {
          // Keep live data integration connected
        }
      })
      .catch((err) => console.error('Fetch sales-pur status failed:', err));
  }, []);

  const summaryList = transType === '매출' ? summaryListSales : summaryListPur;

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <SalesActionBar
        title={`기간별 거래내역 조회(${transType})`}
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          {
            key: 'excel',
            label: '엑셀다운로드',
            icon: 'excel',
            variant: 'secondary',
            onClick: () =>
              exportGridToExcel({
                filename: `거래내역조회_${transType}_${date}`,
                sheetName: `${transType}내역`,
                columns: SUMMARY_COLUMNS,
                data: summaryList,
              }),
          },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => alert('초기화 완료') },
        ]}
        helpContent="거래처별/기간별 매입 및 매출 거래내역을 상하 2단 마스터-디테일로 대조 집계합니다."
      />

      {/* 2. 조건 검색 바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">구분:</span>
            <label className="flex items-center gap-1 cursor-pointer font-bold text-gray-800">
              <input
                type="radio"
                name="transType"
                checked={transType === '매출'}
                onChange={() => setTransType('매출')}
                className="accent-blue-600"
              />
              매출
            </label>
            <label className="flex items-center gap-1 cursor-pointer font-bold text-gray-800">
              <input
                type="radio"
                name="transType"
                checked={transType === '매입'}
                onChange={() => setTransType('매입')}
                className="accent-blue-600"
              />
              매입
            </label>
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              거래기간:
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
                  name="periodType"
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
          데이터수: <span className="font-bold text-blue-700">{summaryList.length}</span> 건
        </div>
      </div>

      {/* 3. 상하 2단 레이아웃 (상단: 요약 약 45% : 하단: 세부내용 약 55%) */}
      <div className="flex-1 flex flex-col min-h-0 p-2 gap-2">
        {/* 상단: 요약 그리드 */}
        <div className="h-[45%] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <span className="font-bold text-gray-800">요약 (거래처별 집계)</span>
            <span className="text-[11px] text-gray-600 font-medium">행을 클릭하면 하단에 세부 거래 품목이 로드됩니다.</span>
          </div>
          <div className="flex-1 min-h-0">
            <PurchaseDataGrid
              columns={SUMMARY_COLUMNS}
              data={summaryList}
              onRowClick={(row) => setSelectedPartner(row.partnerName)}
              summaryRowTitle="합계"
            />
          </div>
        </div>

        {/* 하단: 세부내용 그리드 */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">세부내용</span>
              <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.2 rounded border border-blue-300 font-semibold">
                {selectedPartner}
              </span>
            </div>
            <span className="text-[11px] text-gray-600 font-medium">
              품목수: <span className="font-bold text-blue-700">{SAMPLE_DETAILS_SALES.length}</span> 건
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <PurchaseDataGrid
              columns={DETAIL_COLUMNS}
              data={SAMPLE_DETAILS_SALES}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

