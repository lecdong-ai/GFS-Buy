'use client';

import React, { useState, useEffect } from 'react';
import { InventoryActionBar } from '../common/InventoryActionBar';
import { InventoryDataGrid, InventoryGridColumnDef } from '../common/InventoryDataGrid';
import { Calendar } from 'lucide-react';
import { usePipeline } from '@/context/PipelineContext';
import { usePrintReport } from '@/context/PrintReportContext';

interface MatLedgerRow {
  id: number;
  ledgerDate: string;
  category: string;
  partName: string;
  partSpec: string;
  unit: string;
  warehouse: string;
  carriedOverQty: number; // 이월재고량
  inQty: number; // 입고량
  outQty: number; // 출고량
  currentStock: number; // 현재고 = 이월 + 입고 - 출고
}

const INITIAL_LEDGER_DATA: MatLedgerRow[] = [
  { id: 1, ledgerDate: '2026-10-30', category: '원재료', partName: '국내산 경기미 햅쌀', partSpec: '20kg/포', unit: '포', warehouse: '상온', carriedOverQty: 350, inQty: 500, outQty: 420, currentStock: 430 },
  { id: 2, ledgerDate: '2026-10-30', category: '원재료', partName: '가공 참치플레이크(오일)', partSpec: '1.8kg*6캔', unit: 'box', warehouse: '상온', carriedOverQty: 45, inQty: 20, outQty: 30, currentStock: 35 },
  { id: 3, ledgerDate: '2026-10-30', category: '원재료', partName: '[냉장]제육불고기 토핑', partSpec: '5kg*3ea', unit: 'kg', warehouse: '냉장1', carriedOverQty: 80, inQty: 150, outQty: 160, currentStock: 70 },
  { id: 4, ledgerDate: '2026-10-30', category: '원재료', partName: '골드마요네즈 3.2kg', partSpec: '3.2kg*4통', unit: 'box', warehouse: '상온', carriedOverQty: 60, inQty: 60, outQty: 75, currentStock: 45 },
  { id: 5, ledgerDate: '2026-10-30', category: '원재료', partName: '슬라이스치즈(고소한맛)', partSpec: '1kg*10팩', unit: 'box', warehouse: '냉장1', carriedOverQty: 25, inQty: 30, outQty: 35, currentStock: 20 },
  { id: 6, ledgerDate: '2026-10-30', category: '원재료', partName: '[냉장]다진맛살 10kg', partSpec: '10kg*2ea', unit: 'box', warehouse: '냉장1', carriedOverQty: 30, inQty: 40, outQty: 45, currentStock: 25 },
  { id: 7, ledgerDate: '2026-10-30', category: '원재료', partName: '[냉동]우양지 슬라이스', partSpec: '2kg*5팩', unit: 'box', warehouse: '냉동', carriedOverQty: 18, inQty: 10, outQty: 15, currentStock: 13 },
  { id: 8, ledgerDate: '2026-10-30', category: '원재료', partName: '[선]정제염(백설)', partSpec: '25kg/포', unit: 'kg', warehouse: '상온', carriedOverQty: 200, inQty: 80, outQty: 95, currentStock: 185 },
  { id: 9, ledgerDate: '2026-10-30', category: '부재료', partName: '도시락용 조미김 포션', partSpec: '2g*500봉', unit: 'box', warehouse: '부자재', carriedOverQty: 12, inQty: 3, outQty: 8, currentStock: 7 },
  { id: 10, ledgerDate: '2026-10-30', category: '부재료', partName: '두레)ET-30 용기', partSpec: '50ea*2줄', unit: 'box', warehouse: '부자재', carriedOverQty: 50, inQty: 30, outQty: 45, currentStock: 35 },
];

export const MatLedgerView: React.FC = () => {
  const { depletedMaterials, openPipelineModal } = usePipeline();
  const { openPrintModal } = usePrintReport();
  const [startDate, setStartDate] = useState('2026-10-30');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [periodType, setPeriodType] = useState('일간');
  const [ledgerData, setLedgerData] = useState<MatLedgerRow[]>(INITIAL_LEDGER_DATA);

  useEffect(() => {
    fetch('/api/inventory/ledger')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const mapped: MatLedgerRow[] = json.data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            ledgerDate: item.transDate || '2026-10-30',
            category: '원재료',
            partName: item.productCode || '자재',
            partSpec: '표준규격',
            unit: 'ea',
            warehouse: item.warehouse || '상온',
            carriedOverQty: Number(item.beforeQty) || 0,
            inQty: Number(item.inQty) || 0,
            outQty: Number(item.outQty) || 0,
            currentStock: Number(item.afterQty) || 0,
          }));
          setLedgerData(mapped);
        }
      })
      .catch((err) => console.error('Fetch ledger failed:', err));
  }, []);

  // Live integration with Pipeline Material Depletions
  const activeLedgerData: MatLedgerRow[] =
    depletedMaterials.length > 0
      ? depletedMaterials.map((m) => ({
          id: m.id,
          ledgerDate: m.ledgerDate,
          category: m.category,
          partName: m.partName,
          partSpec: m.partSpec,
          unit: m.unit,
          warehouse: m.warehouse,
          carriedOverQty: m.carriedOverQty,
          inQty: m.inQty,
          outQty: m.outQty,
          currentStock: m.currentStock,
        }))
      : ledgerData;

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
    { key: 'ledgerDate', label: '수불일자', width: '90px', align: 'center', format: 'date' },
    { key: 'category', label: '구분', width: '65px', align: 'center' },
    { key: 'partName', minWidth: '260px', label: '파트명', align: 'left' },
    { key: 'partSpec', label: '파트규격', width: '110px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    { key: 'warehouse', label: '창고', width: '100px', align: 'center' },
    { key: 'carriedOverQty', label: '이월재고량', width: '90px', align: 'right', format: 'number' },
    { key: 'inQty', label: '입고량', width: '85px', align: 'right', format: 'number' },
    { key: 'outQty', label: '출고량', width: '85px', align: 'right', format: 'number' },
    {
      key: 'currentStock',
      label: '현재고',
      width: '95px',
      align: 'right',
      render: (val, row) => {
        // Automatic calculation: carriedOver + inQty - outQty
        const calcStock = (row.carriedOverQty || 0) + (row.inQty || 0) - (row.outQty || 0);
        return (
          <span className={`font-mono font-bold ${calcStock < 0 ? 'text-red-600' : 'text-blue-800'}`}>
            {calcStock.toLocaleString()}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <InventoryActionBar
        title="자재수불부"
        buttons={[
          { key: 'pipeline', label: '⚡자동파이프라인', icon: 'search', onClick: openPipelineModal },
          { key: 'print', label: '수불부인쇄(A4)', icon: 'print', onClick: () => openPrintModal('MATERIAL_LEDGER') },
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('자재수불부가 조회되었습니다.') },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('조회 조건이 초기화되었습니다.') },
        ]}
        helpContent="원재료 및 부재료의 일자별 기초 이월재고, 입고량, 생산출고량 및 기말 현재고 수불 변동을 추적합니다."
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
          <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
            데이터수: <span className="text-blue-700 font-bold">{activeLedgerData.length}</span> 건
          </span>
        </div>
      </div>

      {/* 3. 전체 폭 단일 그리드 */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full flex flex-col bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="flex-1 min-h-0">
            <InventoryDataGrid
              columns={COLUMNS}
              data={activeLedgerData}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
