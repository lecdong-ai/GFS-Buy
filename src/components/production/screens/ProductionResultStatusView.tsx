'use client';

import React, { useState, useEffect } from 'react';
import { ProductionActionBar } from '../common/ProductionActionBar';
import {
  ProductionDataGrid,
  GridColumnItem,
} from '../common/ProductionDataGrid';
import { GYE_MASTER_LIST } from '../data/productionMasterData';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { usePrintReport } from '@/context/PrintReportContext';

interface ProductionResultRow {
  id: number;
  prodDate: string;
  gyeName: string;
  category: string;
  variety: string;
  itemName: string;
  spec: string;
  unit: string;
  prev2Order: number;
  prev2Prod: number;
  today1Order: number;
  today1Prod: number;
  totalOrder: number;
  totalProd: number;
  unitPrice: number;
  prodAmount: number;
  remark: string;
}

const SAMPLE_RESULT_DATA: ProductionResultRow[] = [
  { id: 1, prodDate: '2026-10-30', gyeName: '성형장(김밥)', category: '완제품', variety: '김밥', itemName: '참치마요김밥(밥김)', spec: '230g*1줄', unit: 'ea', prev2Order: 2000, prev2Prod: 2000, today1Order: 2500, today1Prod: 2500, totalOrder: 4500, totalProd: 4500, unitPrice: 1850, prodAmount: 8325000, remark: '정상 생산 완료' },
  { id: 2, prodDate: '2026-10-30', gyeName: '성형장(김밥)', category: '완제품', variety: '김밥', itemName: '매콤제육김밥', spec: '240g*1줄', unit: 'ea', prev2Order: 1400, prev2Prod: 1400, today1Order: 1800, today1Prod: 1800, totalOrder: 3200, totalProd: 3200, unitPrice: 1950, prodAmount: 6240000, remark: '정상 생산 완료' },
  { id: 3, prodDate: '2026-10-30', gyeName: '성형장(삼각김밥)', category: '완제품', variety: '삼각김밥', itemName: '참치마요삼각김밥', spec: '110g*1개', unit: 'ea', prev2Order: 5500, prev2Prod: 5500, today1Order: 6500, today1Prod: 6500, totalOrder: 12000, totalProd: 12000, unitPrice: 750, prodAmount: 9000000, remark: '정상 생산 완료' },
  { id: 4, prodDate: '2026-10-30', gyeName: '성형장(삼각김밥)', category: '완제품', variety: '삼각김밥', itemName: '전주비빔삼각김밥', spec: '115g*1개', unit: 'ea', prev2Order: 4500, prev2Prod: 4500, today1Order: 5000, today1Prod: 4800, totalOrder: 9500, totalProd: 9300, unitPrice: 780, prodAmount: 7254000, remark: '원료 부족 200개 미출' },
  { id: 5, prodDate: '2026-10-30', gyeName: '성형장(도시락)', category: '완제품', variety: '도시락', itemName: '11가지찬많은도시락', spec: '460g*1팩', unit: 'ea', prev2Order: 2200, prev2Prod: 2200, today1Order: 3000, today1Prod: 3000, totalOrder: 5200, totalProd: 5200, unitPrice: 3200, prodAmount: 16640000, remark: 'GS리테일 전용' },
  { id: 6, prodDate: '2026-10-30', gyeName: '성형장(샌드위치)', category: '완제품', variety: '샌드위치', itemName: '듬뿍에그샐러드샌드', spec: '180g*1개', unit: 'ea', prev2Order: 1500, prev2Prod: 1500, today1Order: 2000, today1Prod: 2000, totalOrder: 3500, totalProd: 3500, unitPrice: 1600, prodAmount: 5600000, remark: '' },
  { id: 7, prodDate: '2026-10-30', gyeName: '성형장(조리면)', category: '완제품', variety: '면류', itemName: '우삼겹김치볶음우동', spec: '350g*1팩', unit: 'ea', prev2Order: 800, prev2Prod: 800, today1Order: 1200, today1Prod: 1200, totalOrder: 2000, totalProd: 2000, unitPrice: 2800, prodAmount: 5600000, remark: '' },
  { id: 8, prodDate: '2026-10-30', gyeName: '성형장(햄버거)', category: '완제품', variety: '햄버거', itemName: '더블불고기버거', spec: '210g*1개', unit: 'ea', prev2Order: 1000, prev2Prod: 1000, today1Order: 1500, today1Prod: 1500, totalOrder: 2500, totalProd: 2500, unitPrice: 1900, prodAmount: 4750000, remark: '' },
];

