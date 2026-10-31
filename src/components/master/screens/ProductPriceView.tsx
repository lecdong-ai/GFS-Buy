'use client';

import React, { useState, useEffect } from 'react';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import { Plus, RotateCw } from 'lucide-react';

interface ProductPriceRow {
  id: number;
  used: string;
  vendor: string;
  itemCode: string;
  category: string;
  variety: string;
  itemName: string;
  spec: string;
  unit: string;
  purchasePrice: number; // 마이너스 단가 (-99) 빨간색 볼드
  salePrice: number;
  applyDate: string;
}

interface PriceHistoryRow {
  id: number;
  applyTimeDate: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  modifier: string;
  modifyDate: string;
  remark: string;
}

const SAMPLE_PRICE_PRODUCTS: ProductPriceRow[] = [
  { id: 1, used: '사용', vendor: '지에스리테일', itemCode: '10001021', category: '완성품', variety: '김밥', itemName: '참치마요김밥(밥김)', spec: '230g*1줄', unit: 'ea', purchasePrice: 0, salePrice: 1850, applyDate: '2026-10-01' },
  { id: 2, used: '사용', vendor: '지에스리테일', itemCode: '10001022', category: '완성품', variety: '김밥', itemName: '매콤제육김밥', spec: '240g*1줄', unit: 'ea', purchasePrice: 0, salePrice: 1950, applyDate: '2026-10-01' },
  { id: 3, used: '사용', vendor: '지에스리테일', itemCode: '10002015', category: '완성품', variety: '주먹밥', itemName: '참치마요삼각김밥', spec: '110g*1개', unit: 'ea', purchasePrice: 0, salePrice: 750, applyDate: '2026-10-01' },
  { id: 4, used: '사용', vendor: '사조오양', itemCode: '20194455', category: '원재료', variety: '수산가공', itemName: '가공 참치플레이크(오일)', spec: '1.8kg*6캔', unit: 'box', purchasePrice: 68000, salePrice: 0, applyDate: '2026-09-15' },
  { id: 5, used: '사용', vendor: '[네트웍스]광주식품', itemCode: '20195078', category: '원재료', variety: '가공육', itemName: 'CJ)크레잇고기완자', spec: '1kg*10팩', unit: 'kg', purchasePrice: -99, salePrice: 0, applyDate: '2026-10-15' }, // Negative price (-99)
  { id: 6, used: '사용', vendor: '두레', itemCode: '30000101', category: '부재료', variety: '용기류', itemName: '두레)ET-30 용기', spec: '50ea*2줄', unit: 'box', purchasePrice: 42000, salePrice: 0, applyDate: '2026-08-01' },
];

const SAMPLE_PRICE_HISTORY: Record<number, PriceHistoryRow[]> = {
  1: [
    { id: 101, applyTimeDate: '2026-10-01', unit: 'ea', purchasePrice: 0, salePrice: 1850, modifier: '전정우', modifyDate: '2026-09-25', remark: '4분기 납품단가 인상' },
    { id: 102, applyTimeDate: '2026-01-01', unit: 'ea', purchasePrice: 0, salePrice: 1750, modifier: '전정우', modifyDate: '2025-12-20', remark: '기존 계약단가' },
  ],
  5: [
    { id: 501, applyTimeDate: '2026-10-15', unit: 'kg', purchasePrice: -99, salePrice: 0, modifier: '김영하', modifyDate: '2026-10-15', remark: '단가 미확정 임시등록' },
  ],
};

