'use client';

import React, { useState, useEffect } from 'react';
import { InventoryActionBar } from '../common/InventoryActionBar';
import { InventoryDataGrid, InventoryGridColumnDef } from '../common/InventoryDataGrid';
import { Calendar } from 'lucide-react';

interface UnusedAssignItem {
  id: number;
  assignDate: string;
  itemCode: string;
  category: string;
  partName: string;
  partSpec: string;
  unit: string;
  currentStock: number;
  unusedQty: number; // 지정수량 (editable)
  assignReason: string; // 지정사유 (editable)
  warehouse: string;
}

const INITIAL_UNUSED_ASSIGN: UnusedAssignItem[] = [
  { id: 1, assignDate: '2026-10-30', itemCode: 'SM-OLD-01', category: '부재료', partName: '구형 샌드위치 필름(2025버전)', partSpec: '500m/롤', unit: '롤', currentStock: 25, unusedQty: 25, assignReason: '패키지 리뉴얼로 구버전 불용', warehouse: '부자재' },
  { id: 2, assignDate: '2026-10-30', itemCode: 'RM-OLD-02', category: '원재료', partName: '계절한정 밤고구마 무스', partSpec: '1kg*10팩', unit: 'box', currentStock: 12, unusedQty: 12, assignReason: '시즌 종료 단종', warehouse: '냉장1' },
  { id: 3, assignDate: '2026-10-30', itemCode: 'SM-OLD-03', category: '부재료', partName: '기획용 띠지 라벨(단종)', partSpec: '1000장/롤', unit: '롤', currentStock: 8, unusedQty: 8, assignReason: '행사 종료', warehouse: '부자재' },
];

export const UnusedAssignRegView: React.FC = () => {
  const [assignDate, setAssignDate] = useState('2026-10-30');
  const [items, setItems] = useState<UnusedAssignItem[]>(INITIAL_UNUSED_ASSIGN);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/inventory/unused-material')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const mapped: UnusedAssignItem[] = json.data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            assignDate: item.assignDate || '2026-10-30',
            itemCode: item.productCode || `SM-OLD-${idx + 1}`,
            category: item.category || '부재료',
            partName: item.productName || item.productCode || '불용품목',
            partSpec: '표준규격',
            unit: item.unit || 'ea',
            currentStock: Number(item.assignQty) || 0,
            unusedQty: Number(item.assignQty) || 0,
            assignReason: item.remark || '불용 지정',
            warehouse: item.warehouse || '부자재',
          }));
          setItems(mapped);
        }
      })
      .catch((err) => console.error('Fetch unused-material failed:', err));
  }, []);

  const handleCellChange = (id: number, colKey: string, val: any) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [colKey]: val } : it))
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/unused-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch',
          rows: items.map((r) => ({
            assignDate,
            productCode: r.itemCode,
            productName: r.partName,
            category: r.category,
            warehouse: r.warehouse,
            assignQty: r.unusedQty,
            unit: r.unit,
            remark: r.assignReason,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('불용자재 지정 내용이 성공적으로 저장되었습니다.');
      } else {
        alert('저장 중 오류: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (e: any) {
      alert('저장 실패: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setItems(INITIAL_UNUSED_ASSIGN);
    alert('초기화되었습니다.');
  };

  const COLUMNS: InventoryGridColumnDef[] = [
    { key: 'assignDate', label: '지정일자', width: '100px', align: 'center', format: 'date' },
    { key: 'itemCode', label: '품목코드', width: '100px', align: 'center' },
    { key: 'category', label: '구분', width: '70px', align: 'center' },
    { key: 'partName', minWidth: '260px', label: '파트명', align: 'left' },
    { key: 'partSpec', label: '파트규격', width: '110px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    { key: 'currentStock', label: '현재고', width: '80px', align: 'right', format: 'number' },
    { key: 'unusedQty', label: '지정수량', width: '85px', align: 'right', format: 'number', editable: true },
    { key: 'assignReason', label: '지정사유', width: '200px', align: 'left', editable: true },
    { key: 'warehouse', label: '보관창고', width: '100px', align: 'center' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      <InventoryActionBar
        title="불용자재지정등록"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('조회 완료') },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: handleReset },
        ]}
        helpContent="장기 재고, 디자인 변경, 단종 등으로 더 이상 정상 생산에 투입하기 어려운 자재를 불용 처리로 지정합니다."
      />

      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-700 flex items-center gap-1">
            <Calendar size={13} className="text-blue-700" />
            기준일자:
          </span>
          <input
            type="text"
            value={assignDate}
            onChange={(e) => setAssignDate(e.target.value)}
            className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[185px] text-center"
          />
        </div>
        <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
          지정건수: <span className="text-blue-700 font-bold">{items.length}</span> 건
        </span>
      </div>

      <div className="flex-1 min-h-0 p-2">
        <div className="h-full flex flex-col bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="flex-1 min-h-0">
            <InventoryDataGrid
              columns={COLUMNS}
              data={items}
              onCellChange={handleCellChange}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

