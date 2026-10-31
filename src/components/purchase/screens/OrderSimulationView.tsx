'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '../common/PurchaseDataGrid';
import { Sparkles, Calculator } from 'lucide-react';

interface FinishedProduct {
  id: number;
  code: string;
  name: string;
  prevQty: number;
  simulQty: number;
}

interface RawMaterialRequirement {
  id: number;
  partName: string;
  partSpec: string;
  unit: string;
  prevUsedQty: number;
  calcQty: number;
  calcBoxQty: number;
  unitQty: number;
  orderQty: number;
  unitPrice: number;
  orderAmt: number;
  remainDays: number;
  orderStatus: string;
  supplier: string;
  orderUnit: string;
  leadTime: string;
  unitId: string;
}

const INITIAL_FINISHED_PRODUCTS: FinishedProduct[] = [
  { id: 1, code: '27000388865', name: '넷플)더담은K떡볶이김밥', prevQty: 1200, simulQty: 1500 },
  { id: 2, code: '27000388781', name: '더블치즈소시지김밥', prevQty: 1100, simulQty: 1200 },
  { id: 3, code: '27000388732', name: '혜자)돌아온도시락', prevQty: 950, simulQty: 1000 },
  { id: 4, code: '27000388859', name: '혜자)통등심돈까스', prevQty: 950, simulQty: 950 },
  { id: 5, code: '27000388710', name: '착한1900핫도그(양배추)', prevQty: 1500, simulQty: 1800 },
  { id: 6, code: '27000388785', name: '더큰)스팸김치볶음밥주먹밥', prevQty: 2500, simulQty: 2800 },
];

const INITIAL_REQUIREMENTS: RawMaterialRequirement[] = [
  { id: 1, partName: '국내산 경기미 20kg', partSpec: '20kg/포', unit: '포', prevUsedQty: 320, calcQty: 380, calcBoxQty: 380, unitQty: 1, orderQty: 380, unitPrice: 52000, orderAmt: 19760000, remainDays: 2.5, orderStatus: '발주필요', supplier: '평화영농조합', orderUnit: 'BAG', leadTime: '1일', unitId: 'U-01' },
  { id: 2, partName: '[상온]삼각김밥김', partSpec: '100매*32ea', unit: 'box', prevUsedQty: 25, calcQty: 30, calcBoxQty: 30, unitQty: 32, orderQty: 30, unitPrice: 52000, orderAmt: 1560000, remainDays: 3.1, orderStatus: '발주필요', supplier: '[네트웍스]대림', orderUnit: 'BOX', leadTime: '2일', unitId: 'U-02' },
  { id: 3, partName: '[냉장]다진맛살', partSpec: '10kg*2ea', unit: 'box', prevUsedQty: 18, calcQty: 22, calcBoxQty: 22, unitQty: 2, orderQty: 22, unitPrice: 52000, orderAmt: 1144000, remainDays: 1.8, orderStatus: '발주필요', supplier: '[네트웍스]한성', orderUnit: 'BOX', leadTime: '1일', unitId: 'U-03' },
  { id: 4, partName: '[냉장]볶음김치', partSpec: '5kg*3ea', unit: 'box', prevUsedQty: 40, calcQty: 48, calcBoxQty: 48, unitQty: 3, orderQty: 48, unitPrice: 42000, orderAmt: 2016000, remainDays: 2.0, orderStatus: '발주필요', supplier: '[네트웍스]한성', orderUnit: 'BOX', leadTime: '1일', unitId: 'U-04' },
  { id: 5, partName: '[냉장]계란구이', partSpec: '1020g*12ea', unit: 'box', prevUsedQty: 15, calcQty: 18, calcBoxQty: 18, unitQty: 12, orderQty: 18, unitPrice: 78000, orderAmt: 1404000, remainDays: 1.5, orderStatus: '긴급발주', supplier: '[네트웍스]CJ', orderUnit: 'BOX', leadTime: '1일', unitId: 'U-05' },
  { id: 6, partName: '두레)ET-30', partSpec: '50ea*2줄', unit: 'box', prevUsedQty: 12, calcQty: 14, calcBoxQty: 14, unitQty: 2, orderQty: 14, unitPrice: 38000, orderAmt: 532000, remainDays: 4.2, orderStatus: '정상', supplier: '[네트웍스]두레', orderUnit: 'BOX', leadTime: '2일', unitId: 'U-06' },
  { id: 7, partName: '정우)PP]5찬도시락용기', partSpec: '80ea*4pk/box', unit: 'box', prevUsedQty: 10, calcQty: 12, calcBoxQty: 12, unitQty: 4, orderQty: 12, unitPrice: 72000, orderAmt: 864000, remainDays: 3.8, orderStatus: '정상', supplier: '[네트웍스]정우', orderUnit: 'BOX', leadTime: '2일', unitId: 'U-07' },
  { id: 8, partName: '골드마요네즈 3.2kg', partSpec: '3.2kg*4통', unit: 'box', prevUsedQty: 14, calcQty: 16, calcBoxQty: 16, unitQty: 4, orderQty: 16, unitPrice: 38000, orderAmt: 608000, remainDays: 3.0, orderStatus: '발주필요', supplier: '오뚜기', orderUnit: 'BOX', leadTime: '1일', unitId: 'U-08' },
];