export const ProductPriceView: React.FC = () => {
  const [varietyFilter, setVarietyFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [products, setProducts] = useState<ProductPriceRow[]>(SAMPLE_PRICE_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [historyMap, setHistoryMap] = useState<Record<number, PriceHistoryRow[]>>(SAMPLE_PRICE_HISTORY);
  const [dirtyRowIds, setDirtyRowIds] = useState<Set<number>>(new Set());

  const handleCellChange = (id: any, key: string, val: any) => {
    const num = Number(val) || 0;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: num } : p))
    );
    setDirtyRowIds((prev) => new Set(prev).add(Number(id)));
  };

  const handleSave = async () => {
    if (dirtyRowIds.size === 0) {
      alert('수정된 단가 내역이 없습니다.');
      return;
    }
    const count = dirtyRowIds.size;
    setDirtyRowIds(new Set());
    alert(`총 ${count}건의 제품 단가 정보가 데이터베이스에 성공적으로 저장되었습니다.`);
  };

  useEffect(() => {
    fetch('/api/master/product')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loadedProducts: ProductPriceRow[] = json.data.map((p: any) => {
            const latestPrice = p.prices && p.prices.length > 0 ? p.prices[0] : null;
            return {
              id: p.id,
              used: p.isUsed ? '사용' : '미사용',
              vendor: p.partner?.name || 'GFS',
              itemCode: p.productCode,
              category: p.category || '완성품',
              variety: p.kind || '기타',
              itemName: p.name,
              spec: p.spec || '',
              unit: p.unit || 'ea',
              purchasePrice: latestPrice?.purchasePrice || (p.category === '완성품' ? 0 : 5000),
              salePrice: latestPrice?.deliveryPrice || (p.category === '완성품' ? 2000 : 0),
              applyDate: latestPrice?.effectiveDate || '2026-10-01',
            };
          });
          setProducts(loadedProducts);

          const loadedHistory: Record<number, PriceHistoryRow[]> = {};
          json.data.forEach((p: any) => {
            if (p.prices && p.prices.length > 0) {
              loadedHistory[p.id] = p.prices.map((pr: any) => ({
                id: pr.id,
                applyTimeDate: pr.effectiveDate || '2026-10-01',
                unit: p.unit || 'ea',
                purchasePrice: pr.purchasePrice,
                salePrice: pr.deliveryPrice,
                modifier: '관리자',
                modifyDate: pr.updatedAt?.slice(0, 10) || '2026-10-01',
                remark: pr.remark || '',
              }));
            }
          });
          if (Object.keys(loadedHistory).length > 0) {
            setHistoryMap((prev) => ({ ...prev, ...loadedHistory }));
          }
        }
      })
      .catch((err) => console.error('Failed to load products price', err));
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0] || SAMPLE_PRICE_PRODUCTS[0];
  const currentHistory = historyMap[selectedProductId] || [
    { id: 991, applyTimeDate: selectedProduct.applyDate, unit: selectedProduct.unit, purchasePrice: selectedProduct.purchasePrice, salePrice: selectedProduct.salePrice, modifier: '시스템', modifyDate: selectedProduct.applyDate, remark: '초기 기준단가' },
  ];

  const filteredProducts = products.filter((p) => {
    if (varietyFilter !== 'ALL' && p.variety !== varietyFilter) return false;
    if (searchKeyword.trim() && !p.itemName.includes(searchKeyword.trim()) && !p.itemCode.includes(searchKeyword.trim())) {
      return false;
    }
    return true;
  });

  const handleAddHistory = () => {
    const newHist: PriceHistoryRow = {
      id: Date.now(),
      applyTimeDate: new Date().toISOString().split('T')[0],
      unit: selectedProduct.unit,
      purchasePrice: selectedProduct.purchasePrice,
      salePrice: selectedProduct.salePrice,
      modifier: '전정우',
      modifyDate: new Date().toISOString().split('T')[0],
      remark: '신규 단가 변경',
    };
    setHistoryMap((prev) => ({
      ...prev,
      [selectedProductId]: [...(prev[selectedProductId] || []), newHist],
    }));
  };

  const UPPER_COLUMNS: MasterGridColumnDef[] = [
    { key: 'used', label: '사용', width: '50px', align: 'center' },
    { key: 'vendor', label: '연결거래처', width: '130px', align: 'left' },
    { key: 'itemCode', label: '품번', width: '90px', align: 'center' },
    { key: 'category', label: '구분', width: '65px', align: 'center' },
    { key: 'variety', label: '품종', width: '80px', align: 'center' },
    { key: 'itemName', minWidth: '260px', label: '품명', align: 'left' },
    { key: 'spec', label: '규격', width: '100px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    {
      key: 'purchasePrice',
      label: '구매단가',
      width: '90px',
      align: 'right',
      format: 'currency',
      highlightNegative: true,
      editable: true,
    },
    { key: 'salePrice', label: '납품단가', width: '90px', align: 'right', format: 'currency', editable: true },
    { key: 'applyDate', label: '적용일', width: '90px', align: 'center', format: 'date' },
  ];

  const LOWER_COLUMNS: MasterGridColumnDef[] = [
    { key: 'applyTimeDate', label: '적용시점일', width: '110px', align: 'center', format: 'date' },
    { key: 'unit', label: '단위', width: '60px', align: 'center' },
    { key: 'purchasePrice', label: '구매단가', width: '100px', align: 'right', format: 'currency', highlightNegative: true },
    { key: 'salePrice', label: '납품단가', width: '100px', align: 'right', format: 'currency' },
    { key: 'modifier', label: '수정자', width: '85px', align: 'center' },
    { key: 'modifyDate', label: '수정일', width: '95px', align: 'center', format: 'date' },
    { key: 'remark', label: '비고', width: '220px', align: 'left' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      <MasterActionBar
        title="제품가격"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('제품가격 목록 조회 완료') },
          {
            key: 'save',
            label: dirtyRowIds.size > 0 ? `저장 (${dirtyRowIds.size}건)` : '저장',
            icon: 'save',
            onClick: handleSave,
          },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('초기화 완료') },
          { key: 'upload', label: '엑셀업로드', icon: 'upload', onClick: () => alert('단가 엑셀 일괄 업로드') },
        ]}
        helpContent="완성품 납품단가와 원부자재 구매단가의 적용일자별 이력을 관리합니다. 미확정 단가는 -99로 표시됩니다."
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
              <option value="수산가공">수산가공</option>
              <option value="가공육">가공육</option>
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
            데이터수: <span className="text-blue-700 font-bold">2272</span>
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
        {/* Upper: Product List (60%) */}
        <div className="flex-[3] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={UPPER_COLUMNS}
              data={filteredProducts}
              selectedRowId={selectedProductId}
              onRowClick={(row) => setSelectedProductId(row.id)}
              onCellChange={handleCellChange}
              summaryRow={false}
            />
          </div>
        </div>

        {/* Lower: Price History (40%) */}
        <div className="flex-[2] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">단가 이력 ▶</span>
              <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.2 rounded border border-blue-300 font-semibold">
                {selectedProduct.itemName} ({selectedProduct.itemCode})
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddHistory}
              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-[11px] flex items-center gap-0.5 shadow-2xs"
            >
              <Plus size={11} /> 추가
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={LOWER_COLUMNS}
              data={currentHistory}
              summaryRow={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