export const ProductionResultStatusView: React.FC = () => {
  const { openPrintModal } = usePrintReport();
  const [startDate, setStartDate] = useState('2026-10-30');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [periodType, setPeriodType] = useState('일간');
  const [selectedGye, setSelectedGye] = useState('ALL');
  const [results, setResults] = useState<ProductionResultRow[]>(SAMPLE_RESULT_DATA);

  useEffect(() => {
    fetch('/api/production/result')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: ProductionResultRow[] = json.data.map((r: any, idx: number) => ({
            id: r.id || idx + 1,
            prodDate: r.resultDate,
            gyeName: r.gyeName || '성형장(김밥)',
            category: r.product?.category || '완제품',
            variety: r.product?.kind || '김밥',
            itemName: r.productName || r.product?.name || '제품',
            spec: r.product?.spec || '230g',
            unit: r.product?.unit || 'ea',
            prev2Order: Math.round(r.orderQty * 0.4),
            prev2Prod: Math.round(r.prodQty * 0.4),
            today1Order: Math.round(r.orderQty * 0.6),
            today1Prod: Math.round(r.prodQty * 0.6),
            totalOrder: r.orderQty,
            totalProd: r.prodQty,
            unitPrice: 2000,
            prodAmount: r.prodQty * 2000,
            remark: r.remark || '',
          }));
          setResults(loaded);
        }
      })
      .catch((err) => console.error('Failed to load production results', err));
  }, []);

  // Move dates by 1 day
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

  // Filter list
  const filteredList = results.filter((row) => {
    if (selectedGye !== 'ALL' && row.gyeName !== selectedGye) return false;
    return true;
  });

  // Calculate sum of production amount
  const totalProdAmount = filteredList.reduce((acc, row) => acc + row.prodAmount, 0);

  // 2-tier columns
  const COLUMNS: GridColumnItem[] = [
    { key: 'prodDate', label: '생산일', width: '90px', align: 'center', format: 'date' },
    { key: 'gyeName', label: '계명칭', width: '120px', align: 'left' },
    { key: 'category', label: '구분', width: '65px', align: 'center' },
    { key: 'variety', label: '품종', width: '75px', align: 'center' },
    { key: 'itemName', minWidth: '260px', label: '품명', align: 'left' },
    { key: 'spec', label: '규격', width: '100px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    {
      groupLabel: '전일2편',
      subColumns: [
        { key: 'prev2Order', label: '지시량', width: '70px', align: 'right', format: 'number' },
        { key: 'prev2Prod', label: '생산량', width: '70px', align: 'right', format: 'number' },
      ],
    },
    {
      groupLabel: '금일1편',
      subColumns: [
        { key: 'today1Order', label: '지시량', width: '70px', align: 'right', format: 'number' },
        { key: 'today1Prod', label: '생산량', width: '70px', align: 'right', format: 'number' },
      ],
    },
    {
      groupLabel: '합계',
      subColumns: [
        { key: 'totalOrder', label: '지시량', width: '75px', align: 'right', format: 'number' },
        { key: 'totalProd', label: '생산량', width: '75px', align: 'right', format: 'number' },
      ],
    },
    { key: 'unitPrice', label: '단가', width: '80px', align: 'right', format: 'currency' },
    { key: 'prodAmount', label: '생산금액', width: '110px', align: 'right', format: 'currency' },
    { key: 'remark', label: '비고', width: '180px', align: 'left' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <ProductionActionBar
        title="생산실적현황(GSR)"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('생산실적이 조회되었습니다.') },
          { key: 'lotLabel', label: 'LOT품질바코드라벨인쇄', icon: 'print', onClick: () => openPrintModal('LOT_LABEL') },
        ]}
        helpContent="일자별/기간별 및 작업장 계별 GS리테일 생산지시량 대비 실제 생산실적과 생산금액을 종합 조회합니다."
      />

      {/* 2. 조회 조건바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex flex-wrap items-center gap-3">
          {/* 기간 필터 */}
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

          {/* 라디오 버튼 */}
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

          {/* 계 드롭다운 */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">계:</span>
            <select
              value={selectedGye}
              onChange={(e) => setSelectedGye(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] rounded-xs shadow-2xs focus:outline-blue-500"
            >
              <option value="ALL">ALL (전체)</option>
              {GYE_MASTER_LIST.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.id} - {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
            데이터수: <span className="text-blue-700 font-bold">{filteredList.length}</span> 건
          </span>
        </div>
      </div>

      {/* 3. 단일 전체 그리드 */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full flex flex-col bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="flex-1 min-h-0">
            <ProductionDataGrid
              columns={COLUMNS}
              data={filteredList}
              summaryValues={{
                prodAmount: totalProdAmount,
              }}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

