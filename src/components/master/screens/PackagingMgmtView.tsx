'use client';

import React, { useState, useEffect } from 'react';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import { Plus, RotateCw } from 'lucide-react';
import { exportGridToExcel } from '@/lib/excelExport';

interface PackageItemRow {
  id: number;
  packCode: string;
  packName: string;
  packType: string;
  remark: string;
}

interface ComponentItemRow {
  id: number;
  itemCode: string;
  category: string;
  variety: string;
  itemName: string;
  spec: string;
  unit: string;
  packType: string;
  qty: number;
  remark: string;
}

const SAMPLE_PACKAGES: PackageItemRow[] = [
  { id: 1, packCode: 'PKG-2026-01', packName: 'GS삼각김밥 30입 번들박스', packType: '골판지박스', remark: '표준 물류 박스' },
  { id: 2, packCode: 'PKG-2026-02', packName: 'GS줄김밥 24입 번들박스', packType: '골판지박스', remark: '냉장 유통' },
  { id: 3, packCode: 'PKG-2026-03', packName: '11찬도시락 16입 상자', packType: '보냉박스', remark: '콜드체인 지정' },
  { id: 4, packCode: 'PKG-2026-04', packName: '샌드위치 20입 포장', packType: '골판지박스', remark: '' },
];

const SAMPLE_COMPONENTS: Record<number, ComponentItemRow[]> = {
  1: [
    { id: 101, itemCode: '10002015', category: '완성품', variety: '주먹밥', itemName: '참치마요삼각김밥', spec: '110g*1개', unit: 'ea', packType: '낱개', qty: 15, remark: '기본 구성' },
    { id: 102, itemCode: '10002018', category: '완성품', variety: '주먹밥', itemName: '전주비빔삼각김밥', spec: '115g*1개', unit: 'ea', packType: '낱개', qty: 15, remark: '기본 구성' },
    { id: 103, itemCode: '30000050', category: '부재료', variety: '포장재', itemName: 'GS물류 삼각박스 외포장', spec: '30구들이', unit: 'ea', packType: '외포장', qty: 1, remark: '' },
  ],
  2: [
    { id: 201, itemCode: '10001021', category: '완성품', variety: '김밥', itemName: '참치마요김밥(밥김)', spec: '230g*1줄', unit: 'ea', packType: '낱개', qty: 12, remark: '' },
    { id: 202, itemCode: '10001022', category: '완성품', variety: '김밥', itemName: '매콤제육김밥', spec: '240g*1줄', unit: 'ea', packType: '낱개', qty: 12, remark: '' },
  ],
};

export const PackagingMgmtView: React.FC = () => {
  const [packages, setPackages] = useState<PackageItemRow[]>(SAMPLE_PACKAGES);
  const [selectedPackId, setSelectedPackId] = useState<number>(1);
  const [componentsMap, setComponentsMap] = useState<Record<number, ComponentItemRow[]>>(SAMPLE_COMPONENTS);

  useEffect(() => {
    fetch('/api/master/packaging')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: PackageItemRow[] = json.data.map((pkg: any) => ({
            id: pkg.id,
            packCode: pkg.barcode || `PKG-${pkg.id}`,
            packName: pkg.product?.name || `포장 규격 #${pkg.id}`,
            packType: pkg.packageType || '골판지박스',
            remark: pkg.remark || '',
          }));
          setPackages(loaded);
        }
      })
      .catch((err) => console.error('Failed to load packaging', err));
  }, []);

  const handleSave = async () => {
    try {
      const selected = packages.find((p) => p.id === selectedPackId);
      const res = await fetch('/api/master/packaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedPackId,
          packageType: selected?.packType || '골판지박스',
          remark: selected?.remark || '',
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('포장 구성이 데이터베이스에 안전하게 저장되었습니다.');
      } else {
        alert('저장 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('저장 중 오류: ' + err.message);
    }
  };

  const selectedPack = packages.find((p) => p.id === selectedPackId) || packages[0] || SAMPLE_PACKAGES[0];
  const currentComponents = componentsMap[selectedPackId] || [];

  const handleAddComponent = () => {
    const newComp: ComponentItemRow = {
      id: Date.now(),
      itemCode: '10003050',
      category: '완성품',
      variety: '도시락',
      itemName: '신규 구성 제품',
      spec: '단위규격',
      unit: 'ea',
      packType: '낱개',
      qty: 1,
      remark: '',
    };
    setComponentsMap((prev) => ({
      ...prev,
      [selectedPackId]: [...(prev[selectedPackId] || []), newComp],
    }));
  };

  const UPPER_COLUMNS: MasterGridColumnDef[] = [
    { key: 'packCode', label: '포장제품코드', width: '130px', align: 'center' },
    { key: 'packName', minWidth: '260px', label: '품명', align: 'left' },
    { key: 'packType', label: '포장타입', width: '120px', align: 'center', format: 'dropdown', options: ['골판지박스', '보냉박스', '플라스틱트레이', '필로우포장'] },
    { key: 'remark', label: '비고', width: '220px', align: 'left' },
  ];

  const LOWER_COLUMNS: MasterGridColumnDef[] = [
    { key: 'itemCode', label: '품번', width: '95px', align: 'center' },
    { key: 'category', label: '구분', width: '65px', align: 'center' },
    { key: 'variety', label: '품종', width: '80px', align: 'center' },
    { key: 'itemName', minWidth: '260px', label: '품명', align: 'left' },
    { key: 'spec', label: '규격', width: '100px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    { key: 'packType', label: '포장타입', width: '90px', align: 'center' },
    { key: 'qty', label: '수량', width: '75px', align: 'right', format: 'number', editable: true },
    { key: 'remark', label: '비고', width: '180px', align: 'left', editable: true },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      <MasterActionBar
        title="포장구성관리"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('조회 완료') },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
          { key: 'delete', label: '삭제', icon: 'delete', onClick: () => alert('선택 구성 삭제') },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('초기화 완료') },
          { key: 'download', label: '엑셀다운로드', icon: 'download', onClick: () => exportGridToExcel({ filename: '포장구성관리', sheetName: '포장구성', columns: UPPER_COLUMNS, data: packages }) },
          { key: 'copy', label: '복사', icon: 'copy', onClick: () => alert('포장 세트 복사 완료') },
        ]}
        helpContent="외포장 박스나 번들 기획 세트에 포함되는 복수 개별 제품 및 부재료의 포장 구성을 관리합니다."
      />

      <div className="flex-1 flex flex-col min-h-0 p-2 gap-2">
        {/* Upper: Package Products */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <span className="font-bold text-gray-800">패키지제품</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600">
                데이터수: <span className="font-bold text-blue-700">273</span>
              </span>
              <button
                type="button"
                onClick={() => alert('새로고침')}
                className="p-1 bg-white hover:bg-gray-100 text-gray-600 rounded border border-gray-300 shadow-2xs"
                title="새로고침"
              >
                <RotateCw size={12} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={UPPER_COLUMNS}
              data={packages}
              selectedRowId={selectedPackId}
              onRowClick={(row) => setSelectedPackId(row.id)}
              summaryRow={false}
            />
          </div>
        </div>

        {/* Lower: Component Items */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">제품구성 ▶</span>
              <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.2 rounded border border-blue-300 font-semibold">
                {selectedPack.packName} ({selectedPack.packCode})
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddComponent}
              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-[11px] flex items-center gap-0.5 shadow-2xs"
            >
              <Plus size={11} /> 추가
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={LOWER_COLUMNS}
              data={currentComponents}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

