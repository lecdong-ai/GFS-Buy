'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import { Search, ChevronRight, ChevronLeft, RotateCw } from 'lucide-react';

interface TargetProductItem {
  id: number;
  selected: boolean;
  partnerName: string;
  itemCode: string;
  itemType: string;
  itemName: string;
  spec: string;
  unit: string;
  createdDate: string;
  reprItemCode: string;
  reprItemName: string;
}

interface ReprMasterItem {
  id: number;
  itemCode: string;
  itemType: string;
  itemName: string;
  spec: string;
  unit: string;
  mappedCount: number;
}

const REPR_MASTERS_INITIAL: ReprMasterItem[] = [
  { id: 1, itemCode: 'REP-001', itemType: '제품', itemName: '참치마요삼각김밥', spec: '110g', unit: 'ea', mappedCount: 42 },
  { id: 2, itemCode: 'REP-002', itemType: '제품', itemName: '전주비빔삼각김밥', spec: '115g', unit: 'ea', mappedCount: 38 },
  { id: 3, itemCode: 'REP-003', itemType: '제품', itemName: '스팸김치볶음삼각김밥', spec: '110g', unit: 'ea', mappedCount: 29 },
  { id: 4, itemCode: 'REP-004', itemType: '제품', itemName: '11가지찬도시락', spec: '430g', unit: 'ea', mappedCount: 51 },
  { id: 5, itemCode: 'REP-005', itemType: '제품', itemName: '바싹불고기도시락', spec: '410g', unit: 'ea', mappedCount: 34 },
  { id: 6, itemCode: 'REP-006', itemType: '제품', itemName: '에그샐러드샌드위치', spec: '180g', unit: 'ea', mappedCount: 27 },
  { id: 7, itemCode: 'REP-007', itemType: '제품', itemName: '듬뿍햄치즈샌드위치', spec: '190g', unit: 'ea', mappedCount: 31 },
  { id: 8, itemCode: 'REP-008', itemType: '제품', itemName: '고기듬뿍유부초밥', spec: '220g', unit: 'ea', mappedCount: 19 },
  { id: 9, itemCode: 'REP-009', itemType: '제품', itemName: '통통치킨마요김밥', spec: '250g', unit: 'ea', mappedCount: 45 },
  { id: 10, itemCode: 'REP-010', itemType: '제품', itemName: '매콤제육김밥', spec: '240g', unit: 'ea', mappedCount: 36 },
  { id: 11, itemCode: 'REP-011', itemType: '제품', itemName: '치킨가라아게도시락', spec: '420g', unit: 'ea', mappedCount: 22 },
  { id: 12, itemCode: 'REP-012', itemType: '제품', itemName: '케이준치킨샐러드랩', spec: '175g', unit: 'ea', mappedCount: 18 },
];

const BASE_PARTNERS = ['(주)GS리테일', '(주)BGF리테일', '(주)코리아세븐', '이마트24(주)', '(주)GFS본사'];
const BASE_NAMES = [
  '더큰참치마요삼각김밥',
  '뉴전주비빔삼각김밥',
  '매콤스팸김치삼각김밥',
  '혜자로운11찬도시락',
  '직화불고기도시락',
  '듬뿍에그샌드',
  '클래식햄치즈샌드',
  '정통유부초밥세트',
  '통통치킨마요줄김밥',
  '매콤한돈제육김밥',
  '더블패티비프버거',
  '바비큐치킨버거',
  '베이컨치즈토스트',
  '불고기치즈브리또',
  '소떡소떡롤',
];

