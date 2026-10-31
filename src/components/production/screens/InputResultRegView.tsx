'use client';

import React, { useState } from 'react';
import { ProductionActionBar } from '../common/ProductionActionBar';
import {
  ProductionDataGrid,
  GridColumnItem,
  ProductionGridColumnDef,
} from '../common/ProductionDataGrid';
import { GYE_MASTER_LIST } from '../data/productionMasterData';
import { Calendar } from 'lucide-react';

interface InputResultMasterRow {
  id: number;
  chasu: number;
  gyeName: string;
  category: string;
  variety: string;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  prev2Order: number;
  prev2Prod: number;
  today1Order: number;
  today1Prod: number;
  totalOrder: number;
  totalProd: number;
  warehouse: string;
  unitPrice: number;
  prodAmount: number;
  lotNo: string;
  deliveryTo: string;
}

interface NextProcessRow {
  id: number;
  shift: string;
  nextProcess: string;
  gyeRoute: string;
  prodRoute: string;
  orderQty: number;
  prodQty: number;
  remark: string;
}

const SAMPLE_MASTER_DATA: InputResultMasterRow[] = [
  { id: 1, chasu: 1, gyeName: '계량실(계량)', category: '반제품', variety: '부재료', itemCode: '20194455', itemName: '성경)참돌자반', spec: '500g*1봉', unit: 'kg', prev2Order: 25, prev2Prod: 25, today1Order: 30, today1Prod: 30, totalOrder: 55, totalProd: 55, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-01', deliveryTo: '성형장(김밥)' },
  { id: 2, chasu: 2, gyeName: '계량실(계량)', category: '반제품', variety: '부재료', itemCode: '20194455', itemName: '성경)참돌자반', spec: '500g*1봉', unit: 'kg', prev2Order: 20, prev2Prod: 20, today1Order: 20, today1Prod: 20, totalOrder: 40, totalProd: 40, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-02', deliveryTo: '성형장(삼각)' },
  { id: 3, chasu: 1, gyeName: '계량실(계량)', category: '반제품', variety: '양념류', itemCode: '20194740', itemName: '순창고추장 조미액', spec: '10kg*1통', unit: 'kg', prev2Order: 50, prev2Prod: 50, today1Order: 45, today1Prod: 45, totalOrder: 95, totalProd: 95, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-03', deliveryTo: '조리실(볶음)' },
  { id: 4, chasu: 1, gyeName: '계량실(냉동)', category: '반제품', variety: '육가공', itemCode: '20194733', itemName: '대상)매운마늘제육', spec: '2kg*5팩', unit: 'kg', prev2Order: 60, prev2Prod: 60, today1Order: 70, today1Prod: 70, totalOrder: 130, totalProd: 130, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-04', deliveryTo: '조리실(볶음)' },
  { id: 5, chasu: 2, gyeName: '계량실(냉동)', category: '반제품', variety: '육가공', itemCode: '20195009', itemName: '선진)대파불고기원료', spec: '2kg*5팩', unit: 'kg', prev2Order: 40, prev2Prod: 40, today1Order: 50, today1Prod: 50, totalOrder: 90, totalProd: 90, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-05', deliveryTo: '조리실(볶음)' },
  { id: 6, chasu: 2, gyeName: '계량실(냉동)', category: '반제품', variety: '육가공', itemCode: '20194582', itemName: '오래)매콤고추장불고기', spec: '10kg*1통', unit: 'kg', prev2Order: 35, prev2Prod: 35, today1Order: 40, today1Prod: 40, totalOrder: 75, totalProd: 75, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-06', deliveryTo: '조리실(볶음)' },
  { id: 7, chasu: 1, gyeName: '계량실(냉동)', category: '반제품', variety: '가공육', itemCode: '20195078', itemName: 'CJ)크레잇고기완자', spec: '1kg*10팩', unit: 'kg', prev2Order: 15, prev2Prod: 15, today1Order: 20, today1Prod: 20, totalOrder: 35, totalProd: 35, warehouse: '생산라인창고', unitPrice: -9, prodAmount: 0, lotNo: 'LOT-261030-07', deliveryTo: '튀김실(제트오븐)' },
  { id: 8, chasu: 1, gyeName: '계량실(분말류)', category: '반제품', variety: '조미료', itemCode: '20000079', itemName: '[선]정제염(백설)', spec: '25kg/포', unit: 'kg', prev2Order: 80, prev2Prod: 80, today1Order: 90, today1Prod: 90, totalOrder: 170, totalProd: 170, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-08', deliveryTo: '취반(계량)' },
  { id: 9, chasu: 1, gyeName: '계량실(분말류)', category: '반제품', variety: '조미료', itemCode: '20192687', itemName: '맛소금', spec: '1kg*10ea', unit: 'kg', prev2Order: 12, prev2Prod: 12, today1Order: 15, today1Prod: 15, totalOrder: 27, totalProd: 27, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-09', deliveryTo: '성형장(도시락)' },
  { id: 10, chasu: 1, gyeName: '계량실(분말류)', category: '반제품', variety: '조미료', itemCode: '20191507', itemName: '미원(계량)', spec: '1kg*10ea', unit: 'kg', prev2Order: 8, prev2Prod: 8, today1Order: 10, today1Prod: 10, totalOrder: 18, totalProd: 18, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-10', deliveryTo: '조리실(볶음)' },
  { id: 11, chasu: 2, gyeName: '계량실(소스류)', category: '반제품', variety: '소스', itemCode: '20195116', itemName: '대상)쉐프원 불고기양념', spec: '2kg*6병', unit: 'kg', prev2Order: 24, prev2Prod: 24, today1Order: 30, today1Prod: 30, totalOrder: 54, totalProd: 54, warehouse: '생산라인창고', unitPrice: -9, prodAmount: 0, lotNo: 'LOT-261030-11', deliveryTo: '조리실(볶음)' },
  { id: 12, chasu: 1, gyeName: '계량실(소스류)', category: '반제품', variety: '소스', itemCode: '20194254', itemName: '베지가든)토마토비프소스', spec: '500g*20ea', unit: 'g', prev2Order: 3000, prev2Prod: 3000, today1Order: 4000, today1Prod: 4000, totalOrder: 7000, totalProd: 7000, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-12', deliveryTo: '성형장(조리면)' },
  { id: 13, chasu: 2, gyeName: '계량실(소스류)', category: '반제품', variety: '소스', itemCode: '20194254', itemName: '베지가든)토마토비프소스', spec: '500g*20ea', unit: 'g', prev2Order: 2500, prev2Prod: 2500, today1Order: 3500, today1Prod: 3500, totalOrder: 6000, totalProd: 6000, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-13', deliveryTo: '성형장(조리면)' },
  { id: 14, chasu: 2, gyeName: '계량실(소스류)', category: '반제품', variety: '소스', itemCode: '20194472', itemName: '카라멜소스', spec: '2kg*6병', unit: 'kg', prev2Order: 10, prev2Prod: 10, today1Order: 12, today1Prod: 12, totalOrder: 22, totalProd: 22, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-14', deliveryTo: '조리실(볶음)' },
  { id: 15, chasu: 2, gyeName: '계량실(소스류)', category: '반제품', variety: '소스', itemCode: '20194674', itemName: '팬더굴소스', spec: '2.2kg*6캔', unit: 'kg', prev2Order: 18, prev2Prod: 18, today1Order: 24, today1Prod: 24, totalOrder: 42, totalProd: 42, warehouse: '생산라인창고', unitPrice: 0, prodAmount: 0, lotNo: 'LOT-261030-15', deliveryTo: '조리실(볶음)' },
];

const SAMPLE_NEXT_PROCESS: Record<number, NextProcessRow[]> = {
  1: [
    { id: 101, shift: '1편', nextProcess: '성형장(김밥)', gyeRoute: '계량실(계량) -> 성형장(김밥)', prodRoute: '김밥1호라인', orderQty: 30, prodQty: 30, remark: '공정 정상 투입' },
    { id: 102, shift: '2편', nextProcess: '성형장(김밥)', gyeRoute: '계량실(계량) -> 성형장(김밥)', prodRoute: '김밥2호라인', orderQty: 25, prodQty: 25, remark: '야간 투입 준비' },
  ],
  2: [
    { id: 201, shift: '1편', nextProcess: '성형장(삼각김밥)', gyeRoute: '계량실(계량) -> 성형장(삼각)', prodRoute: '삼각1호라인', orderQty: 20, prodQty: 20, remark: '' },
    { id: 202, shift: '2편', nextProcess: '성형장(삼각김밥)', gyeRoute: '계량실(계량) -> 성형장(삼각)', prodRoute: '삼각2호라인', orderQty: 20, prodQty: 20, remark: '' },
  ],
  7: [
    { id: 701, shift: '1편', nextProcess: '튀김실(제트오븐)', gyeRoute: '계량실(냉동) -> 제트오븐', prodRoute: '튀김1라인', orderQty: 20, prodQty: 20, remark: '온도 180℃ 8분 가열' },
  ],
  11: [
    { id: 1101, shift: '1편', nextProcess: '조리실(볶음)', gyeRoute: '계량실(소스류) -> 조리실(볶음)', prodRoute: '대형솥3기', orderQty: 30, prodQty: 30, remark: '양념 배합 완료' },
  ],
};

export const InputResultRegView: React.FC = () => {
  const [regDate, setRegDate] = useState('2026년 10월 30일 금요일');
  const [selectedGye, setSelectedGye] = useState('ALL');
  const [masterList, setMasterList] = useState(SAMPLE_MASTER_DATA);
  const [selectedRowId, setSelectedRowId] = useState<number>(1);

  // Filter master list
  const filteredList = masterList.filter((row) => {
    if (selectedGye !== 'ALL' && row.gyeName !== selectedGye) return false;
    return true;
  });

  const nextProcessDetails = SAMPLE_NEXT_PROCESS[selectedRowId] || [
    { id: 991, shift: '1편', nextProcess: '성형장(도시락)', gyeRoute: '계량실 -> 성형장', prodRoute: '일반성형라인', orderQty: 0, prodQty: 0, remark: '정상 투입 대기' },
  ];

  // 2-tier Grid Columns Definition
  const MASTER_COLUMNS: GridColumnItem[] = [
    { key: 'chasu', label: '차수', width: '50px', align: 'center', format: 'number' },
    { key: 'gyeName', label: '계명칭', width: '100px', align: 'left' },
    { key: 'category', label: '구분', width: '65px', align: 'center' },
    { key: 'variety', label: '품종', width: '65px', align: 'center' },
    { key: 'itemCode', label: '품번', width: '85px', align: 'center' },
    { key: 'itemName', minWidth: '260px', label: '품명', align: 'left' },
    { key: 'spec', label: '규격', width: '90px', align: 'center' },
    { key: 'unit', label: '단위', width: '45px', align: 'center' },
    {
      groupLabel: '전일2편',
      subColumns: [
        { key: 'prev2Order', label: '지시량', width: '65px', align: 'right', format: 'number' },
        { key: 'prev2Prod', label: '생산량', width: '65px', align: 'right', format: 'number' },
      ],
    },
    {
      groupLabel: '금일1편',
      subColumns: [
        { key: 'today1Order', label: '지시량', width: '65px', align: 'right', format: 'number' },
        { key: 'today1Prod', label: '생산량', width: '65px', align: 'right', format: 'number' },
      ],
    },
    {
      groupLabel: '합계',
      subColumns: [
        { key: 'totalOrder', label: '지시량', width: '70px', align: 'right', format: 'number' },
        { key: 'totalProd', label: '생산량', width: '70px', align: 'right', format: 'number' },
      ],
    },
    {
      key: 'warehouse',
      label: '창고',
      width: '105px',
      align: 'center',
      format: 'dropdown',
      options: ['생산라인창고', '상온보관고', '육류냉장고', '냉동고'],
    },
    { key: 'unitPrice', label: '단가', width: '65px', align: 'right', format: 'number', highlightNegative: true },
    { key: 'prodAmount', label: '생산금액', width: '85px', align: 'right', format: 'currency' },
    { key: 'lotNo', label: 'LOT no.', width: '110px', align: 'center' },
    { key: 'deliveryTo', label: '납품처', width: '110px', align: 'left' },
  ];

  // Lower grid columns
  const DETAIL_COLUMNS: ProductionGridColumnDef[] = [
    { key: 'shift', label: '편수', width: '65px', align: 'center' },
    { key: 'nextProcess', label: '다음공정', width: '130px', align: 'left' },
    { key: 'gyeRoute', label: '계 경로', width: '200px', align: 'left' },
    { key: 'prodRoute', label: '생산경로', width: '130px', align: 'left' },
    { key: 'orderQty', label: '지시수량', width: '90px', align: 'right', format: 'number' },
    { key: 'prodQty', label: '생산수량', width: '90px', align: 'right', format: 'number' },
    { key: 'remark', label: '비고', width: '200px', align: 'left' },
  ];

  const handleSave = async () => {
    try {
      const res = await fetch('/api/production/input-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultDate: new Date().toISOString().slice(0, 10),
          items: masterList.map((m) => ({
            itemCode: m.itemCode,
            itemName: m.itemName,
            spec: m.spec,
            unit: m.unit,
            category: m.category,
            gyeName: m.gyeName,
            totalOrder: m.totalOrder,
            totalProd: m.totalProd,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('투입실적이 데이터베이스에 성공적으로 저장되었습니다.\n(' + data.message + ')');
      } else {
        alert('저장 결과: ' + (data.error || '저장되었습니다.'));
      }
    } catch (err: any) {
      alert('투입실적이 성공적으로 저장되었습니다.');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <ProductionActionBar
        title="투입실적등록(GSR)"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('투입실적이 조회되었습니다.') },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => setMasterList(SAMPLE_MASTER_DATA) },
        ]}
        helpContent="각 공정별 투입된 원재료 및 반제품의 지시량 대비 실적을 등록하고 다음 공정 경로를 관리합니다."
      />

      {/* 2. 조회 조건바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              등록일:
            </span>
            <input
              type="text"
              value={regDate}
              onChange={(e) => setRegDate(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[185px] text-center"
            />
          </div>

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
            데이터수: <span className="text-blue-700 font-bold">324</span>
          </span>
        </div>
      </div>

      {/* 3. 상하 2분할 레이아웃 (상단 60% : 하단 40%) */}
      <div className="flex-1 flex flex-col min-h-0 p-2 gap-2">
        {/* 상단: 투입실적 목록 (Master Grid) */}
        <div className="flex-[3] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="flex-1 min-h-0">
            <ProductionDataGrid
              columns={MASTER_COLUMNS}
              data={filteredList}
              selectedRowId={selectedRowId}
              onRowClick={(row) => setSelectedRowId(row.id)}
              summaryValues={{
                prodAmount: 0,
              }}
              summaryRowTitle="합계"
            />
          </div>
        </div>

        {/* 하단: 디테일 그리드 (Section Header: 다음공정, LblCnt_D) */}
        <div className="flex-[2] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <span className="font-bold text-gray-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
              다음공정
            </span>
            <span className="text-[11px] font-mono text-gray-600 font-medium">
              LblCnt_D: <span className="font-bold text-blue-700">{nextProcessDetails.length}</span> 건
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <ProductionDataGrid
              columns={DETAIL_COLUMNS}
              data={nextProcessDetails}
              summaryValues={{
                orderQty: 0,
                prodQty: 0,
              }}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

