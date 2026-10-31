'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '@/components/purchase/common/PurchaseDataGrid';
import { Calendar } from 'lucide-react';
import { GYE_MASTER_LIST } from '@/components/production/data/productionMasterData';

interface MatExtraIssueRegRow {
  id: number;
  category: string; // 구분
  variety: string; // 품종
  itemName: string; // 품명
  spec: string; // 규격
  unit: string; // 단위
  expiryDate: string; // 유통기한
  currentStock: number; // 현재고
  currentWarehouse: string; // 현재창고
  targetGye: string; // 계명칭
  issueQty: number; // 이동수량
  issueReason: string; // 불출사유
}

const SAMPLE_EXTRA_ISSUE_DATA: MatExtraIssueRegRow[] = [
  { id: 1, category: '원재료', variety: '곡류', itemName: '국내산 경기미 20kg', spec: '20kg/포', unit: '포', expiryDate: '2027-10-25', currentStock: 250, currentWarehouse: '상온', targetGye: '취반(미반류)', issueQty: 20, issueReason: '생산 긴급 추가분' },
  { id: 2, category: '원재료', variety: '김류', itemName: '[상온]삼각김밥김', spec: '100매*32ea', unit: 'box', expiryDate: '2027-10-20', currentStock: 35, currentWarehouse: '상온', targetGye: '성형장(삼각김밥)', issueQty: 5, issueReason: '공정 로스 보충' },
  { id: 3, category: '원재료', variety: '수산가공', itemName: '[냉장]다진맛살', spec: '10kg*2ea', unit: 'box', expiryDate: '2026-11-15', currentStock: 20, currentWarehouse: '냉장1', targetGye: '조리실(볶음)', issueQty: 2, issueReason: '추가주문 대응' },
  { id: 4, category: '원재료', variety: '절임류', itemName: '[냉장]볶음김치', spec: '5kg*3ea', unit: 'box', expiryDate: '2026-11-25', currentStock: 45, currentWarehouse: '냉장2', targetGye: '성형장(김밥)', issueQty: 6, issueReason: '토핑 부족분' },
  { id: 5, category: '원재료', variety: '난가공', itemName: '[냉장]계란구이', spec: '1020g*12ea', unit: 'box', expiryDate: '2026-11-20', currentStock: 18, currentWarehouse: '냉장1', targetGye: '성형장(도시락)', issueQty: 3, issueReason: '불량 교체분' },
  { id: 6, category: '부재료', variety: '용기', itemName: '두레)ET-30 용기', spec: '50ea*2줄', unit: 'box', expiryDate: '2028-10-29', currentStock: 50, currentWarehouse: '부자재', targetGye: '성형장(도시락)', issueQty: 10, issueReason: '포장라인 보충' },
];

const COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'category', label: '구분', width: '65px', align: 'center', sticky: true, leftOffset: '36px' },
  { key: 'variety', label: '품종', width: '80px', align: 'center', sticky: true, leftOffset: '101px' },
  { key: 'itemName', minWidth: '260px', label: '품명', align: 'left', sticky: true, leftOffset: '181px' },
  { key: 'spec', label: '규격', width: '110px', align: 'center' },
  { key: 'unit', label: '단위', width: '45px', align: 'center' },
  { key: 'expiryDate', label: '유통기한', width: '90px', align: 'center', format: 'date' },
  { key: 'currentStock', label: '현재고', width: '80px', align: 'right', format: 'number' },
  { key: 'currentWarehouse', label: '현재창고', width: '105px', align: 'center' },
  { key: 'targetGye', label: '계명칭', width: '130px', align: 'left', editable: true },
  { key: 'issueQty', label: '이동수량', width: '85px', align: 'right', format: 'number', editable: true },
  { key: 'issueReason', label: '불출사유', width: '140px', align: 'left', editable: true },
];

export const MatExtraIssueRegView: React.FC = () => {
  const [issueDate, setIssueDate] = useState('2026-10-30');
  const [selectedWh, setSelectedWh] = useState('ALL');
  const [rows, setRows] = useState(SAMPLE_EXTRA_ISSUE_DATA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/inventory/extra-issue?issueDate=${issueDate}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const mapped: MatExtraIssueRegRow[] = json.data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            category: item.category || '원재료',
            variety: '일반',
            itemName: item.productName || item.productCode,
            spec: '표준규격',
            unit: item.unit || 'kg',
            expiryDate: item.issueDate || '2026-10-30',
            currentStock: 100,
            currentWarehouse: '상온',
            targetGye: item.gyeName || '성형장(김밥)',
            issueQty: Number(item.issueQty) || 0,
            issueReason: item.reason || '',
          }));
          setRows(mapped);
        }
      })
      .catch((err) => console.error('Fetch extra issue failed:', err));
  }, [issueDate]);

  const filteredRows = rows.filter((r) => {
    if (selectedWh !== 'ALL' && r.currentWarehouse !== selectedWh) return false;
    return true;
  });

  const handleCellChange = (id: any, key: string, val: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: key === 'issueQty' ? Number(val) || 0 : val } : r))
    );
  };

  const handleSave = async () => {
    const toSave = rows.filter((r) => r.issueQty > 0);
    if (toSave.length === 0) {
      alert('불출수량이 0보다 큰 항목이 없습니다.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/extra-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch',
          rows: toSave.map((r) => ({
            issueDate,
            gyeName: r.targetGye,
            productName: r.itemName,
            category: r.category,
            issueQty: r.issueQty,
            unit: r.unit,
            reason: r.issueReason,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('자재 추가불출 저장이 완료되었습니다.');
      } else {
        alert('저장 중 오류: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (e: any) {
      alert('저장 실패: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <SalesActionBar
        title="자재추가불출등록(GSR)"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          { key: 'save', label: '저장', icon: 'save', variant: 'secondary', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => setRows(SAMPLE_EXTRA_ISSUE_DATA) },
        ]}
        helpContent="정규 작업지시 소요량 외에 불량 교체, 긴급 증량 등으로 인해 생산 공정에 추가 불출되는 자재를 등록합니다."
      />

      {/* 2. 조건 검색 바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              불출일자:
            </span>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[130px]"
            />
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">창고:</span>
            <select
              value={selectedWh}
              onChange={(e) => setSelectedWh(e.target.value)}
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