function generate1626Products(): TargetProductItem[] {
  const list: TargetProductItem[] = [];
  const total = 1626;

  for (let i = 0; i < total; i++) {
    const pIdx = i % BASE_PARTNERS.length;
    const nameIdx = i % BASE_NAMES.length;
    const reprIdx = i % REPR_MASTERS_INITIAL.length;
    const isMapped = i % 5 !== 0; // 80% mapped
    const repr = isMapped ? REPR_MASTERS_INITIAL[reprIdx] : null;

    list.push({
      id: i + 1,
      selected: false,
      partnerName: BASE_PARTNERS[pIdx],
      itemCode: `P${String(10000 + i).slice(-5)}`,
      itemType: i % 12 === 0 ? '상품' : '제품',
      itemName: `${BASE_NAMES[nameIdx]} ${i > 15 ? '#' + ((i % 50) + 1) : ''}`,
      spec: `${100 + (i % 35) * 10}g`,
      unit: 'ea',
      createdDate: `2026-0${(i % 5) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
      reprItemCode: repr ? repr.itemCode : '',
      reprItemName: repr ? repr.itemName : '',
    });
  }
  return list;
}

export const ReprProductRegView: React.FC = () => {
  const [targetList, setTargetList] = useState<TargetProductItem[]>(() => generate1626Products());
  const [reprList, setReprList] = useState<ReprMasterItem[]>(REPR_MASTERS_INITIAL);
  const [selectedReprId, setSelectedReprId] = useState<number | null>(1);
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);

  // Filter conditions
  const [searchKw, setSearchKw] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNMAPPED' | 'MAPPED'>('ALL');

  useEffect(() => {
    fetch('/api/master/repr-product')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const mapping = new Map();
          json.data.forEach((item: any) => {
            mapping.set(item.orderProduct?.productCode, {
              reprCode: item.reprProduct?.productCode || '',
              reprName: item.reprProduct?.name || '',
            });
          });
          setTargetList((prev) =>
            prev.map((t) => {
              const m = mapping.get(t.itemCode);
              if (m) {
                return { ...t, reprItemCode: m.reprCode, reprItemName: m.reprName };
              }
              return t;
            })
          );
        }
      })
      .catch((err) => console.error('Failed to load repr products', err));
  }, []);

  // Currently selected representative item
  const activeRepr = useMemo(() => {
    return reprList.find((r) => r.id === selectedReprId) || null;
  }, [reprList, selectedReprId]);

  // Filtered left list
  const filteredTargets = useMemo(() => {
    return targetList.filter((item) => {
      if (statusFilter === 'UNMAPPED' && item.reprItemCode) return false;
      if (statusFilter === 'MAPPED' && !item.reprItemCode) return false;
      if (searchKw.trim()) {
        const kw = searchKw.trim().toLowerCase();
        const matchName = item.itemName.toLowerCase().includes(kw);
        const matchCode = item.itemCode.toLowerCase().includes(kw);
        const matchPartner = item.partnerName.toLowerCase().includes(kw);
        const matchRepr = item.reprItemName.toLowerCase().includes(kw);
        if (!matchName && !matchCode && !matchPartner && !matchRepr) return false;
      }
      return true;
    });
  }, [targetList, statusFilter, searchKw]);

  // Selected targets count
  const selectedTargetCount = useMemo(() => {
    return targetList.filter((t) => t.selected).length;
  }, [targetList]);

  // Toggle selection on target
  const handleToggleTargetSelect = (rowId: number) => {
    setTargetList((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, selected: !r.selected } : r))
    );
  };

  // Toggle select all in current filtered view
  const handleSelectAllTargets = (check: boolean) => {
    const ids = new Set(filteredTargets.map((f) => f.id));
    setTargetList((prev) =>
      prev.map((r) => (ids.has(r.id) ? { ...r, selected: check } : r))
    );
  };

  // Assign selected representative to selected targets
  const handleAssignRepr = () => {
    if (!activeRepr) {
      alert('우측 목록에서 지정할 대표제품을 먼저 선택해주세요.');
      return;
    }
    const selectedTargets = targetList.filter((t) => t.selected);
    if (selectedTargets.length === 0) {
      alert('대표제품을 지정할 대상 품목을 좌측 목록에서 1개 이상 체크해주세요.');
      return;
    }

    setTargetList((prev) =>
      prev.map((r) => {
        if (r.selected) {
          return {
            ...r,
            reprItemCode: activeRepr.itemCode,
            reprItemName: activeRepr.itemName,
            selected: false,
          };
        }
        return r;
      })
    );

    // Update mapped count
    setReprList((prev) =>
      prev.map((item) =>
        item.id === activeRepr.id
          ? { ...item, mappedCount: item.mappedCount + selectedTargets.length }
          : item
      )
    );

    alert(`${selectedTargets.length}건의 품목에 [${activeRepr.itemName}] 대표제품이 지정되었습니다.`);
  };

  // Unassign
  const handleUnassignRepr = () => {
    const selectedTargets = targetList.filter((t) => t.selected && t.reprItemCode);
    if (selectedTargets.length === 0) {
      alert('대표제품 지정을 해제할 대상 품목을 좌측 목록에서 체크해주세요.');
      return;
    }

    setTargetList((prev) =>
      prev.map((r) => {
        if (r.selected) {
          return {
            ...r,
            reprItemCode: '',
            reprItemName: '',
            selected: false,
          };
        }
        return r;
      })
    );

    alert(`${selectedTargets.length}건의 품목의 대표제품 지정이 해제되었습니다.`);
  };

  const handleSave = async () => {
    try {
      const mapped = targetList.filter((t) => t.reprItemCode);
      const res = await fetch('/api/master/repr-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: mapped.slice(0, 100).map((m) => ({
            orderProductId: m.id,
            reprProductId: selectedReprId || 1,
            effectiveDate: '2026-10-01',
            remark: `${m.itemName} -> ${m.reprItemName}`,
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('대표제품 지정 정보가 데이터베이스에 성공적으로 저장되었습니다.');
      } else {
        alert('저장 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('저장 중 오류: ' + err.message);
    }
  };

  const handleReset = () => {
    setSearchKw('');
    setStatusFilter('ALL');
    setTargetList((prev) => prev.map((r) => ({ ...r, selected: false })));
  };

  // Target grid columns
  const targetColumns: MasterGridColumnDef[] = [
    {
      key: 'selected',
      label: '선택',
      width: '60px',
      align: 'center',
      render: (val, row) => (
        <input
          type="checkbox"
          checked={!!val}
          onChange={() => handleToggleTargetSelect(row.id)}
          className="rounded border-gray-400 text-blue-600 focus:ring-0 cursor-pointer"
        />
      ),
    },
    {
      key: 'partnerName',
      label: '거래처',
      width: '120px',
      sortable: true,
      filterable: true,
    },
    {
      key: 'itemCode',
      label: '품번',
      width: '90px',
      align: 'center',
      sortable: true,
      filterable: true,
    },
    {
      key: 'itemType',
      label: '구분',
      width: '60px',
      align: 'center',
      sortable: true,
    },
    {
      key: 'itemName',
      label: '품명',
      minWidth: '180px',
      sortable: true,
      filterable: true,
    },
    {
      key: 'spec',
      label: '규격',
      width: '70px',
      align: 'center',
    },
    {
      key: 'unit',
      label: '단위',
      width: '60px',
      align: 'center',
    },
    {
      key: 'reprItemName',
      label: '지정 대표제품',
      width: '160px',
      render: (val) =>
        val ? (
          <span className="font-semibold text-blue-800">{val}</span>
        ) : (
          <span className="text-gray-400 italic">미지정</span>
        ),
    },
    {
      key: 'createdDate',
      label: '생성일자',
      width: '95px',
      align: 'center',
      sortable: true,
    },
  ];

  // Repr master grid columns
  const reprColumns: MasterGridColumnDef[] = [
    {
      key: 'itemCode',
      label: '품번',
      width: '90px',
      align: 'center',
      sortable: true,
    },
    {
      key: 'itemType',
      label: '구분',
      width: '60px',
      align: 'center',
    },
    {
      key: 'itemName',
      label: '대표제품명',
      minWidth: '180px',
      sortable: true,
    },
    {
      key: 'spec',
      label: '규격',
      width: '70px',
      align: 'center',
    },
    {
      key: 'unit',
      label: '단위',
      width: '60px',
      align: 'center',
    },
    {
      key: 'mappedCount',
      label: '지정품목수',
      width: '90px',
      align: 'right',
      sortable: true,
      render: (v) => <span className="font-bold text-blue-700">{Number(v).toLocaleString()}건</span>,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] text-[12px] select-none">
      {/* 1. Header Action Bar */}
      <MasterActionBar
        title="대표제품지정등록"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => {} },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: handleReset },
        ]}
        helpContent="각 거래처별 납품 품목들을 공통 대표제품(마스터)에 매핑하여 통합 수급 및 통계 관리를 수행합니다."
      />

      {/* 2. Filter Bar */}
      <div className="bg-[#e4e8ee] border-b border-[#b0b8c2] px-3 py-1.5 flex items-center justify-between gap-4 text-[12px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">검색어</span>
            <div className="relative">
              <input
                type="text"
                placeholder="품명/품번/거래처 검색"
                value={searchKw}
                onChange={(e) => setSearchKw(e.target.value)}
                className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px] w-52 focus:outline-none focus:border-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-2.5 py-0.5 border border-gray-300 rounded">
            <span className="font-semibold text-gray-700 text-[11px]">매핑상태:</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === 'ALL'}
                onChange={() => setStatusFilter('ALL')}
                className="text-blue-600"
              />
              <span>전체</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === 'UNMAPPED'}
                onChange={() => setStatusFilter('UNMAPPED')}
                className="text-blue-600"
              />
              <span className="text-red-600 font-semibold">미지정</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === 'MAPPED'}
                onChange={() => setStatusFilter('MAPPED')}
                className="text-blue-600"
              />
              <span>지정완료</span>
            </label>
          </div>

          {selectedTargetCount > 0 && (
            <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-blue-300">
              {selectedTargetCount}건 선택됨
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12px] font-bold text-gray-700">
            데이터수: <span className="text-blue-700">{filteredTargets.length.toLocaleString()}</span>
          </span>
          <button
            onClick={() => {
              setSearchKw('');
              setStatusFilter('ALL');
            }}
            title="새로고침"
            className="p-1 text-gray-600 hover:text-black rounded hover:bg-gray-200 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Composite 3-Section Layout */}
      <div className="flex-1 p-2 bg-[#d8dde5] overflow-hidden flex flex-row gap-2">
        {/* Left: Target Products Grid (55% width) */}
        <div className="w-[58%] bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          <div className="bg-[#dde3ea] px-3 py-1 border-b border-[#b8c1cc] flex items-center justify-between">
            <span className="font-bold text-gray-800 text-[12px]">매핑 대상 품목 목록</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectAllTargets(true)}
                className="px-2 py-0.5 bg-white border border-gray-400 hover:bg-gray-100 rounded text-[11px] text-gray-700"
              >
                전체선택
              </button>
              <button
                onClick={() => handleSelectAllTargets(false)}
                className="px-2 py-0.5 bg-white border border-gray-400 hover:bg-gray-100 rounded text-[11px] text-gray-700"
              >
                전체해제
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <MasterDataGrid
              columns={targetColumns}
              data={filteredTargets}
              selectedRowId={selectedTargetId}
              onRowClick={(row) => setSelectedTargetId(row.id)}
              showRowIndex={true}
              summaryRow={false}
              enablePagination={true}
              pageSize={100}
            />
          </div>
        </div>

        {/* Center: Action Buttons Group */}
        <div className="w-[60px] flex flex-col items-center justify-center gap-3 px-1">
          <button
            onClick={handleAssignRepr}
            title="선택 품목에 대표제품 지정"
            className="w-full py-3 bg-[#426ba8] hover:bg-[#34588e] text-white rounded border border-[#264474] shadow flex flex-col items-center justify-center gap-1 active:bg-[#1d355b] transition-colors"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            <span className="text-[10px] font-bold text-center leading-tight">지정</span>
          </button>

          <button
            onClick={handleUnassignRepr}
            title="선택 품목 대표제품 지정 해제"
            className="w-full py-3 bg-[#e8ecf2] hover:bg-[#d6dbe3] text-gray-800 rounded border border-[#a2adb9] shadow flex flex-col items-center justify-center gap-1 active:bg-[#c2cad4] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            <span className="text-[10px] font-bold text-center leading-tight">해제</span>
          </button>
        </div>

        {/* Right: Representative Product Master (42% width) */}
        <div className="flex-1 bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          <div className="bg-[#dde3ea] px-3 py-1 border-b border-[#b8c1cc] flex items-center justify-between">
            <span className="font-bold text-gray-800 text-[12px]">기준 대표제품 목록 (마스터)</span>
            {activeRepr && (
              <span className="text-[11px] font-semibold text-blue-700">
                선택: [{activeRepr.itemCode}] {activeRepr.itemName}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <MasterDataGrid
              columns={reprColumns}
              data={reprList}
              selectedRowId={selectedReprId}
              onRowClick={(row) => setSelectedReprId(row.id)}
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

