'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import { ChevronLeft, ChevronRight, RotateCw, Search } from 'lucide-react';
import { exportGridToExcel } from '@/lib/excelExport';

interface StockItem {
  id: number;
  whName: string;
  vendor: string;
  itemCode: string;
  itemType: string;
  category: string;
  itemName: string;
  spec: string;
  unit: string;
  prevStock: number;
  inQty: number;
  outQty: number;
  currentStock: number;
  safetyStock: number;
  shortage: number; // currentStock - safetyStock (negative = danger)
  unitPrice: number;
  totalAmount: number; // currentStock * unitPrice
}

const WAREHOUSES = ['냉장1', '냉장2', '냉동', '상온', '부자재'];
const ITEM_TYPES = ['원자재', '부자재', '반제품', '완제품'];

const SAMPLE_STOCK_DATA: StockItem[] = [
  {
    id: 1,
    whName: '상온',
    vendor: '평화영농조합',
    itemCode: 'M10001',
    itemType: '원자재',
    category: '곡류',
    itemName: '신동진 햅쌀 (1등급)',
    spec: '20kg/포',
    unit: 'kg',
    prevStock: 3200,
    inQty: 1000,
    outQty: 850,
    currentStock: 3350,
    safetyStock: 2000,
    shortage: 1350,
    unitPrice: 2850,
    totalAmount: 9547500,
  },
  {
    id: 2,
    whName: '상온',
    vendor: '오뚜기',
    itemCode: 'M10002',
    itemType: '원자재',
    category: '조미료',
    itemName: '오뚜기 골드마요네즈',
    spec: '3.2kg/통',
    unit: 'kg',
    prevStock: 480,
    inQty: 120,
    outQty: 150,
    currentStock: 450,
    safetyStock: 300,
    shortage: 150,
    unitPrice: 4200,
    totalAmount: 1890000,
  },
  {
    id: 3,
    whName: '상온',
    vendor: '동원',
    itemCode: 'M10003',
    itemType: '원자재',
    category: '수산가공',
    itemName: '동원 참치통조림 살코기',
    spec: '1.88kg/캔',
    unit: 'kg',
    prevStock: 240,
    inQty: 100,
    outQty: 260,
    currentStock: 80,
    safetyStock: 150,
    shortage: -70, // 부족!
    unitPrice: 11500,
    totalAmount: 920000,
  },
  {
    id: 4,
    whName: '상온',
    vendor: '농심태경',
    itemCode: 'M10004',
    itemType: '원자재',
    category: '건어물',
    itemName: '삼각김밥용 조미김',
    spec: '1000매/속',
    unit: '매',
    prevStock: 45000,
    inQty: 20000,
    outQty: 28000,
    currentStock: 37000,
    safetyStock: 20000,
    shortage: 17000,
    unitPrice: 48,
    totalAmount: 1776000,
  },
  {
    id: 5,
    whName: '부자재',
    vendor: '글로벌코리아',
    itemCode: 'M20001',
    itemType: '부자재',
    category: '포장재',
    itemName: '삼각김밥 삼면포장필름',
    spec: '5000m/roll',
    unit: 'roll',
    prevStock: 35,
    inQty: 10,
    outQty: 12,
    currentStock: 33,
    safetyStock: 20,
    shortage: 13,
    unitPrice: 85000,
    totalAmount: 2805000,
  },
  {
    id: 6,
    whName: '부자재',
    vendor: '두레',
    itemCode: 'M20002',
    itemType: '부자재',
    category: '용기',
    itemName: '11찬도시락 2단 트레이',
    spec: '400ea/box',
    unit: 'ea',
    prevStock: 2800,
    inQty: 0,
    outQty: 1400,
    currentStock: 1400,
    safetyStock: 2000,
    shortage: -600, // 부족!
    unitPrice: 380,
    totalAmount: 532000,
  },
  {
    id: 7,
    whName: '냉장1',
    vendor: '한성',
    itemCode: 'M10010',
    itemType: '원자재',
    category: '축산물',
    itemName: '국내산 돈육 전지 (슬라이스)',
    spec: '10kg/box',
    unit: 'kg',
    prevStock: 850,
    inQty: 500,
    outQty: 420,
    currentStock: 930,
    safetyStock: 500,
    shortage: 430,
    unitPrice: 8900,
    totalAmount: 8277000,
  },
  {
    id: 8,
    whName: '냉장1',
    vendor: 'CJ',
    itemCode: 'M10011',
    itemType: '원자재',
    category: '축산물',
    itemName: 'CJ 델리햄 슬라이스',
    spec: '1kg/pack',
    unit: 'kg',
    prevStock: 180,
    inQty: 100,
    outQty: 220,
    currentStock: 60,
    safetyStock: 120,
    shortage: -60, // 부족!
    unitPrice: 12800,
    totalAmount: 768000,
  },
  {
    id: 9,
    whName: '냉장2',
    vendor: '한울(네트웍스)',
    itemCode: 'M10020',
    itemType: '원자재',
    category: '채소류',
    itemName: '세척 당근채 (신선편의)',
    spec: '5kg/bag',
    unit: 'kg',
    prevStock: 210,
    inQty: 150,
    outQty: 180,
    currentStock: 180,
    safetyStock: 100,
    shortage: 80,
    unitPrice: 4100,
    totalAmount: 738000,
  },
  {
    id: 10,
    whName: '냉장2',
    vendor: '한울(네트웍스)',
    itemCode: 'M10021',
    itemType: '원자재',
    category: '채소류',
    itemName: '양상추 (탈수완료)',
    spec: '5kg/bag',
    unit: 'kg',
    prevStock: 90,
    inQty: 80,
    outQty: 120,
    currentStock: 50,
    safetyStock: 60,
    shortage: -10, // 부족!
    unitPrice: 5300,
    totalAmount: 265000,
  },
  {
    id: 11,
    whName: '냉동',
    vendor: '현대그린푸드',
    itemCode: 'M10030',
    itemType: '원자재',
    category: '냉동가공',
    itemName: '숯불바비큐 패티 (80g)',
    spec: '8kg/box',
    unit: 'kg',
    prevStock: 620,
    inQty: 300,
    outQty: 280,
    currentStock: 640,
    safetyStock: 400,
    shortage: 240,
    unitPrice: 9700,
    totalAmount: 6208000,
  },
  {
    id: 12,
    whName: '냉동',
    vendor: '현대그린푸드',
    itemCode: 'M10031',
    itemType: '원자재',
    category: '냉동가공',
    itemName: '케이준 치킨텐더 (가공)',
    spec: '5kg/box',
    unit: 'kg',
    prevStock: 410,
    inQty: 0,
    outQty: 150,
    currentStock: 260,
    safetyStock: 300,
    shortage: -40, // 부족!
    unitPrice: 10500,
    totalAmount: 2730000,
  },
  {
    id: 13,
    whName: '상온',
    vendor: '당사',
    itemCode: 'P10001',
    itemType: '완제품',
    category: '삼각김밥',
    itemName: '참치마요삼각김밥',
    spec: '110g',
    unit: 'ea',
    prevStock: 1200,
    inQty: 5400,
    outQty: 4800,
    currentStock: 1800,
    safetyStock: 800,
    shortage: 1000,
    unitPrice: 650,
    totalAmount: 1170000,
  },
  {
    id: 14,
    whName: '상온',
    vendor: '당사',
    itemCode: 'P10004',
    itemType: '완제품',
    category: '도시락',
    itemName: '11가지찬도시락',
    spec: '430g',
    unit: 'ea',
    prevStock: 450,
    inQty: 2200,
    outQty: 2100,
    currentStock: 550,
    safetyStock: 300,
    shortage: 250,
    unitPrice: 2800,
    totalAmount: 1540000,
  },
];