const FINISHED_COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'code', label: '품번', width: '90px', align: 'center' },
  { key: 'name', label: '품명', width: '160px', align: 'left' },
  { key: 'prevQty', label: '전일수량', width: '65px', align: 'right', format: 'number' },
  { key: 'simulQty', label: '시뮬레이션수량', width: '95px', align: 'right', format: 'number', editable: true },
];

const REQ_COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'partName', minWidth: '260px', label: '파트명', align: 'left' },
  { key: 'partSpec', label: '파트규격', width: '85px', align: 'center' },
  { key: 'unit', label: '단위', width: '40px', align: 'center' },
  { key: 'prevUsedQty', label: '전일사용량', width: '70px', align: 'right', format: 'number' },
  { key: 'calcQty', label: '발주계산수량', width: '80px', align: 'right', format: 'number' },
  { key: 'calcBoxQty', label: '발주계산수량(box)', width: '100px', align: 'right', format: 'number' },
  { key: 'unitQty', label: 'Unit 수량', width: '65px', align: 'right', format: 'number' },
  { key: 'orderQty', label: '발주수량', width: '70px', align: 'right', format: 'number', editable: true },
  { key: 'unitPrice', label: '발주단가', width: '75px', align: 'right', format: 'currency' },
  { key: 'orderAmt', label: '발주금액(합계)', width: '100px', align: 'right', format: 'currency', highlight: true },
  { key: 'remainDays', label: '유지가능일수', width: '75px', align: 'right' },
  { key: 'orderStatus', label: '발주여부', width: '65px', align: 'center' },
  { key: 'supplier', label: '거래처', width: '100px', align: 'left' },
  { key: 'orderUnit', label: '발주단위', width: '60px', align: 'center' },
  { key: 'leadTime', label: '조달기간', width: '55px', align: 'center' },
  { key: 'unitId', label: '단위id', width: '55px', align: 'center' },
];

