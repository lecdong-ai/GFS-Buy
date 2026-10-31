'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { SalesFilterBar } from '@/components/sales/common/SalesFilterBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '../common/PurchaseDataGrid';
import { exportGridToExcel } from '@/lib/excelExport';

const INITIAL_EXPIRY_DATA = [
  { id: 1, itemCode: 'MAT-EGG-01', kind: '가공란', name: '[냉장]계란구이', spec: '1020g*12ea', unit: 'box', warehouse: '육류냉장고', stockQty: 18, expiryDate: '2026-11-03', remainDays: 4, type: '원재료' },
  { id: 2, itemCode: 'MAT-CRAB-01', kind: '수산가공', name: '[냉장]다진맛살', spec: '10kg*2ea', unit: 'box', warehouse: '육류냉장고', stockQty: 24, expiryDate: '2026-11-05', remainDays: 6, type: '원재료' },
  { id: 3, itemCode: 'MAT-KIM-01', kind: '절임채소', name: '[냉장]볶음김치', spec: '5kg*3ea', unit: 'box', warehouse: '채소류냉장', stockQty: 45, expiryDate: '2026-11-06', remainDays: 7, type: '원재료' },
  { id: 4, itemCode: 'MAT-VEG-02', kind: '신선채소', name: '전처리 양상추 슬라이스', spec: '1kg*5팩', unit: 'box', warehouse: '채소류냉장', stockQty: 12, expiryDate: '2026-11-02', remainDays: 3, type: '원재료' },
  { id: 5, itemCode: 'MAT-HAM-01', kind: '육가공', name: '슬라이스 스팸햄', spec: '1kg*10팩', unit: 'box', warehouse: '육류냉장고', stockQty: 15, expiryDate: '2026-11-04', remainDays: 5, type: '원재료' },
  { id: 6, itemCode: 'MAT-BREAD-01', kind: '베이커리', name: '핫도그용 롱번 빵', spec: '30ea/box', unit: 'box', warehouse: '상온보관고', stockQty: 30, expiryDate: '2026-11-06', remainDays: 7, type: '원재료' },
  { id: 7, itemCode: 'MAT-GIM-01', kind: '건어류', name: '[상온]삼각김밥김', spec: '100매*32ea', unit: 'box', warehouse: '상온보관고', stockQty: 120, expiryDate: '2027-10-25', remainDays: 360, type: '원재료' },
  { id: 8, itemCode: 'MAT-BOX-01', kind: '포장재', name: '두레)ET-30 도시락용기', spec: '50ea*2줄', unit: 'box', warehouse: '부재료보관', stockQty: 250, expiryDate: '2028-10-29', remainDays: 729, type: '부재료' },
  { id: 9, itemCode: 'MAT-CHUNG-01', kind: '냉동나물', name: '[냉동]궁채나물', spec: '1kg*10ea', unit: 'box', warehouse: '냉동고', stockQty: 40, expiryDate: '2027-10-10', remainDays: 345, type: '원재료' },
];

const COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'itemCode', label: '품번', width: '100px', align: 'center' },
  { key: 'kind', label: '품종', width: '80px', align: 'center' },
  { key: 'name', label: '품명', width: '220px', align: 'left' },
  { key: 'spec', label: '규격', width: '110px', align: 'center' },
  { key: 'unit', label: '단위', width: '50px', align: 'center' },
  { key: 'warehouse', label: '창고', width: '100px', align: 'center' },
  { key: 'stockQty', label: '현재고', width: '80px', align: 'right', format: 'number' },
  { key: 'expiryDate', label: '유통기한', width: '100px', align: 'center', format: 'date' },
  {
    key: 'remainDays',
    label: '잔여일수',
    width: '90px',
    align: 'right',
    format: 'number',
    badgeCondition: (val: any) => {
      const days = Number(val);
      if (days <= 3) return 'bg-red-100 text-red-700 border border-red-300 font-bold';
      if (days <= 7) return 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
      return 'bg-emerald-50 text-emerald-700';
    },
  },
];

export const ExpiryStatusView: React.FC = () => {
  const [baseDate, setBaseDate] = useState('2026-10-30');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [whFilter, setWhFilter] = useState('ALL');
  const [data, setData] = useState(INITIAL_EXPIRY_DATA);

  useEffect(() => {
    fetch('/api/inventory/stock')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded = json.data.map((inv: any, idx: number) => {
            const exp = inv.expiryDate || '2026-11-15';
            const diffDays = Math.ceil((new Date(exp).getTime() - new Date('2026-10-30').getTime()) / (1000 * 3600 * 24));
            return {
              id: inv.id || idx + 1,
              itemCode: inv.productCode || `MAT-${idx + 1}`,
              kind: inv.product?.kind || '원부자재',
              name: inv.productName || inv.product?.name || '자재',
              spec: inv.product?.spec || '',
              unit: inv.unit || inv.product?.unit || 'kg',
              warehouse: inv.warehouse || '상온보관고',
              stockQty: inv.currentQty || 10,
              expiryDate: exp,
              remainDays: diffDays > 0 ? diffDays : 0,
              type: inv.category || '원재료',
            };
          });
          setData(loaded);
        }
      })
      .catch((err) => console.error('Failed to load expiry status from stock', err));
  }, []);

  const filteredData = data.filter((item) => {
    if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
    if (whFilter !== 'ALL' && item.warehouse !== whFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none">
      <SalesActionBar
        title="유통기간현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => alert('초기화 완료') },
          {
            key: 'excel',
            label: '엑셀다운로드',
            icon: 'excel',
            variant: 'secondary',
            onClick: () =>
              exportGridToExcel({
                filename: `유통기한현황_${baseDate}`,
                sheetName: '유통기한',
                columns: COLUMNS,
                data: filteredData,
              }),
          },
        ]}
        helpContent="창고별 보관 원부재료의 유통기한과 잔여일수를 실시간 모니터링하여 임박(7일 이하) 자재의 선입선출 및 폐기를 관리합니다."
      />

      <SalesFilterBar
        label="기준일자"
        isSingleDate={true}
        date={baseDate}
        onDateChange={setBaseDate}
        dataCount={filteredData.length}
        onRefresh={() => alert('새로고침')}
      >
        <div className="flex items-center gap-1.5 pl-2 border-l border-gray-300">
          <span className="font-semibold text-gray-700 text-[11px]">구분:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 px-1 py-0.5 bg-white text-gray-800 text-[11px] h-5"
          >
            <option value="ALL">ALL (전체)</option>
            <option value="원재료">원재료</option>
            <option value="부재료">부재료</option>
            <option value="완성품">완성품</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 pl-2 border-l border-gray-300">
          <span className="font-semibold text-gray-700 text-[11px]">창고:</span>
          <select
            value={whFilter}
            onChange={(e) => setWhFilter(e.target.value)}
            className="border border-gray-300 px-1 py-0.5 bg-white text-gray-800 text-[11px] h-5"
          >
            <option value="ALL">ALL (전체 창고)</option>
            <option value="상온보관고">상온보관고</option>
            <option value="육류냉장고">육류냉장고</option>
            <option value="채소류냉장">채소류냉장</option>
            <option value="냉동고">냉동고</option>
            <option value="부재료보관">부재료보관</option>
          </select>
        </div>
      </SalesFilterBar>

      <div className="flex-1 p-1.5 min-h-0 overflow-hidden flex flex-col">
        <PurchaseDataGrid
          columns={COLUMNS}
          data={filteredData}
        />
      </div>
    </div>
  );
};

