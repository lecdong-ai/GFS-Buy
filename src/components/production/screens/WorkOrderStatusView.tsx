'use client';

import React, { useState, useEffect } from 'react';
import { ProductionActionBar } from '../common/ProductionActionBar';
import { ProductionDataGrid, ProductionGridColumnDef } from '../common/ProductionDataGrid';
import { GYE_MASTER_LIST, GyeMasterItem } from '../data/productionMasterData';
import { Calendar, Printer, FileSpreadsheet, Zap } from 'lucide-react';
import { usePipeline } from '@/context/PipelineContext';
import { usePrintReport } from '@/context/PrintReportContext';

interface WorkOrderDetail {
  id: number;
  gyeId: string;
  lineName: string;
  workSeq: number;
  partName: string;
  partSpec: string;
  unit: string;
  nextProcess: string;
  totalOrderQty: number;
  orderQty: number;
  prodQty: number;
  completeTime: string;
}

const SAMPLE_DETAILS: WorkOrderDetail[] = [
  // 성형장(김밥) - GFS005
  { id: 1, gyeId: 'GFS005', lineName: '김밥1호라인', workSeq: 1, partName: '참치마요김밥(밥김)', partSpec: '230g*1줄', unit: 'ea', nextProcess: '포장/검품', totalOrderQty: 4500, orderQty: 2500, prodQty: 2500, completeTime: '08:45' },
  { id: 2, gyeId: 'GFS005', lineName: '김밥1호라인', workSeq: 2, partName: '매콤제육김밥', partSpec: '240g*1줄', unit: 'ea', nextProcess: '포장/검품', totalOrderQty: 3200, orderQty: 1800, prodQty: 1800, completeTime: '10:15' },
  { id: 3, gyeId: 'GFS005', lineName: '김밥2호라인', workSeq: 1, partName: '소고기전주비빔김밥', partSpec: '235g*1줄', unit: 'ea', nextProcess: '포장/검품', totalOrderQty: 2800, orderQty: 1500, prodQty: 1200, completeTime: '진행중' },
  // 성형장(삼각김밥) - GFS007
  { id: 4, gyeId: 'GFS007', lineName: '삼각1호라인', workSeq: 1, partName: '참치마요삼각김밥', partSpec: '110g*1개', unit: 'ea', nextProcess: '금속검출기', totalOrderQty: 12000, orderQty: 6500, prodQty: 6500, completeTime: '09:20' },
  { id: 5, gyeId: 'GFS007', lineName: '삼각2호라인', workSeq: 1, partName: '전주비빔삼각김밥', partSpec: '115g*1개', unit: 'ea', nextProcess: '금속검출기', totalOrderQty: 9500, orderQty: 5000, prodQty: 4800, completeTime: '11:00' },
  // 성형장(도시락) - GFS004
  { id: 6, gyeId: 'GFS004', lineName: '도시락A라인', workSeq: 1, partName: '11가지찬많은도시락', partSpec: '460g*1팩', unit: 'ea', nextProcess: '탑실링/수축', totalOrderQty: 5200, orderQty: 3000, prodQty: 3000, completeTime: '10:40' },
  { id: 7, gyeId: 'GFS004', lineName: '도시락B라인', workSeq: 1, partName: '치킨마요덮밥도시락', partSpec: '410g*1팩', unit: 'ea', nextProcess: '탑실링/수축', totalOrderQty: 3800, orderQty: 2000, prodQty: 1850, completeTime: '진행중' },
  // 성형장(샌드위치) - GFS002
  { id: 8, gyeId: 'GFS002', lineName: '샌드1호라인', workSeq: 1, partName: '듬뿍에그샐러드샌드', partSpec: '180g*1개', unit: 'ea', nextProcess: '삼각포장', totalOrderQty: 3500, orderQty: 2000, prodQty: 2000, completeTime: '08:30' },
  { id: 9, gyeId: 'GFS002', lineName: '샌드2호라인', workSeq: 2, partName: '햄치즈클럽샌드위치', partSpec: '195g*1개', unit: 'ea', nextProcess: '삼각포장', totalOrderQty: 4000, orderQty: 2200, prodQty: 2100, completeTime: '10:50' },
  // 성형장(햄버거) - GFS003
  { id: 10, gyeId: 'GFS003', lineName: '버거1호라인', workSeq: 1, partName: '불고기버거(더블)', partSpec: '210g*1개', unit: 'ea', nextProcess: '필로우포장', totalOrderQty: 2500, orderQty: 1500, prodQty: 1500, completeTime: '09:00' },
  // 계량실(계량) - GFS046
  { id: 11, gyeId: 'GFS046', lineName: '계량자동화1', workSeq: 1, partName: '성경)참돌자반 계량', partSpec: '500g*1봉', unit: 'kg', nextProcess: '성형장(김밥)', totalOrderQty: 150, orderQty: 80, prodQty: 80, completeTime: '07:30' },
  { id: 12, gyeId: 'GFS046', lineName: '계량자동화1', workSeq: 2, partName: '순창고추장 조미액', partSpec: '10kg*1통', unit: 'kg', nextProcess: '조리실(볶음)', totalOrderQty: 300, orderQty: 180, prodQty: 180, completeTime: '08:10' },
  // 조리실(볶음) - GFS552
  { id: 13, gyeId: 'GFS552', lineName: '대형솥3기', workSeq: 1, partName: '제육불고기 볶음토핑', partSpec: '20kg*1배치', unit: 'kg', nextProcess: '냉각실(급랭)', totalOrderQty: 450, orderQty: 250, prodQty: 250, completeTime: '08:40' },
  { id: 14, gyeId: 'GFS552', lineName: '대형솥4기', workSeq: 2, partName: '소불고기 양념볶음', partSpec: '20kg*1배치', unit: 'kg', nextProcess: '냉각실(급랭)', totalOrderQty: 380, orderQty: 200, prodQty: 195, completeTime: '11:15' },
  // 취반(미반류) - GFS152
  { id: 15, gyeId: 'GFS152', lineName: '연속취반기1호', workSeq: 1, partName: '백미 초밥미반(김밥용)', partSpec: '50kg*1통', unit: 'kg', nextProcess: '성형장(김밥)', totalOrderQty: 1800, orderQty: 1000, prodQty: 1000, completeTime: '07:50' },
  { id: 16, gyeId: 'GFS152', lineName: '연속취반기2호', workSeq: 2, partName: '전주비빔 소스비빔밥', partSpec: '50kg*1통', unit: 'kg', nextProcess: '성형장(삼각)', totalOrderQty: 1200, orderQty: 700, prodQty: 700, completeTime: '08:30' },
];

