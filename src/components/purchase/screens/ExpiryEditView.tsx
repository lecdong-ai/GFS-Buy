'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { SalesFilterBar } from '@/components/sales/common/SalesFilterBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '../common/PurchaseDataGrid';

const INITIAL_EXPIRY_EDIT_DATA = [
  { id: 1, itemCode: 'MAT-EGG-01', type: '원재료', kind: '가공란', name: '[냉장]계란구이', spec: '1020g*12ea', unit: 'box', warehouse: '육류냉장고', stockQty: 18, expiryDate: '2026-11-03', editQty: 18, newExpiryDate: '2026-11-03' },
  { id: 2, itemCode: 'MAT-CRAB-01', type: '원재료', kind: '수산가공', name: '[냉장]다진맛살', spec: '10kg*2ea', unit: 'box', warehouse: '육류냉장고', stockQty: 24, expiryDate: '2026-11-05', editQty: 24, newExpiryDate: '2026-11-05' },
  { id: 3, itemCode: 'MAT-KIM-01', type: '원재료', kind: '절임채소', name: '[냉장]볶음김치', spec: '5kg*3ea', unit: 'box', warehouse: '채소류냉장', stockQty: 45, expiryDate: '2026-11-06', editQty: 45, newExpiryDate: '2026-11-06' },
  { id: 4, itemCode: 'MAT-VEG-02', type: '원재료', kind: '신선채소', name: '전처리 양상추 슬라이스', spec: '1kg*5팩', unit: 'box', warehouse: '채소류냉장', stockQty: 12, expiryDate: '2026-11-02', editQty: 12, newExpiryDate: '2026-11-02' },
  { id: 5, itemCode: 'MAT-HAM-01', type: '원재료', kind: '육가공', name: '슬라이스 스팸햄', spec: '1kg*10팩', unit: 'box', warehouse: '육류냉장고', stockQty: 15, expiryDate: '2026-11-04', editQty: 15, newExpiryDate: '2026-11-04' },
  { id: 6, itemCode: 'MAT-GIM-01', type: '원재료', kind: '건어류', name: '[상온]삼각김밥김', spec: '100매*32ea', unit: 'box', warehouse: '상온보관고', stockQty: 120, expiryDate: '2027-10-25', editQty: 120, newExpiryDate: '2027-10-25' },
  { id: 7, itemCode: 'MAT-BOX-01', type: '부재료', kind: '포장재', name: '두레)ET-30 도시락용기', spec: '50ea*2줄', unit: 'box', warehouse: '부재료보관', stockQty: 250, expiryDate: '2028-10-29', editQty: 250, newExpiryDate: '2028-10-29' },
  { id: 8, itemCode: 'MAT-CHUNG-01', type: '원재료', kind: '냉동나물', name: '[냉동]궁채나물', spec: '1kg*10ea', unit: 'box', warehouse: '냉동고', stockQty: 40, expiryDate: '2027-10-10', editQty: 40, newExpiryDate: '2027-10-10' },
];

const COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'itemCode', label: '품번', width: '100px', align: 'center' },
  { key: 'type', label: '구분', width: '65px', align: 'center' },
  { key: 'kind', label: '품종', width: '80px', align: 'center' },
  { key: 'name', label: '품명', width: '220px', align: 'left' },
  { key: 'spec', label: '규격', width: '100px', align: 'center' },
  { key: 'unit', label: '단위', width: '50px', align: 'center' },
  { key: 'warehouse', label: '창고', width: '100px', align: 'center' },
  { key: 'stockQty', label: '현재고', width: '80px', align: 'right', format: 'number' },
  { key: 'expiryDate', label: '유통기한', width: '100px', align: 'center', format: 'date' },
  { key: 'editQty', label: '수정수량(입력가능)', width: '120px', align: 'right', format: 'number', editable: true },
  { key: 'newExpiryDate', label: '유통기한수정', width: '120px', align: 'center', datePicker: true },
];

export const ExpiryEditView: React.FC = () => {
  const [baseDate, setBaseDate] = useState('2026-10-30');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [whFilter, setWhFilter] = useState('ALL');
  const [rows, setRows] = useState(INITIAL_EXPIRY_EDIT_DATA);

  useEffect(() => {
    fetch('/api/inventory/stock')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded = json.data.map((inv: any, idx: number) => ({
            id: inv.id || idx + 1,
            itemCode: inv.productCode || `MAT-${idx + 1}`,
            type: inv.category || '원재료',
            kind: inv.product?.kind || '원부자재',
            name: inv.productName || inv.product?.name || '자재',
            spec: inv.product?.spec || '',
            unit: inv.unit || inv.product?.unit || 'kg',
            warehouse: inv.warehouse || '상온보관고',
            stockQty: inv.currentQty || 10,
            expiryDate: inv.expiryDate || '2026-11-15',
            editQty: inv.currentQty || 10,
            newExpiryDate: inv.expiryDate || '2026-11-15',
          }));
          setRows(loaded);
        }
      })
      .catch((err) => console.error('Failed to load expiry edit data', err));
  }, []);

  const handleRowChange = (id: any, key: string, val: any) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/inventory/discard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch',
          rows: rows.map((r) => ({
            checkDate: baseDate,
            productCode: r.itemCode,
            productName: r.name,
            lotNo: 'LOT-EDIT',
            expiryDate: r.newExpiryDate,
            warehouse: r.warehouse,
            currentQty: r.editQty,
            unit: r.unit,
            action: '수정완료',
            status: '처리완료',
            remark: '유통기한/수량 수정',
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('원부자재 유통기한 및 수정 수량이 데이터베이스에 정상 업데이트되었습니다.');
      } else {
        alert('저장 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('저장 중 오류: ' + err.message);
    }
  };

  const filteredRows = rows.filter((item) => {
    if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
    if (whFilter !== 'ALL' && item.warehouse !== whFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none">
      <SalesActionBar
        title="유통기간수정"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          { key: 'save', label: '저장', icon: 'save', variant: 'secondary', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => setRows(INITIAL_EXPIRY_EDIT_DATA) },
        ]}
        helpContent="입고된 원부자재의 실제 유통기한 변경 또는 라트 분할에 따른 유통기한 일자를 수정 등록합니다."
      />

      <SalesFilterBar
        label="기준일자"
        isSingleDate={true}
        date={baseDate}
        onDateChange={setBaseDate}
        dataCount={filteredRows.length}
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
          data={filteredRows}
          onRowChange={handleRowChange}
        />
      </div>
    </div>
  );
};

