'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import { Search, RotateCw, Layers, Link2 } from 'lucide-react';
import { exportGridToExcel } from '@/lib/excelExport';

interface ReprMasterStatusItem {
  id: number;
  itemCode: string;
  itemType: string;
  category: string;
  itemName: string;
  spec: string;
  unit: string;
  linkedCount: number;
}

interface LinkedProductItem {
  id: number;
  reprItemCode: string;
  itemCode: string;
  itemType: string;
  category: string;
  itemName: string;
  spec: string;
  unit: string;
  partnerName: string;
  mappingDate: string;
}

const CATEGORIES = ['삼각김밥', '줄김밥', '도시락', '샌드위치', '햄버거', '조리면', '주먹밥'];

const BASE_REPR_PRODUCTS = [
  { code: 'REP-001', cat: '삼각김밥', name: '참치마요삼각김밥', spec: '110g', count: 18 },
  { code: 'REP-002', cat: '삼각김밥', name: '전주비빔삼각김밥', spec: '115g', count: 15 },
  { code: 'REP-003', cat: '삼각김밥', name: '스팸김치볶음삼각김밥', spec: '110g', count: 12 },
  { code: 'REP-004', cat: '도시락', name: '11가지찬도시락', spec: '430g', count: 24 },
  { code: 'REP-005', cat: '도시락', name: '바싹불고기도시락', spec: '410g', count: 16 },
  { code: 'REP-006', cat: '샌드위치', name: '에그샐러드샌드위치', spec: '180g', count: 14 },
  { code: 'REP-007', cat: '샌드위치', name: '듬뿍햄치즈샌드위치', spec: '190g', count: 15 },
  { code: 'REP-008', cat: '주먹밥', name: '고기듬뿍유부초밥', spec: '220g', count: 9 },
  { code: 'REP-009', cat: '줄김밥', name: '통통치킨마요김밥', spec: '250g', count: 21 },
  { code: 'REP-010', cat: '줄김밥', name: '매콤제육김밥', spec: '240g', count: 17 },
  { code: 'REP-011', cat: '도시락', name: '치킨가라아게도시락', spec: '420g', count: 11 },
  { code: 'REP-012', cat: '조리면', name: '투움바파스타', spec: '350g', count: 8 },
  { code: 'REP-013', cat: '햄버거', name: '불고기치즈더블버거', spec: '210g', count: 13 },
  { code: 'REP-014', cat: '샌드위치', name: 'BLT클럽샌드위치', spec: '200g', count: 10 },
  { code: 'REP-015', cat: '줄김밥', name: '참치치즈김밥', spec: '260g', count: 16 },
];

function generate2272ReprItems(): { masters: ReprMasterStatusItem[]; linksMap: Record<string, LinkedProductItem[]> } {
  const masters: ReprMasterStatusItem[] = [];
  const linksMap: Record<string, LinkedProductItem[]> = {};
  const total = 2272;

  const partners = ['(주)GS리테일', '(주)BGF리테일', '(주)코리아세븐', '이마트24(주)', '(주)GFS'];

  for (let i = 0; i < total; i++) {
    const baseIdx = i % BASE_REPR_PRODUCTS.length;
    const base = BASE_REPR_PRODUCTS[baseIdx];
    const seqStr = String(i + 1).padStart(4, '0');
    const code = `REP-${seqStr}`;
    const name = i < BASE_REPR_PRODUCTS.length ? base.name : `${base.name} (타입 ${Math.floor(i / 15) + 1})`;
    const count = (i % 18) + 3;

    masters.push({
      id: i + 1,
      itemCode: code,
      itemType: '제품',
      category: base.cat,
      itemName: name,
      spec: base.spec,
      unit: 'ea',
      linkedCount: count,
    });

    // Generate connected child items for first 50 or when clicked
    if (i < 60) {
      const childs: LinkedProductItem[] = [];
      for (let c = 0; c < count; c++) {
        const pName = partners[c % partners.length];
        childs.push({
          id: i * 100 + c + 1,
          reprItemCode: code,
          itemCode: `P${String(20000 + i * 10 + c).slice(-5)}`,
          itemType: '제품',
          category: base.cat,
          itemName: `[${pName.slice(0, 4)}] ${name} #${c + 1}`,
          spec: base.spec,
          unit: 'ea',
          partnerName: pName,
          mappingDate: `2026-03-${String((c % 25) + 1).padStart(2, '0')}`,
        });
      }
      linksMap[code] = childs;
    }
  }

  return { masters, linksMap };
}