export const OrderSimulationView: React.FC = () => {
  const [finishedProds, setFinishedProds] = useState(INITIAL_FINISHED_PRODUCTS);
  const [requirements, setRequirements] = useState(INITIAL_REQUIREMENTS);

  useEffect(() => {
    fetch('/api/master/bom')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loadedFinished: FinishedProduct[] = json.data.map((b: any, idx: number) => ({
            id: b.id || idx + 1,
            code: b.parentProduct?.productCode || `27000${idx}`,
            name: b.parentProduct?.name || '제품',
            prevQty: 1000,
            simulQty: 1200,
          }));
          setFinishedProds(loadedFinished);
        }
      })
      .catch((err) => console.error('Failed to load finished products for simulation', err));
  }, []);

  const handleFinishedChange = (id: any, key: string, val: any) => {
    setFinishedProds((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: Number(val) || 0 } : p))
    );
  };

  const handleReqChange = (id: any, key: string, val: any) => {
    setRequirements((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, [key]: val };
          if (key === 'orderQty') {
            const qty = Number(val) || 0;
            updated.orderAmt = qty * updated.unitPrice;
          }
          return updated;
        }
        return r;
      })
    );
  };

  // ★ 핵심 인터랙션: BOM 비율 시뮬레이션 계산
  const runSimulation = () => {
    // Calculate total ratio: sum of simulQty / sum of prevQty
    const prevTotal = finishedProds.reduce((a, c) => a + c.prevQty, 0);
    const simulTotal = finishedProds.reduce((a, c) => a + c.simulQty, 0);
    const ratio = prevTotal > 0 ? simulTotal / prevTotal : 1.15;

    setRequirements((prev) =>
      prev.map((req) => {
        const newCalcQty = Math.round(req.prevUsedQty * ratio);
        const newBoxQty = newCalcQty;
        const newOrderQty = newCalcQty;
        const newOrderAmt = newOrderQty * req.unitPrice;
        return {
          ...req,
          calcQty: newCalcQty,
          calcBoxQty: newBoxQty,
          orderQty: newOrderQty,
          orderAmt: newOrderAmt,
          remainDays: Number((req.remainDays * (1 / ratio)).toFixed(1)),
        };
      })
    );

    alert(`[시뮬레이션 완료] 완성품 계획 ${simulTotal.toLocaleString()}ea 기준 원부자재 소요량이 자동 재계산되었습니다.`);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none">
      {/* 1) 상단 액션 바 */}
      <SalesActionBar
        title="발주시뮬레이션"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          { key: 'save', label: '저장', icon: 'save', variant: 'secondary', onClick: () => alert('시뮬레이션 결과 저장 완료') },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => { setFinishedProds(INITIAL_FINISHED_PRODUCTS); setRequirements(INITIAL_REQUIREMENTS); } },
          { key: 'simulate', label: '시뮬레이션', icon: 'reset', variant: 'success', onClick: runSimulation },
        ]}
        helpContent="완성품의 예상 생산수량(시뮬레이션수량)을 입력하면, BOM 기준 원부자재 소요량과 발주금액이 우측에 실시간으로 시뮬레이션됩니다."
      />

      {/* 2) 좌우 2분할 레이아웃 (필터 바 없음, 좌 28%, 우 72%) */}
      <div className="flex-1 flex p-1.5 gap-1.5 min-h-0 overflow-hidden">
        {/* 좌측 [완성품] 패널 (28% 너비) */}
        <div className="w-[28%] flex flex-col min-h-0 bg-white border border-gray-400">
          <div className="px-2 py-1 bg-[#e2e8f0] border-b border-gray-300 font-bold text-gray-800 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-blue-600 inline-block" />
              완성품 (생산예정수량 입력)
            </span>
            <span className="text-gray-500 font-normal text-[10px]">수량 직접수정 가능</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <PurchaseDataGrid
              columns={FINISHED_COLUMNS}
              data={finishedProds}
              onRowChange={handleFinishedChange}
            />
          </div>
        </div>

        {/* 우측 [원부자재소요량] 패널 (72% 너비) */}
        <div className="w-[72%] flex flex-col min-h-0 bg-white border border-gray-400">
          <div className="px-2 py-1 bg-[#e2e8f0] border-b border-gray-300 font-bold text-gray-800 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-blue-900">
              <span className="w-2 h-2 bg-emerald-600 inline-block" />
              원부자재소요량 (BOM 자동 소요량 산출 및 발주금액)
            </span>
            <button
              type="button"
              onClick={runSimulation}
              className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-2xs"
            >
              <Calculator className="w-3 h-3" />
              <span>재계산 실행</span>
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <PurchaseDataGrid
              columns={REQ_COLUMNS}
              data={requirements}
              onRowChange={handleReqChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

