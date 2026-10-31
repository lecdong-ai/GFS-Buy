'use client';

import React, { useState, useEffect } from 'react';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import { Plus, RotateCw } from 'lucide-react';

interface ProductUnitMasterRow {
  id: number;
  itemCode: string;
  category: string;
  variety: string;
  itemName: string;
  spec: string;
}

interface UnitConversionRow {
  id: number;
  used: boolean;
  baseUnit: string;
  targetUnit: string;
  baseQty: number;
  targetQty: number;
  remark: string;
}

const SAMPLE_UNIT_PRODUCTS: ProductUnitMasterRow[] = [
  { id: 1, itemCode: '10001021', category: '완성품', variety: '김밥', itemName: '참치마요김밥(밥김)', spec: '230g*1줄' },
  { id: 2, itemCode: '10002015', category: '완성품', variety: '주먹밥', itemName: '참치마요삼각김밥', spec: '110g*1개' },
  { id: 3, itemCode: '20000010', category: '원재료', variety: '곡류', itemName: '국내산 경기미 햅쌀', spec: '20kg/포' },
  { id: 4, itemCode: '20194455', category: '원재료', variety: '수산가공', itemName: '가공 참치플레이크(오일)', spec: '1.8kg*6캔' },
  { id: 5, itemCode: '30000101', category: '부재료', variety: '용기류', itemName: '두레)ET-30 용기', spec: '50ea*2줄' },
];

const SAMPLE_CONVERSIONS: Record<number, UnitConversionRow[]> = {
  1: [
    { id: 101, used: true, baseUnit: 'box', targetUnit: 'ea', baseQty: 1, targetQty: 24, remark: '1박스 = 24줄 포장' },
  ],
  2: [
    { id: 201, used: true, baseUnit: 'box', targetUnit: 'ea', baseQty: 1, targetQty: 30, remark: '1박스 = 30개들이' },
  ],
  3: [
    { id: 301, used: true, baseUnit: '포', targetUnit: 'kg', baseQty: 1, targetQty: 20, remark: '1포 = 20kg' },
    { id: 302, used: true, baseUnit: 'kg', targetUnit: 'g', baseQty: 1, targetQty: 1000, remark: '소요량 g단위 변환' },
  ],
  4: [
    { id: 401, used: true, baseUnit: 'box', targetUnit: '캔', baseQty: 1, targetQty: 6, remark: '1박스 = 6캔' },
    { id: 402, used: true, baseUnit: '캔', targetUnit: 'kg', baseQty: 1, targetQty: 1.8, remark: '1캔 = 1.8kg' },
  ],
  5: [
    { id: 501, used: true, baseUnit: 'box', targetUnit: 'ea', baseQty: 1, targetQty: 100, remark: '50ea * 2줄' },
  ],
};

export const ProductUnitView: React.FC = () => {
  const [varietyFilter, setVarietyFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [products, setProducts] = useState<ProductUnitMasterRow[]>(SAMPLE_UNIT_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [conversionMap, setConversionMap] = useState<Record<number, UnitConversionRow[]>>(SAMPLE_CONVERSIONS);

  useEffect(() => {
    fetch('/api/master/product')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loadedProducts: ProductUnitMasterRow[] = json.data.map((p: any) => ({
            id: p.id,
            itemCode: p.productCode,
            category: p.category || '완성품',
            variety: p.kind || '기타',
            itemName: p.name,
            spec: p.spec || '',
          }));
          setProducts(loadedProducts);
        }
      })
      .catch((err) => console.error('Failed to load products for unit view', err));
  }, []);

  const handleSave = () => {
    alert('단위 변환 정보가 데이터베이스에 반영되었습니다.');
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0] || SAMPLE_UNIT_PRODUCTS[0];
  const currentConversions = conversionMap[selectedProductId] || [];

  const handleAddConversion = () => {
    const newConv: UnitConversionRow = {
      id: Date.now(),
      used: true,
      baseUnit: 'box',
      targetUnit: 'ea',
      baseQty: 1,
      targetQty: 1,
      remark: '신규 단위 변환',
    };
    setConversionMap((prev) => ({
      ...prev,
      [selectedProductId]: [...(prev[selectedProductId] || []), newConv],
    }));
  };

  const UPPER_COLUMNS: MasterGridColumnDef[] = [
    { key: 'itemCode', label: '품번', width: '100px', align: 'center' },
    { key: 'category', label: '구분', width: '70px', align: 'center' },
    { key: 'variety', label: '품종', width: '90px', align: 'center' },
    { key: 'itemName', minWidth: '260px', label: '품명', align: 'left' },
    { key: 'spec', label: '규격', width: '130px', align: 'center' },
  ];

  const LOWER_COLUMNS: MasterGridColumnDef[] = [
    { key: 'used', label: '사용', width: '45px', align: 'center', format: 'checkbox' },
    { key: 'baseUnit', label: '기준단위', width: '90px', align: 'center', editable: true },
    { key: 'targetUnit', label: '변환단위', width: '90px', align: 'center', editable: true },
    { key: 'baseQty', label: '기준량', width: '90px', align: 'right', format: 'number', editable: true },
    { key: 'targetQty', label: '변환량', width: '90px', align: 'right', format: 'number', editable: true },
    { key: 'remark', label: '비고', width: '250px', align: 'left', editable: true },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      <MasterActionBar
        title="제품단위관리"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('조회 완료') },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('초기화 완료') },
        ]}
        helpContent="제품 및 원부자재의 발주단위(box, 포), 생산단위(kg, g), 출하단위(ea) 간의 환산 비율을 정의합니다."
      />

      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-800">제품</span>

          <div className="flex items-center gap-1 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">품종:</span>
            <select
              value={varietyFilter}
              onChange={(e) => setVarietyFilter(e.target.value)}
              className="bg-white border border-gray-400 px-1.5 py-0.5 text-[12px] rounded-xs shadow-2xs focus:outline-blue-500"
            >
              <option value="ALL">ALL (전체)</option>
              <option value="김밥">김밥</option>
              <option value="주먹밥">주먹밥</option>
              <option value="곡류">곡류</option>
              <option value="수산가공">수산가공</option>
              <option value="용기류">용기류</option>
            </select>
          </div>

          <div className="flex items-center gap-1 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">검색어:</span>
            <input
              type="text"
              placeholder="품번 또는 품명 입력"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] rounded-xs shadow-2xs w-44"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
            데이터수: <span className="text-blue-700 font-bold">1143</span>
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

      <div className="flex-1 flex flex-col min-h-0 p-2 gap-2">
        {/* Upper Grid (50%) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={UPPER_COLUMNS}
              data={products}
              selectedRowId={selectedProductId}
              onRowClick={(row) => setSelectedProductId(row.id)}
              summaryRow={false}
            />
          </div>
        </div>

        {/* Lower Grid (50%) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">단위 환산 규칙 ▶</span>
              <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.2 rounded border border-blue-300 font-semibold">
                {selectedProduct.itemName} ({selectedProduct.itemCode})
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddConversion}
              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-[11px] flex items-center gap-0.5 shadow-2xs"
            >
              <Plus size={11} /> 추가
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={LOWER_COLUMNS}
              data={currentConversions}
              summaryRow={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