export const WorkOrderStatusView: React.FC = () => {
  const { dispatchedWorkOrders, openPipelineModal } = usePipeline();
  const { openPrintModal } = usePrintReport();
  const [workDate, setWorkDate] = useState('2026년 10월 30일 금요일');
  const [shift, setShift] = useState<'1편' | '2편'>('1편');

  // Left Gye items with selection
  const [gyeList, setGyeList] = useState(
    GYE_MASTER_LIST.map((item) => ({
      ...item,
      checked: false,
    }))
  );
  const [selectedGyeId, setSelectedGyeId] = useState<string>('GFS005'); // Default: 성형장(김밥)
  const [selectAll, setSelectAll] = useState(false);
  const [dbOrders, setDbOrders] = useState<WorkOrderDetail[]>([]);

  useEffect(() => {
    fetch('/api/production/work-order')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: WorkOrderDetail[] = json.data.map((w: any) => ({
            id: w.id,
            gyeId: w.gyeId,
            lineName: w.gyeName || '작업라인',
            workSeq: w.workSeq || 1,
            partName: w.productName || w.product?.name || '제품',
            partSpec: w.spec || w.product?.spec || '',
            unit: w.unit || w.product?.unit || 'ea',
            nextProcess: w.nextProcess || '포장',
            totalOrderQty: w.orderQty || 1000,
            orderQty: w.orderQty || 1000,
            prodQty: w.prodQty || Math.round((w.orderQty || 1000) * 0.98),
            completeTime: w.completeTime || '10:00',
          }));
          setDbOrders(loaded);
        }
      })
      .catch((err) => console.error('Failed to load work orders', err));
  }, []);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setGyeList((prev) => prev.map((item) => ({ ...item, checked })));
  };

  const handleGyeCheck = (no: number, checked: boolean) => {
    setGyeList((prev) =>
      prev.map((item) => (item.no === no ? { ...item, checked } : item))
    );
  };

  // Filter right grid by selected Gye with live pipeline integration
  const pipelineForGye = dispatchedWorkOrders.filter((d) => d.gyeId === selectedGyeId);
  const dbForGye = dbOrders.filter((d) => d.gyeId === selectedGyeId);
  const displayDetails: WorkOrderDetail[] =
    pipelineForGye.length > 0
      ? pipelineForGye.map((p) => ({
          id: p.id,
          gyeId: p.gyeId,
          lineName: p.lineName,
          workSeq: p.workSeq,
          partName: p.partName,
          partSpec: p.partSpec,
          unit: p.unit,
          nextProcess: p.nextProcess,
          totalOrderQty: p.totalOrderQty,
          orderQty: shift === '1편' ? p.orderQty1 : p.orderQty2,
          prodQty: Math.round((shift === '1편' ? p.orderQty1 : p.orderQty2) * 0.98),
          completeTime: p.completeTime,
        }))
      : dbForGye.length > 0
      ? dbForGye
      : SAMPLE_DETAILS.filter((d) => d.gyeId === selectedGyeId).length > 0
      ? SAMPLE_DETAILS.filter((d) => d.gyeId === selectedGyeId)
      : SAMPLE_DETAILS.slice(0, 6);

  const selectedGyeItem = GYE_MASTER_LIST.find((g) => g.id === selectedGyeId);

  // Left columns
  const LEFT_COLUMNS: ProductionGridColumnDef[] = [
    {
      key: 'checked',
      label: '선택',
      width: '45px',
      align: 'center',
      format: 'checkbox',
      sortable: false,
      filterable: false,
    },
    {
      key: 'name',
      label: '계명칭',
      width: '140px',
      align: 'left',
    },
  ];

  // Right columns
  const RIGHT_COLUMNS: ProductionGridColumnDef[] = [
    { key: 'lineName', label: '라인명', width: '100px', align: 'left' },
    { key: 'workSeq', label: '작업순서', width: '65px', align: 'center', format: 'number' },
    { key: 'partName', minWidth: '260px', label: '파트명', align: 'left' },
    { key: 'partSpec', label: '파트규격', width: '100px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    { key: 'nextProcess', label: '다음공정', width: '100px', align: 'left' },
    { key: 'totalOrderQty', label: '합계지시량', width: '90px', align: 'right', format: 'number' },
    { key: 'orderQty', label: '지시수량', width: '85px', align: 'right', format: 'number' },
    { key: 'prodQty', label: '생산수량', width: '85px', align: 'right', format: 'number' },
    { key: 'completeTime', label: '작업완료시각', width: '95px', align: 'center' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <ProductionActionBar
        title="작업지시현황"
        buttons={[
          { key: 'pipeline', label: '⚡자동파이프라인', icon: 'list', onClick: openPipelineModal },
          { key: 'print1', label: '작업지시서(A4)', icon: 'print', onClick: () => openPrintModal('WORK_ORDER') },
          { key: 'save', label: '저장', icon: 'save', onClick: () => alert('작업지시 정보가 저장되었습니다.') },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('작업지시 데이터가 초기화되었습니다.') },
          { key: 'print2', label: '수량집계표', icon: 'list', onClick: () => openPrintModal('WORK_ORDER') },
          { key: 'print3', label: '작업지시서(라인)', icon: 'print', onClick: () => openPrintModal('WORK_ORDER') },
          { key: 'print4', label: '작업지시서(성형장)', icon: 'print', onClick: () => openPrintModal('WORK_ORDER') },
          { key: 'print5', label: '작업지시서(취반)', icon: 'print', onClick: () => openPrintModal('WORK_ORDER') },
        ]}
        helpContent="공정 계별 일일 작업지시 수량과 생산실적을 조회하고 라인별/공정별 작업지시서를 출력합니다."
      />

      {/* 2. 조회 조건바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              작업지시일:
            </span>
            <input
              type="text"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[185px] text-center"
            />
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">편수:</span>
            <label className="flex items-center gap-1 cursor-pointer text-gray-800 font-medium">
              <input
                type="radio"
                name="shift"
                checked={shift === '1편'}
                onChange={() => setShift('1편')}
                className="accent-blue-600 cursor-pointer"
              />
              1편
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-gray-800 font-medium">
              <input
                type="radio"
                name="shift"
                checked={shift === '2편'}
                onChange={() => setShift('2편')}
                className="accent-blue-600 cursor-pointer"
              />
              2편
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
            선택 공정: <span className="text-blue-700 font-bold">{selectedGyeItem ? `${selectedGyeItem.id} - ${selectedGyeItem.name}` : '전체'}</span>
          </span>
        </div>
      </div>

      {/* 3. 좌우 2분할 레이아웃 (좌측 약 25% : 우측 약 75%) */}
      <div className="flex-1 flex min-h-0 p-2 gap-2">
        {/* 좌측: 계 마스터 목록 */}
        <div className="w-[260px] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs shrink-0">
          <div className="bg-[#dfe3ec] px-2 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-[11px]">계</span>
              <label className="flex items-center gap-1 text-[11px] text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded accent-blue-600"
                />
                전체선택
              </label>
            </div>
            <span className="text-[11px] font-mono text-gray-600 font-bold bg-white px-1.5 py-0.2 rounded border border-gray-300">
              46
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <ProductionDataGrid
              columns={LEFT_COLUMNS}
              data={gyeList}
              selectedRowId={selectedGyeItem?.no}
              onRowClick={(row) => setSelectedGyeId(row.id)}
              onCellChange={(no, key, val) => {
                if (key === 'checked') handleGyeCheck(no, val);
              }}
              summaryRow={false}
            />
          </div>
        </div>

        {/* 우측: 세부데이터 그리드 */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">세부데이터</span>
              <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.2 rounded border border-blue-300 font-semibold">
                {selectedGyeItem?.name} ({shift})
              </span>
            </div>
            <span className="text-[11px] text-gray-600 font-medium">
              데이터수: <span className="font-bold text-blue-700">{displayDetails.length}</span> 건
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <ProductionDataGrid
              columns={RIGHT_COLUMNS}
              data={displayDetails}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