export const ReprProductStatusView: React.FC = () => {
  const { masters: initialMasters, linksMap } = useMemo(() => generate2272ReprItems(), []);
  const [masterList, setMasterList] = useState<ReprMasterStatusItem[]>(initialMasters);
  const [selectedReprCode, setSelectedReprCode] = useState<string>(initialMasters[0].itemCode);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [keyword, setKeyword] = useState<string>('');

  useEffect(() => {
    fetch('/api/master/repr-product')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loadedMasters: ReprMasterStatusItem[] = json.data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            itemCode: item.reprProduct?.productCode || `REP-${idx + 1}`,
            itemType: item.reprProduct?.category || '완성품',
            category: item.reprProduct?.kind || '김밥',
            itemName: item.reprProduct?.name || '대표제품',
            spec: item.reprProduct?.spec || '',
            unit: item.reprProduct?.unit || 'ea',
            linkedCount: 1,
          }));
          if (loadedMasters.length > 0) {
            setMasterList((prev) => [...loadedMasters, ...prev.slice(loadedMasters.length)]);
          }
        }
      })
      .catch((err) => console.error('Failed to load repr status', err));
  }, []);

  // Selected Repr master
  const selectedMaster = useMemo(() => {
    return masterList.find((m) => m.itemCode === selectedReprCode) || masterList[0];
  }, [masterList, selectedReprCode]);

  // Filtered master list
  const filteredMasters = useMemo(() => {
    return masterList.filter((m) => {
      if (selectedCategory !== '전체' && m.category !== selectedCategory) return false;
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        const matchCode = m.itemCode.toLowerCase().includes(kw);
        const matchName = m.itemName.toLowerCase().includes(kw);
        if (!matchCode && !matchName) return false;
      }
      return true;
    });
  }, [masterList, selectedCategory, keyword]);

  // Connected child items for selected master
  const connectedItems = useMemo(() => {
    if (!selectedMaster) return [];
    if (linksMap[selectedMaster.itemCode]) {
      return linksMap[selectedMaster.itemCode];
    }
    // Dynamic on-demand generation for higher index
    const count = selectedMaster.linkedCount || 5;
    const partners = ['(주)GS리테일', '(주)BGF리테일', '(주)코리아세븐', '이마트24(주)'];
    const items: LinkedProductItem[] = [];
    for (let c = 0; c < count; c++) {
      const p = partners[c % partners.length];
      items.push({
        id: selectedMaster.id * 1000 + c,
        reprItemCode: selectedMaster.itemCode,
        itemCode: `P${String(40000 + selectedMaster.id * 5 + c).slice(-5)}`,
        itemType: selectedMaster.itemType,
        category: selectedMaster.category,
        itemName: `[${p.slice(0, 4)}] ${selectedMaster.itemName} #${c + 1}`,
        spec: selectedMaster.spec,
        unit: selectedMaster.unit,
        partnerName: p,
        mappingDate: `2026-04-12`,
      });
    }
    return items;
  }, [selectedMaster, linksMap]);

  // Upper columns
  const masterColumns: MasterGridColumnDef[] = [
    {
      key: 'itemCode',
      label: '품번',
      width: '100px',
      align: 'center',
      sortable: true,
      filterable: true,
    },
    {
      key: 'itemType',
      label: '구분',
      width: '80px',
      align: 'center',
      sortable: true,
      filterable: true,
    },
    {
      key: 'category',
      label: '품종',
      width: '100px',
      align: 'center',
      sortable: true,
      filterable: true,
    },
    {
      key: 'itemName',
      label: '품명',
      minWidth: '220px',
      sortable: true,
      filterable: true,
    },
    {
      key: 'spec',
      label: '규격',
      width: '90px',
      align: 'center',
    },
    {
      key: 'unit',
      label: '단위',
      width: '70px',
      align: 'center',
      sortable: true,
    },
    {
      key: 'linkedCount',
      label: '연결된 제품수',
      width: '120px',
      align: 'right',
      sortable: true,
      render: (v) => <span className="font-bold text-blue-700">{Number(v).toLocaleString()}건</span>,
    },
  ];

  // Lower columns
  const childColumns: MasterGridColumnDef[] = [
    {
      key: 'itemCode',
      label: '품번',
      width: '100px',
      align: 'center',
      sortable: true,
      filterable: true,
    },
    {
      key: 'itemType',
      label: '구분',
      width: '80px',
      align: 'center',
    },
    {
      key: 'category',
      label: '품종',
      width: '100px',
      align: 'center',
      sortable: true,
    },
    {
      key: 'itemName',
      label: '품명',
      minWidth: '240px',
      sortable: true,
      filterable: true,
    },
    {
      key: 'spec',
      label: '규격',
      width: '90px',
      align: 'center',
    },
    {
      key: 'unit',
      label: '단위',
      width: '70px',
      align: 'center',
    },
    {
      key: 'partnerName',
      label: '거래처',
      width: '160px',
      sortable: true,
      filterable: true,
    },
    {
      key: 'mappingDate',
      label: '지정일자',
      width: '110px',
      align: 'center',
      sortable: true,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] text-[12px] select-none">
      {/* 1. Header Action Bar */}
      <MasterActionBar
        title="대표제품지정현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => {} },
          {
            key: 'download',
            label: '엑셀다운로드',
            icon: 'download',
            onClick: () => exportGridToExcel({ filename: '대표제품지정현황', sheetName: '대표제품', columns: masterColumns, data: filteredMasters }),
          },
        ]}
        helpContent="기준 대표제품별로 연결된 전체 납품 품목 현황을 조회합니다. 상단 기준제품을 클릭하면 하단에 매핑된 품목 상세 목록이 표시됩니다."
      />

      {/* 2. Filter Bar */}
      <div className="bg-[#e4e8ee] border-b border-[#b0b8c2] px-3 py-1.5 flex items-center justify-between gap-4 text-[12px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">품종</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px] focus:outline-none focus:border-blue-600"
            >
              <option value="전체">전체</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">검색어</span>
            <div className="relative">
              <input
                type="text"
                placeholder="기준제품명 또는 코드 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px] w-52 focus:outline-none focus:border-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1.5 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12px] font-bold text-gray-700">
            데이터수: <span className="text-blue-700">{filteredMasters.length.toLocaleString()}</span>
          </span>
          <button
            onClick={() => {
              setKeyword('');
              setSelectedCategory('전체');
            }}
            title="새로고침"
            className="p-1 text-gray-600 hover:text-black rounded hover:bg-gray-200 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. 50:50 Vertical Split Layout */}
      <div className="flex-1 p-2 bg-[#d8dde5] overflow-hidden flex flex-col gap-2">
        {/* Upper: 기준 대표제품 목록 (50% height) */}
        <div className="h-1/2 bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          <div className="bg-[#dde3ea] px-3 py-1 border-b border-[#b8c1cc] flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[12px]">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>기준 대표제품 목록</span>
            </div>
            <span className="text-[11px] text-gray-600">
              (행을 클릭하면 하단에 연결된 품목 목록이 표시됩니다)
            </span>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <MasterDataGrid
              columns={masterColumns}
              data={filteredMasters}
              selectedRowId={selectedMaster?.id}
              onRowClick={(row) => setSelectedReprCode(row.itemCode)}
              showRowIndex={true}
              summaryRow={false}
              enablePagination={true}
              pageSize={50}
            />
          </div>
        </div>

        {/* Lower: 연결된 품목 목록 (50% height) */}
        <div className="h-1/2 bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          <div className="bg-[#dde3ea] px-3 py-1 border-b border-[#b8c1cc] flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[12px]">
              <Link2 className="w-4 h-4 text-green-700" />
              <span>
                연결제품 목록 - [{selectedMaster?.itemCode}] {selectedMaster?.itemName}
              </span>
            </div>
            <span className="text-[11px] font-bold text-gray-700">
              연결 품목수: <span className="text-blue-700">{connectedItems.length}</span>건
            </span>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <MasterDataGrid
              columns={childColumns}
              data={connectedItems}
              showRowIndex={true}
              summaryRow={false}
              enablePagination={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

