'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '@/components/purchase/common/PurchaseDataGrid';

interface ExpiryDiscardRow {
  id: number;
  itemCode: string; // 품번
  category: string; // 구분
  itemName: string; // 품명
  spec: string; // 규격
  unit: string; // 단위
  warehouse: string; // 창고
  currentStock: number; // 현재고
  expiryDate: string; // 유통기한
  discardQty: number; // 폐기수량
  discardReason: string; // 폐기사유
}

const SAMPLE_DISCARD_DATA: ExpiryDiscardRow[] = [
  { id: 1, itemCode: '20194620', category: '원재료', itemName: '[냉장]계란구이', spec: '1020g*12ea', unit: 'box', warehouse: '냉장1', currentStock: 18, expiryDate: '2026-10-31', discardQty: 2, discardReason: '유통기한 임박' },
  { id: 2, itemCode: '20194915', category: '원재료', itemName: '[냉장]다진맛살', spec: '10kg*2ea', unit: 'box', warehouse: '냉장1', currentStock: 24, expiryDate: '2026-10-31', discardQty: 1, discardReason: '포장 파손' },
  { id: 3, itemCode: '20194920', category: '원재료', itemName: '[냉장]볶음김치', spec: '5kg*3ea', unit: 'box', warehouse: '냉장2', currentStock: 45, expiryDate: '2026-11-01', discardQty: 0, discardReason: '' },
  { id: 4, itemCode: '20194456', category: '원재료', itemName: '[상온]삼각김밥김', spec: '100매*32ea', unit: 'box', warehouse: '상온', currentStock: 35, expiryDate: '2027-10-20', discardQty: 0, discardReason: '' },
  { id: 5, itemCode: '20194510', category: '부재료', itemName: '두레)ET-30 용기', spec: '50ea*2줄', unit: 'box', warehouse: '부자재', currentStock: 50, expiryDate: '2028-10-29', discardQty: 0, discardReason: '' },
];

const COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'itemCode', label: '품번', width: '85px', align: 'center', sticky: true, leftOffset: '36px' },
  { key: 'category', label: '구분', width: '65px', align: 'center' },
  { key: 'itemName', minWidth: '260px', label: '품명', align: 'left', sticky: true, leftOffset: '121px' },
  { key: 'spec', label: '규격', width: '110px', align: 'center' },
  { key: 'unit', label: '단위', width: '50px', align: 'center' },
  { key: 'warehouse', label: '창고', width: '100px', align: 'center' },
  { key: 'currentStock', label: '현재고', width: '80px', align: 'right', format: 'number' },
  { key: 'expiryDate', label: '유통기한', width: '90px', align: 'center', format: 'date' },
  { key: 'discardQty', label: '폐기수량', width: '85px', align: 'right', format: 'number', editable: true },
  { key: 'discardReason', label: '폐기사유', width: '140px', align: 'left', editable: true },
];

export const ExpiryDiscardMgmtView: React.FC = () => {
  const [whFilter, setWhFilter] = useState('ALL');
  const [rows, setRows] = useState(SAMPLE_DISCARD_DATA);

  useEffect(() => {
    fetch('/api/inventory/discard')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: ExpiryDiscardRow[] = json.data.map((d: any, idx: number) => ({
            id: d.id || idx + 1,
            itemCode: d.productCode,
            category: '원재료',
            itemName: d.productName,
            spec: '',
            unit: d.unit || 'box',
            warehouse: d.warehouse || '상온',
            currentStock: d.currentQty,
            expiryDate: d.expiryDate,
            discardQty: 0,
            discardReason: d.action || '유통기한 임박',
          }));
          setRows(loaded);
        }
      })
      .catch((err) => console.error('Failed to load discard mgmt list', err));
  }, []);

  const filteredRows = rows.filter((r) => {
    if (whFilter !== 'ALL' && r.warehouse !== whFilter) return false;
    return true;
  });

  const handleCellChange = (id: any, key: string, val: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: key === 'discardQty' ? Number(val) || 0 : val } : r))
    );
  };

  const handleSave = async () => {
    try {
      const discards = rows.filter((r) => r.discardQty > 0);
      const res = await fetch('/api/inventory/discard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch',
          rows: discards.map((d) => ({
            productCode: d.itemCode,
            productName: d.itemName,
            warehouse: d.warehouse,
            currentQty: d.discardQty,
            unit: d.unit,
            action: d.discardReason || '폐기',
            status: '처리완료',
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('유통기한 만료 및 폐기 처리가 데이터베이스에 확정되었습니다.');
      } else {
        alert('저장 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('저장 중 오류: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <SalesActionBar
        title="유통기한/폐기관리"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          { key: 'save', label: '폐기확정', icon: 'save', variant: 'secondary', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => setRows(SAMPLE_DISCARD_DATA) },
        ]}
        helpContent="유통기한 만료 임박 자재 및 파손/변질 원부자재를 조회하여 폐기 승인을 처리합니다."
      />

      {/* 2. 조건 검색 바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">창고:</span>
            <select
              value={whFilter}
              onChange={(e) => setWhFilter(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] rounded-xs shadow-2xs"
            >
              <option value="ALL">전체 창고 (ALL)</option>
              <option value="냉장1">냉장1</option>
              <option value="냉장2">냉장2</option>
              <option value="냉동">냉동</option>
              <option value="상온">상온</option>
              <option value="부자재">부자재</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-gray-600 font-semibold bg-white px-2 py-0.5 rounded border border-gray-300 shadow-2xs">
          데이터수: <span className="font-bold text-blue-700">{filteredRows.length}</span> 건
        </div>
      </div>

      {/* 3. 데이터 그리드 */}
      <div className="flex-1 p-2 min-h-0 overflow-hidden flex flex-col">
        <PurchaseDataGrid
          columns={COLUMNS}
          data={filteredRows}
          onCellChange={handleCellChange}
          summaryRowTitle="합계"
        />
      </div>
    </div>
  );
};