export const StockLookupView: React.FC = () => {
  const [data, setData] = useState<StockItem[]>(SAMPLE_STOCK_DATA);
  const [targetDate, setTargetDate] = useState('2026-10-30');
  const [selectedWh, setSelectedWh] = useState('전체');
  const [selectedType, setSelectedType] = useState('전체');
  const [onlyShortage, setOnlyShortage] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [dirtyRowIds, setDirtyRowIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const loadStockData = () => {
    fetch('/api/inventory/stock')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: StockItem[] = json.data.map((inv: any, idx: number) => {
            const safety = inv.product?.safetyStockQty || 100;
            const current = inv.currentQty || 0;
            const price = inv.unitPrice || (inv.currentQty > 0 ? inv.stockAmount / inv.currentQty : 2000);
            return {
              id: inv.id || idx + 1,
              whName: inv.warehouse || '상온',
              vendor: inv.product?.partner?.name || inv.product?.partnerId || '',
              itemCode: inv.productCode || inv.product?.productCode || '',
              itemType: inv.category || inv.product?.category || '원자재',
              category: inv.product?.kind || '원부자재',
              itemName: inv.productName || inv.product?.name || '',
              spec: inv.product?.spec || '',
              unit: inv.unit || inv.product?.unit || 'kg',
              prevStock: current,
              inQty: 0,
              outQty: 0,
              currentStock: current,
              safetyStock: safety,
              shortage: current - safety,
              unitPrice: price,
              totalAmount: current * price,
            };
          });
          setData(loaded);
          setDirtyRowIds(new Set());
        }
      })
      .catch((err) => console.error('Failed to load stock data', err));
  };

  useEffect(() => {
    loadStockData();
  }, []);

  // 단축키 Ctrl+S / Cmd+S 로 저장 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dirtyRowIds, data]);

  // 셀 직접입력 시 연계 자동 계산 및 변경점 추적
  const handleCellChange = (rowId: any, columnKey: string, newValue: any) => {
    setData((prev) =>
      prev.map((item, idx) => {
        const match = item.id === rowId || idx === rowId;
        if (!match) return item;

        const updated: StockItem = { ...item, [columnKey]: newValue };

        // 이월재고, 입출고 수정 시 현재고 연동 계산
        const prevStock = Number(columnKey === 'prevStock' ? newValue : updated.prevStock) || 0;
        const inQty = Number(columnKey === 'inQty' ? newValue : updated.inQty) || 0;
        const outQty = Number(columnKey === 'outQty' ? newValue : updated.outQty) || 0;

        if (columnKey === 'prevStock' || columnKey === 'inQty' || columnKey === 'outQty') {
          updated.currentStock = prevStock + inQty - outQty;
        }

        const currentStock = Number(updated.currentStock) || 0;
        const safetyStock = Number(updated.safetyStock) || 0;
        const unitPrice = Number(updated.unitPrice) || 0;

        // 과부족 및 재고금액 실시간 자동 계산
        updated.shortage = currentStock - safetyStock;
        updated.totalAmount = currentStock * unitPrice;

        return updated;
      })
    );
    setDirtyRowIds((prev) => new Set(prev).add(Number(rowId)));
  };

  // 재고 직접 수정 내역 일괄 DB 저장
  const handleSave = async () => {
    if (dirtyRowIds.size === 0) {
      alert('수정된 재고 내역이 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const updates = data
        .filter((d) => dirtyRowIds.has(d.id))
        .map((d) => ({
          id: d.id,
          warehouse: d.whName,
          currentQty: d.currentStock,
          unitPrice: d.unitPrice,
          stockAmount: d.totalAmount,
          safetyStock: d.safetyStock,
        }));

      const res = await fetch('/api/inventory/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const json = await res.json();
      if (json.success) {
        setDirtyRowIds(new Set());
        alert(`총 ${json.count || updates.length}건의 재고 정보가 성공적으로 저장되었습니다.`);
      } else {
        alert(`저장 실패: ${json.error || '알 수 없는 오류'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`저장 중 오류 발생: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Day shift
  const shiftDay = (delta: number) => {
    const d = new Date(targetDate);
    d.setDate(d.getDate() + delta);
    setTargetDate(d.toISOString().slice(0, 10));
  };

  // Filtered rows
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedWh !== '전체' && item.whName !== selectedWh) return false;
      if (selectedType !== '전체' && item.itemType !== selectedType) return false;
      if (onlyShortage && item.shortage >= 0) return false;
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        const matchName = item.itemName.toLowerCase().includes(kw);
        const matchCode = item.itemCode.toLowerCase().includes(kw);
        const matchCat = item.category.toLowerCase().includes(kw);
        const matchVendor = (item.vendor || '').toLowerCase().includes(kw);
        if (!matchName && !matchCode && !matchCat && !matchVendor) return false;
      }
      return true;
    });
  }, [data, selectedWh, selectedType, onlyShortage, keyword]);

  // Summaries
  const summaries = useMemo(() => {
    let prevStock = 0;
    let inQty = 0;
    let outQty = 0;
    let currentStock = 0;
    let totalAmount = 0;

    filteredData.forEach((row) => {
      prevStock += row.prevStock;
      inQty += row.inQty;
      outQty += row.outQty;
      currentStock += row.currentStock;
      totalAmount += row.totalAmount;
    });

    return {
      prevStock,
      inQty,
      outQty,
      currentStock,
      totalAmount,
    };
  }, [filteredData]);

  const columns: MasterGridColumnDef[] = [
    {
      key: 'whName',
      label: '창고명',
      width: '110px',
      align: 'center',
      sortable: true,
      filterable: true,
      format: 'dropdown',
      options: WAREHOUSES,
    },
    {
      key: 'vendor',
      label: '거래처',
      width: '140px',
      align: 'left',
      sortable: true,
      filterable: true,
      editable: false,
    },
    {
      key: 'itemCode',
      label: '품번',
      width: '90px',
      align: 'center',
      sortable: true,
      filterable: true,
      editable: false,
    },
    {
      key: 'itemType',
      label: '구분',
      width: '70px',
      align: 'center',
      sortable: true,
      editable: false,
    },
    {
      key: 'category',
      label: '품종',
      width: '90px',
      align: 'center',
      sortable: true,
      editable: false,
    },
    {
      key: 'itemName',
      label: '품명',
      minWidth: '220px',
      sortable: true,
      filterable: true,
      editable: false,
    },
    {
      key: 'spec',
      label: '규격',
      width: '90px',
      align: 'center',
      editable: false,
    },
    {
      key: 'unit',
      label: '단위',
      width: '60px',
      align: 'center',
      editable: false,
    },
    {
      key: 'prevStock',
      label: '이월재고',
      width: '90px',
      align: 'right',
      format: 'number',
      sortable: true,
      editable: true,
    },
    {
      key: 'inQty',
      label: '입고수량',
      width: '90px',
      align: 'right',
      format: 'number',
      sortable: true,
      editable: true,
    },
    {
      key: 'outQty',
      label: '출고수량',
      width: '90px',
      align: 'right',
      format: 'number',
      sortable: true,
      editable: true,
    },
    {
      key: 'currentStock',
      label: '현재고',
      width: '100px',
      align: 'right',
      format: 'number',
      sortable: true,
      editable: true,
      isDangerText: (v, row) => row.currentStock < row.safetyStock,
      render: (v, row) => (
        <span
          className={`font-bold ${
            row.currentStock < row.safetyStock ? 'text-red-600 font-bold' : 'text-gray-900'
          }`}
        >
          {Number(v).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'safetyStock',
      label: '안전재고',
      width: '85px',
      align: 'right',
      format: 'number',
      editable: true,
    },
    {
      key: 'shortage',
      label: '과부족',
      width: '90px',
      align: 'right',
      format: 'number',
      highlightNegative: true,
      sortable: true,
      editable: false,
      render: (v) => (
        <span className={Number(v) < 0 ? 'text-red-600 font-bold' : 'text-blue-700'}>
          {Number(v) > 0 ? `+${Number(v).toLocaleString()}` : Number(v).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'unitPrice',
      label: '단가',
      width: '90px',
      align: 'right',
      format: 'currency',
      editable: true,
    },
    {
      key: 'totalAmount',
      label: '재고금액',
      width: '120px',
      align: 'right',
      format: 'currency',
      sortable: true,
      editable: false,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] text-[12px] select-none">
      {/* 1. Header Action Bar */}
      <MasterActionBar
        title="재고조회"
        buttons={[
          {
            key: 'save',
            label: isSaving ? '저장 중...' : dirtyRowIds.size > 0 ? `저장 (${dirtyRowIds.size}건)` : '저장',
            icon: 'save',
            onClick: handleSave,
          },
          { key: 'search', label: '조회', icon: 'search', onClick: loadStockData },
          {
            key: 'download',
            label: '엑셀다운로드',
            icon: 'download',
            onClick: () =>
              exportGridToExcel({
                filename: `현재고조회_${targetDate}`,
                sheetName: '현재고',
                columns: columns,
                data: filteredData,
              }),
          },
        ]}
        helpContent="창고별/품목별 실시간 이월재고, 입출고, 현재고, 안전재고 대비 과부족 및 재고금액을 조회하고 수정/저장할 수 있습니다. (마우스 클릭으로 직접 입력 가능, Ctrl+S로 저장)"
      />

      {/* 2. Filter Bar */}
      <div className="bg-[#e4e8ee] border-b border-[#b0b8c2] px-3 py-1.5 flex items-center justify-between gap-4 text-[12px]">
        <div className="flex items-center gap-3">
          {/* Target Date with prev/next */}
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">기준일자</span>
            <button
              onClick={() => shiftDay(-1)}
              className="p-1 bg-white border border-gray-400 rounded hover:bg-gray-100"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px]"
            />
            <button
              onClick={() => shiftDay(1)}
              className="p-1 bg-white border border-gray-400 rounded hover:bg-gray-100"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Warehouse */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">보관창고</span>
            <select
              value={selectedWh}
              onChange={(e) => setSelectedWh(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px]"
            >
              <option value="전체">전체</option>
              {WAREHOUSES.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Item Type */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">품목구분</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px]"
            >
              <option value="전체">전체</option>
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Search keyword */}
          <div className="flex items-center gap-1.5 ml-2">
            <div className="relative">
              <input
                type="text"
                placeholder="품명/품번/품종/거래처 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px] w-44"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1.5 pointer-events-none" />
            </div>
          </div>

          {/* Safety Shortage Filter */}
          <label className="flex items-center gap-1.5 ml-3 cursor-pointer text-red-700 font-semibold">
            <input
              type="checkbox"
              checked={onlyShortage}
              onChange={(e) => setOnlyShortage(e.target.checked)}
              className="rounded border-red-400 text-red-600 focus:ring-0"
            />
            <span>안전재고 미달 품목만 보기</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          {dirtyRowIds.size > 0 && (
            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-bold animate-pulse">
              수정됨: {dirtyRowIds.size}건
            </span>
          )}
          <span className="text-[12px] font-bold text-gray-700">
            데이터수: <span className="text-blue-700">{filteredData.length.toLocaleString()}</span>
          </span>
          <button
            onClick={() => {
              setKeyword('');
              setSelectedWh('전체');
              setSelectedType('전체');
              setOnlyShortage(false);
            }}
            title="새로고침"
            className="p-1 text-gray-600 hover:text-black rounded hover:bg-gray-200 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Main Grid */}
      <div className="flex-1 p-2 bg-[#d8dde5] overflow-hidden flex flex-col">
        <div className="flex-1 bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          <MasterDataGrid
            columns={columns}
            data={filteredData}
            selectedRowId={selectedRowId}
            onRowClick={(row) => setSelectedRowId(row.id)}
            onCellChange={handleCellChange}
            showRowIndex={true}
            summaryRow={true}
            summaryRowTitle="합계"
            summaryValues={summaries}
            enablePagination={false}
          />
        </div>
      </div>
    </div>
  );
};

