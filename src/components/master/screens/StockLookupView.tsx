'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import { ChevronLeft, ChevronRight, RotateCw, Search } from 'lucide-react';
import { exportGridToExcel } from '@/lib/excelExport';

// 재고조사표 정본 시트 (서버 lib/gfs/canonical.ts와 동일 기준)
const AUDIT_SHEETS = ['부자재', '냉장1', '냉장2', '냉동', '상온'] as const;

/** 조달일수 파싱: D+1→1, D+2→2, 없으면 2 */
function parseLeadDays(s: string): number {
  const m = /D\+(\d+)/.exec(s || '');
  if (m) return Math.max(1, parseInt(m[1], 10));
  return 2;
}

/** 안전재고 자동계산: ROUND(일사용량×입수량×조달일수×1.5) */
function calcSafetyStock(dailyBox: number, pack: number, leadDays: number): number {
  if (!(dailyBox > 0) || !(pack > 0)) return 0;
  return Math.round(dailyBox * pack * leadDays * 1.5);
}

/** 품명 정규화: [접두어]/괄호/기호 제거 + 소문자 */
function normName(s: unknown): string {
  return String(s ?? '')
    .replace(/\[.+?\]/g, '')
    .replace(/\(.+?\)/g, '')
    .replace(/[^가-힣a-zA-Z0-9]/g, '')
    .toLowerCase();
}

interface StockItem {
  id: number;
  whName: string;
  vendor: string;
  orderSupplier: string; // 발주처 (발주서 정본 거래처명)
  orderDays: number; // 발주일수 (발주서 G열)
  itemCode: string;
  itemType: string;
  category: string;
  itemName: string;
  spec: string;
  unit: string;
  inboundDate: string; // 입고일 (D+2 등)
  expiryDate: string; // 유통기한
  orderDay: string; // 발주일
  dailyUsage: number; // 일사용량(박스)
  packUnit: number; // 입수량
  boxQty: number; // 박스
  pieceQty: number; // 낱개(봉)
  prevStock: number;
  inQty: number;
  outQty: number;
  currentStock: number;
  safetyStock: number;
  shortage: number; // currentStock - safetyStock (negative = danger)
  status: string; // 품절/부족/과잉/정상
  stockDays: number; // 재고유지일 = (현재고 + 입고량) / 일사용량 — 엑셀 N열과 동일식
  unitPrice: number;
  totalAmount: number; // currentStock * unitPrice
}

/** 재고상태 판정: 품절(0) / 부족(안전미달) / 과잉(3배 이상) / 정상 */
export function calcStockStatus(current: number, safety: number): string {
  if (!(current > 0)) return '품절';
  if (current < safety) return '부족';
  if (safety > 0 && current >= safety * 3) return '과잉';
  return '정상';
}

/** 재고유지일(일) = (현재고 + 입고량) / 일사용량 — 엑셀 N열과 동일식. 계산불가 -1 */
export function calcStockDays(current: number, incoming: number, dailyBox: number): number {
  if (!(dailyBox > 0)) return -1;
  return (current + incoming) / dailyBox;
}

/** 유통기한 임박일수 (YYYY-MM-DD만 판정, 파싱불가 -1) */
export function expiryInDays(expiry: string, base: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec((expiry || '').trim());
  if (!m) return -1;
  const t = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`).getTime();
  const b = new Date(`${base}T00:00:00`).getTime();
  if (isNaN(t) || isNaN(b)) return -1;
  return Math.floor((t - b) / 86400000);
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
    itemName: '신동진 햅쌀 (1등급)', orderSupplier: '', orderDays: 0,
    spec: '20kg/포',
    unit: 'kg',
    inboundDate: 'D+1',
    expiryDate: '2027-04-30',
    orderDay: '월수금',
    dailyUsage: 6.5,
    packUnit: 20,
    boxQty: 167,
    pieceQty: 10,
    prevStock: 3200,
    inQty: 1000,
    outQty: 850,
    currentStock: 3350,
    safetyStock: 2000,
    status: '정상',
        stockDays: 669.23,
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
    itemName: '오뚜기 골드마요네즈', orderSupplier: '', orderDays: 0,
    spec: '3.2kg/통',
    unit: 'kg',
    inboundDate: 'D+2',
    expiryDate: '2027-02-28',
    orderDay: '월수금',
    dailyUsage: 3.2,
    packUnit: 10,
    boxQty: 45,
    pieceQty: 0,
    prevStock: 480,
    inQty: 120,
    outQty: 150,
    currentStock: 450,
    safetyStock: 300,
    status: '정상',
        stockDays: 178.13,
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
    itemName: '동원 참치통조림 살코기', orderSupplier: '', orderDays: 0,
    spec: '1.88kg/캔',
    unit: 'kg',
    inboundDate: 'D+2',
    expiryDate: '2027-10-15',
    orderDay: '화목토',
    dailyUsage: 1.8,
    packUnit: 6,
    boxQty: 13,
    pieceQty: 2,
    prevStock: 240,
    inQty: 100,
    outQty: 260,
    currentStock: 80,
    safetyStock: 150,
    status: '부족',
        stockDays: 100,
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
    itemName: '삼각김밥용 조미김', orderSupplier: '', orderDays: 0,
    spec: '1000매/속',
    unit: '매',
    inboundDate: 'D+2',
    expiryDate: '2027-06-30',
    orderDay: '월수금',
    dailyUsage: 12.5,
    packUnit: 1000,
    boxQty: 37,
    pieceQty: 0,
    prevStock: 45000,
    inQty: 20000,
    outQty: 28000,
    currentStock: 37000,
    safetyStock: 20000,
    status: '정상',
        stockDays: 4560,
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
    itemName: '삼각김밥 삼면포장필름', orderSupplier: '', orderDays: 0,
    spec: '5000m/roll',
    unit: 'roll',
    inboundDate: 'D+2',
    expiryDate: '2028-01-31',
    orderDay: '월수금',
    dailyUsage: 0.4,
    packUnit: 1,
    boxQty: 33,
    pieceQty: 0,
    prevStock: 35,
    inQty: 10,
    outQty: 12,
    currentStock: 33,
    safetyStock: 20,
    status: '정상',
        stockDays: 107.5,
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
    itemName: '11찬도시락 2단 트레이', orderSupplier: '', orderDays: 0,
    spec: '400ea/box',
    unit: 'ea',
    inboundDate: 'D+2',
    expiryDate: '2028-06-30',
    orderDay: '월수금',
    dailyUsage: 2.1,
    packUnit: 400,
    boxQty: 3,
    pieceQty: 200,
    prevStock: 2800,
    inQty: 0,
    outQty: 1400,
    currentStock: 1400,
    safetyStock: 2000,
    status: '부족',
        stockDays: 666.67,
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
    itemName: '국내산 돈육 전지 (슬라이스)', orderSupplier: '', orderDays: 0,
    spec: '10kg/box',
    unit: 'kg',
    inboundDate: 'D+1',
    expiryDate: '2026-11-20',
    orderDay: '화목토',
    dailyUsage: 8.2,
    packUnit: 10,
    boxQty: 93,
    pieceQty: 0,
    prevStock: 850,
    inQty: 500,
    outQty: 420,
    currentStock: 930,
    safetyStock: 500,
    status: '정상',
        stockDays: 174.39,
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
    itemName: 'CJ 델리햄 슬라이스', orderSupplier: '', orderDays: 0,
    spec: '1kg/pack',
    unit: 'kg',
    inboundDate: 'D+1',
    expiryDate: '2026-11-25',
    orderDay: '화목토',
    dailyUsage: 4.4,
    packUnit: 10,
    boxQty: 6,
    pieceQty: 0,
    prevStock: 180,
    inQty: 100,
    outQty: 220,
    currentStock: 60,
    safetyStock: 120,
    status: '부족',
        stockDays: 36.36,
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
    itemName: '세척 당근채 (신선편의)', orderSupplier: '', orderDays: 0,
    spec: '5kg/bag',
    unit: 'kg',
    inboundDate: 'D+1',
    expiryDate: '2026-11-02',
    orderDay: '화목토',
    dailyUsage: 5.1,
    packUnit: 5,
    boxQty: 36,
    pieceQty: 0,
    prevStock: 210,
    inQty: 150,
    outQty: 180,
    currentStock: 180,
    safetyStock: 100,
    status: '정상',
        stockDays: 64.71,
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
    itemName: '양상추 (탈수완료)', orderSupplier: '', orderDays: 0,
    spec: '5kg/bag',
    unit: 'kg',
    inboundDate: 'D+1',
    expiryDate: '2026-11-02',
    orderDay: '화목토',
    dailyUsage: 3.8,
    packUnit: 5,
    boxQty: 10,
    pieceQty: 0,
    prevStock: 90,
    inQty: 80,
    outQty: 120,
    currentStock: 50,
    safetyStock: 60,
    status: '부족',
        stockDays: 34.21,
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
    itemName: '숯불바비큐 패티 (80g)', orderSupplier: '', orderDays: 0,
    spec: '8kg/box',
    unit: 'kg',
    inboundDate: 'D+2',
    expiryDate: '2027-10-10',
    orderDay: '월수금',
    dailyUsage: 6.3,
    packUnit: 8,
    boxQty: 80,
    pieceQty: 0,
    prevStock: 620,
    inQty: 300,
    outQty: 280,
    currentStock: 640,
    safetyStock: 400,
    status: '정상',
        stockDays: 149.21,
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
    itemName: '케이준 치킨텐더 (가공)', orderSupplier: '', orderDays: 0,
    spec: '5kg/box',
    unit: 'kg',
    inboundDate: 'D+2',
    expiryDate: '2027-09-30',
    orderDay: '월수금',
    dailyUsage: 2.7,
    packUnit: 5,
    boxQty: 52,
    pieceQty: 0,
    prevStock: 410,
    inQty: 0,
    outQty: 150,
    currentStock: 260,
    safetyStock: 300,
    status: '부족',
        stockDays: 96.3,
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
    itemName: '참치마요삼각김밥', orderSupplier: '', orderDays: 0,
    spec: '110g',
    unit: 'ea',
    inboundDate: 'D+1',
    expiryDate: '2026-11-01',
    orderDay: '매일',
    dailyUsage: 120,
    packUnit: 1,
    boxQty: 1800,
    pieceQty: 0,
    prevStock: 1200,
    inQty: 5400,
    outQty: 4800,
    currentStock: 1800,
    safetyStock: 800,
    status: '정상',
        stockDays: 60,
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
    itemName: '11가지찬도시락', orderSupplier: '', orderDays: 0,
    spec: '430g',
    unit: 'ea',
    inboundDate: 'D+1',
    expiryDate: '2026-11-01',
    orderDay: '매일',
    dailyUsage: 45,
    packUnit: 1,
    boxQty: 550,
    pieceQty: 0,
    prevStock: 450,
    inQty: 2200,
    outQty: 2100,
    currentStock: 550,
    safetyStock: 300,
    status: '정상',
        stockDays: 61.11,
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
  const [selectedSupplier, setSelectedSupplier] = useState('전체');
  const [selectedVendor, setSelectedVendor] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [selectedExpiry, setSelectedExpiry] = useState('전체');
  const [onlyShortage, setOnlyShortage] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [dirtyRowIds, setDirtyRowIds] = useState<Set<number>>(new Set());
  const [newRowIds, setNewRowIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [mergeInfo, setMergeInfo] = useState('');

  const loadStockData = () => {
    setMergeInfo('불러오는 중...');
    Promise.all([
      fetch('/api/inventory/stock').then((res) => res.json()),
      fetch('/api/gfs/order-sheet').then((res) => res.json()).catch(() => null),
    ])
      .then(([json, orderJson]) => {
        if (json.success && json.data && json.data.length > 0) {
          // 발주서 정본 맵 (품명 정규화 기준) — 엑셀 우선
          const orderByNorm = new Map<string, any>();
          if (orderJson?.success && Array.isArray(orderJson.data?.rows)) {
            orderJson.data.rows.forEach((r: any) => {
              const k = normName(r.name);
              if (k && !orderByNorm.has(k)) orderByNorm.set(k, r);
            });
          }
          let merged = 0;
          let added = 0;
          const loaded: StockItem[] = [];
          const seen = new Set<string>();
          json.data.forEach((inv: any, idx: number) => {
            const safety = inv.product?.safetyStockQty || 100;
            const price = inv.unitPrice || (inv.currentQty > 0 ? inv.stockAmount / inv.currentQty : 2000);
            const name = inv.productName || inv.product?.name || '';
            const norm = normName(name);
            seen.add(norm);
            // 엑셀 우선: 정본에 있으면 엑셀값으로 표시 (DB에만 있는 행은 그대로)
            const o = norm ? orderByNorm.get(norm) : undefined;
            const current = o && Number(o.currentStock) > 0 ? Number(o.currentStock) : inv.currentQty || 0;
            const pack = (o && Number(o.packUnit) > 0 ? Number(o.packUnit) : 0) || inv.product?.boxQty || 1;
            const box = Math.floor(current / pack);
            const piece = Math.round((current % pack) * 10) / 10;
            const uprice = o && Number(o.bagPrice) > 0 ? Number(o.bagPrice) : price;
            const dailyU = o ? Number(o.dailyUsage) || 0 : 0;
            if (o) merged += 1;
            loaded.push({
              id: inv.id || idx + 1,
              whName: inv.warehouse || '상온',
              vendor: inv.product?.partner?.name || inv.product?.partnerId || '',
              orderSupplier: o?.supplier || '',
              orderDays: o ? Number(o.days) || 0 : 0,
              itemCode: inv.productCode || inv.product?.productCode || '',
              itemType: inv.category || inv.product?.category || '원자재',
              category: inv.product?.kind || '원부자재',
              itemName: name,
              spec: inv.product?.spec || '',
              unit: inv.unit || inv.product?.unit || 'kg',
              inboundDate: inv.lastInDate ? String(inv.lastInDate).slice(5) : inv.product?.partner?.leadTime ? `D+${inv.product.partner.leadTime}` : 'D+2',
              expiryDate: inv.expiryDate || '',
              orderDay: inv.product?.partner?.orderDay || '',
                dailyUsage: dailyU,
                packUnit: pack,
                boxQty: box,
                pieceQty: piece,
                prevStock: current,
                inQty: o ? Number(o.incoming) || 0 : 0,
                outQty: 0,
                currentStock: current,
                safetyStock: safety,
                shortage: current - safety,
                status: calcStockStatus(current, safety),
                stockDays: calcStockDays(current, Number(o?.incoming) || 0, dailyU),
              unitPrice: uprice,
              totalAmount: current * uprice,
            });
          });
          // 엑셀에만 있는 품목은 신규행으로 추가 (저장 시 품목 자동생성)
          let tempId = -(Date.now() % 1000000) - 1;
          const freshIds = new Set<number>();
          if (orderByNorm.size > 0) {
            orderByNorm.forEach((o: any, norm: string) => {
              if (seen.has(norm) || !o.name) return;
              const pack = Number(o.packUnit) > 0 ? Number(o.packUnit) : 1;
              const current = Number(o.currentStock) || 0;
              const price = Number(o.bagPrice) || 0;
              const box = Math.floor(current / pack);
              const piece = Math.round((current % pack) * 10) / 10;
              const daily = Number(o.dailyUsage) || 0;
              const leadM = /D-(\d+)/.exec(o.supplier || '');
              const autoSafety = calcSafetyStock(daily, pack, leadM ? Math.max(1, parseInt(leadM[1], 10)) : 2);
              const row: StockItem = {
                id: tempId--,
                whName: o.warehouse || '상온',
                vendor: o.vendor || '',
                orderSupplier: o.supplier || '',
                orderDays: Number(o.days) || 0,
                itemCode: o.itemId || '',
                itemType: '원자재',
                category: '원부자재',
                itemName: o.name,
                spec: '',
                unit: 'box',
                inboundDate: '',
                expiryDate: '',
                orderDay: '',
                dailyUsage: daily,
                packUnit: pack,
                boxQty: box,
                pieceQty: piece,
                prevStock: current,
                inQty: Number(o.incoming) || 0,
                outQty: 0,
                currentStock: current,
                safetyStock: autoSafety,
                shortage: current - autoSafety,
                status: calcStockStatus(current, autoSafety),
                stockDays: calcStockDays(current, Number(o.incoming) || 0, daily),
                unitPrice: price,
                totalAmount: current * price,
              };
              loaded.push(row);
              freshIds.add(row.id);
              added += 1;
            });
          }
          setData(loaded);
          const dirty = new Set<number>(freshIds);
          setDirtyRowIds(dirty);
          setNewRowIds(freshIds);
          setMergeInfo(
            orderByNorm.size > 0
              ? `정본 병합: ${merged}건 반영 · 신규 ${added}건`
              : '정본 없음 (DB만 표시)'
          );
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

        // 박스/낱개/입수량 수정 시 현재고 연동 계산 (엑셀 수식: 박스×입수+낱개)
        if (columnKey === 'boxQty' || columnKey === 'pieceQty' || columnKey === 'packUnit') {
          const box = Number(columnKey === 'boxQty' ? newValue : updated.boxQty) || 0;
          const piece = Number(columnKey === 'pieceQty' ? newValue : updated.pieceQty) || 0;
          const pack = Number(columnKey === 'packUnit' ? newValue : updated.packUnit) || 0;
          updated.currentStock = box * pack + piece;
        }

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
        updated.status = calcStockStatus(currentStock, safetyStock);
        updated.stockDays = calcStockDays(currentStock, Number(updated.inQty) || 0, Number(updated.dailyUsage) || 0);
        updated.totalAmount = currentStock * unitPrice;

        return updated;
      })
    );
    setDirtyRowIds((prev) => new Set(prev).add(Number(rowId)));
  };

  // 일일 재고조사표 엑셀 업로드 → 표 자동채움 (5시트 정본 그대로)
  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      // 시트별 행 수집: R3 헤더, R4~ 데이터 (1거래처 2ID 3제품명 4입고일 5일사용량 7박스 8낱개 9현재고 10입수량 12봉단가)
      const byNorm = new Map<string, StockItem>();
      data.forEach((d) => {
        const k = normName(d.itemName);
        if (k && !byNorm.has(k)) byNorm.set(k, d);
      });
      const next = data.map((d) => ({ ...d }));
      const nextByNorm = new Map<string, StockItem>();
      next.forEach((d) => {
        const k = normName(d.itemName);
        if (k && !nextByNorm.has(k)) nextByNorm.set(k, d);
      });
      const dirtyIds = new Set<number>(dirtyRowIds);
      const freshIds = new Set<number>(newRowIds);
      let added = 0;
      let updated = 0;
      let same = 0;
      let autoFilled = 0;
      let tempId = -(Date.now() % 1000000) - 1;
      for (const sheet of AUDIT_SHEETS) {
        const ws = wb.Sheets[sheet];
        if (!ws) continue;
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
        for (let i = 4; i < rows.length; i++) {
          const r = rows[i];
          if (!r) continue;
          const name = String(r[3] ?? '').trim();
          if (name.length < 2) continue;
          const norm = normName(name);
          if (!norm) continue;
          const box = Number(r[7]) || 0;
          const piece = Number(r[8]) || 0;
          const pack = Number(r[10]) || 0;
          const current = Number(r[9]) || box * (pack || 0) + piece;
          const price = Number(r[12]) || 0;
          const vendor = String(r[1] ?? '').trim();
          const itemId = r[2] != null && String(r[2]).trim() !== '' ? String(r[2]).trim() : '';
          const inbound = String(r[4] ?? '').trim();
          const daily = Number(r[5]) || 0;
          const expiry = r[6] != null && String(r[6]).trim() !== '' ? String(r[6]).trim() : '';
          const exist = nextByNorm.get(norm);
          // 안전재고 자동계산 (신규·0인 것만, 기존 수기값 유지)
          const autoSafety = calcSafetyStock(daily, pack, parseLeadDays(inbound));
          if (exist) {
            const newSafety = (!exist.safetyStock || exist.safetyStock <= 0) && autoSafety > 0 ? autoSafety : exist.safetyStock;
            const changed =
              exist.whName !== sheet ||
              (vendor && exist.vendor !== vendor) ||
              exist.currentStock !== current ||
              (price > 0 && exist.unitPrice !== price) ||
              (expiry && exist.expiryDate !== expiry) ||
              (pack > 0 && exist.packUnit !== pack) ||
              newSafety !== exist.safetyStock;
            exist.whName = sheet;
            if (vendor) exist.vendor = vendor;
            if (!exist.itemCode && itemId) exist.itemCode = itemId;
            if (inbound) exist.inboundDate = inbound;
            if (daily) exist.dailyUsage = daily;
            if (expiry) exist.expiryDate = expiry;
            if (pack > 0) exist.packUnit = pack;
            exist.boxQty = box;
            exist.pieceQty = piece;
            exist.currentStock = current;
            if (price > 0) exist.unitPrice = price;
            exist.totalAmount = current * exist.unitPrice;
            exist.safetyStock = newSafety;
            exist.shortage = current - newSafety;
            exist.status = calcStockStatus(current, newSafety);
            exist.stockDays = calcStockDays(current, 0, exist.dailyUsage);
            if (changed) {
              updated += 1;
              if (autoSafety > 0) autoFilled += 1;
              dirtyIds.add(exist.id);
            } else {
              same += 1;
            }
          } else {
            const newSafety = autoSafety > 0 ? autoSafety : 0;
            if (autoSafety > 0) autoFilled += 1;
            const row: StockItem = {
              id: tempId--,
              whName: sheet,
              vendor,
              orderSupplier: '',
              orderDays: 0,
              itemCode: itemId,
              itemType: sheet === '부자재' ? '부자재' : '원자재',
              category: '원부자재',
              itemName: name,
              spec: '',
              unit: 'box',
              inboundDate: inbound,
              expiryDate: expiry,
              orderDay: '',
              dailyUsage: daily,
              packUnit: pack,
              boxQty: box,
              pieceQty: piece,
                prevStock: current,
                inQty: 0,
                outQty: 0,
                currentStock: current,
                safetyStock: newSafety,
                shortage: current - newSafety,
                status: calcStockStatus(current, newSafety),
                stockDays: calcStockDays(current, 0, daily),
                unitPrice: price,
                totalAmount: current * price,
              };
              next.push(row);
            nextByNorm.set(norm, row);
            freshIds.add(row.id);
            dirtyIds.add(row.id);
            added += 1;
          }
        }
      }
      setData(next);
      setDirtyRowIds(dirtyIds);
      setNewRowIds(freshIds);
      setTargetDate(new Date().toISOString().slice(0, 10));
      alert(`업로드 반영 완료: 신규 ${added}건 · 변경 ${updated}건 · 동일 ${same}건 · 안전재고 자동계산 ${autoFilled}건\n확인 후 저장(Ctrl+S)하세요. 신규는 저장 시 품목 자동생성됩니다.`);
    } catch (e: any) {
      alert('엑셀 파싱 실패: ' + (e.message || '알 수 없는 오류'));
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // 재고 직접 수정 내역 일괄 DB 저장 (신규행은 품목 자동생성 후 재고 생성)
  const handleSave = async () => {
    if (dirtyRowIds.size === 0) {
      alert('수정된 재고 내역이 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const dirty = data.filter((d) => dirtyRowIds.has(d.id));
      const existing = dirty.filter((d) => !newRowIds.has(d.id));
      const fresh = dirty.filter((d) => newRowIds.has(d.id));

      // 1) 신규행: 품목 자동생성(materialize) → 재고 생성(POST)
      if (fresh.length > 0) {
        const matRes = await fetch('/api/gfs/materialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: fresh.map((d) => ({
              name: d.itemName,
              boxes: 1,
              packUnit: d.packUnit,
              bagPrice: d.unitPrice,
              supplierHeader: d.vendor,
              safetyStock: d.safetyStock,
            })),
          }),
        });
        const matJson = await matRes.json();
        if (!matJson.success) {
          alert(`신규 품목 생성 실패: ${matJson.error || '알 수 없는 오류'}`);
          return;
        }
        const codeByNorm = new Map<string, string>();
        (matJson.data?.matched || []).forEach((m: any) => {
          if (m.productCode && m.productName) codeByNorm.set(normName(m.productName), m.productCode);
        });
        const createItems = fresh.map((d) => ({
          productCode: codeByNorm.get(normName(d.itemName)) || d.itemCode || undefined,
          productName: d.itemName,
          warehouse: d.whName,
          currentQty: d.currentStock,
          unitPrice: d.unitPrice,
          expiryDate: d.expiryDate,
          vendor: d.vendor,
          safetyStock: d.safetyStock,
        }));
        const postRes = await fetch('/api/inventory/stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: createItems }),
        });
        const postJson = await postRes.json();
        if (!postJson.success) {
          alert(`신규 재고 생성 실패: ${postJson.error || '알 수 없는 오류'}`);
          return;
        }
      }

      // 2) 기존행: PUT 일괄 갱신
      if (existing.length > 0) {
        const updates = existing.map((d) => ({
          id: d.id,
          warehouse: d.whName,
          currentQty: d.currentStock,
          unitPrice: d.unitPrice,
          stockAmount: d.totalAmount,
          safetyStock: d.safetyStock,
          expiryDate: d.expiryDate,
        }));

        const res = await fetch('/api/inventory/stock', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates }),
        });

        const json = await res.json();
        if (!json.success) {
          alert(`저장 실패: ${json.error || '알 수 없는 오류'}`);
          return;
        }
      }

      setDirtyRowIds(new Set());
      setNewRowIds(new Set());
      alert(`저장 완료: 신규 ${fresh.length}건 · 수정 ${existing.length}건`);
      loadStockData();
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
  const suppliers = useMemo(() => {
    const s = new Set<string>();
    data.forEach((d) => { if (d.orderSupplier) s.add(d.orderSupplier); });
    return [...s].sort((a, b) => a.localeCompare(b, 'ko'));
  }, [data]);

  const vendors = useMemo(() => {
    const s = new Set<string>();
    data.forEach((d) => { if (d.vendor) s.add(d.vendor); });
    return [...s].sort((a, b) => a.localeCompare(b, 'ko'));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedWh !== '전체' && item.whName !== selectedWh) return false;
      if (selectedType !== '전체' && item.itemType !== selectedType) return false;
      if (selectedSupplier !== '전체' && item.orderSupplier !== selectedSupplier) return false;
      if (selectedVendor !== '전체' && item.vendor !== selectedVendor) return false;
      if (selectedStatus !== '전체' && item.status !== selectedStatus) return false;
      if (selectedExpiry !== '전체') {
        const dd = expiryInDays(item.expiryDate, targetDate);
        if (dd < 0) return false;
        if (selectedExpiry === '만료' && dd >= 0) return false;
        if (selectedExpiry === 'D-7' && !(dd >= 0 && dd <= 7)) return false;
        if (selectedExpiry === 'D-30' && !(dd >= 0 && dd <= 30)) return false;
      }
      if (onlyShortage && item.shortage >= 0) return false;
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        const matchName = item.itemName.toLowerCase().includes(kw);
        const matchCode = item.itemCode.toLowerCase().includes(kw);
        const matchCat = item.category.toLowerCase().includes(kw);
        const matchVendor = (item.vendor || '').toLowerCase().includes(kw);
        const matchSupplier = (item.orderSupplier || '').toLowerCase().includes(kw);
        if (!matchName && !matchCode && !matchCat && !matchVendor && !matchSupplier) return false;
      }
      return true;
    });
  }, [data, selectedWh, selectedType, selectedSupplier, selectedVendor, selectedStatus, selectedExpiry, targetDate, onlyShortage, keyword]);

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
      key: 'orderSupplier',
      label: '발주처',
      width: '170px',
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
      key: 'inboundDate',
      label: '입고일',
      width: '70px',
      align: 'center',
      editable: false,
    },
    {
      key: 'dailyUsage',
      label: '일사용량',
      width: '85px',
      align: 'right',
      format: 'number',
      editable: false,
    },
    {
      key: 'expiryDate',
      label: '유통기한',
      width: '95px',
      align: 'center',
      format: 'date',
      editable: true,
    },
    {
      key: 'packUnit',
      label: '입수량',
      width: '70px',
      align: 'right',
      format: 'number',
      editable: false,
    },
    {
      key: 'boxQty',
      label: '박스',
      width: '75px',
      align: 'right',
      format: 'number',
      editable: true,
    },
    {
      key: 'pieceQty',
      label: '낱개',
      width: '75px',
      align: 'right',
      format: 'number',
      editable: true,
    },
    {
      key: 'orderDay',
      label: '발주일',
      width: '80px',
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
      key: 'stockDays',
      label: '재고유지일',
      width: '85px',
      align: 'right',
      sortable: true,
      editable: false,
      render: (v, row) => (
        <span className={`font-mono ${Number(row.dailyUsage) > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
          {Number(row.dailyUsage) > 0 && Number(v) >= 0 ? `${Number(v).toFixed(2)}일` : '-'}
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
      key: 'status',
      label: '상태',
      width: '65px',
      align: 'center',
      sortable: true,
      filterable: true,
      editable: false,
      render: (v) => {
        const s = String(v || '정상');
        const cls =
          s === '품절'
            ? 'bg-gray-800 text-white border-gray-800'
            : s === '부족'
            ? 'bg-red-100 text-red-700 border-red-300'
            : s === '과잉'
            ? 'bg-amber-100 text-amber-800 border-amber-300'
            : 'bg-emerald-50 text-emerald-700 border-emerald-300';
        return (
          <span className={`inline-block px-1.5 py-0.2 text-[11px] font-bold border rounded ${cls}`}>
            {s}
          </span>
        );
      },
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
            key: 'upload',
            label: isUploading ? '업로드 중...' : '재고조사표 업로드',
            icon: 'upload',
            onClick: () => fileRef.current?.click(),
          },
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
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadFile(f);
        }}
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

          {/* Supplier (발주처) */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">발주처</span>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px] max-w-[180px]"
            >
              <option value="전체">전체</option>
              {suppliers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor (제조사) */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">거래처</span>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px] max-w-[160px]"
            >
              <option value="전체">전체</option>
              {vendors.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">재고상태</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px]"
            >
              {['전체', '정상', '부족', '과잉', '품절'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">유통기한</span>
            <select
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px]"
            >
              {['전체', '만료', 'D-7', 'D-30'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Search keyword */}
          <div className="flex items-center gap-1.5 ml-2">
            <div className="relative">
              <input
                type="text"
                placeholder="품명/품번/품종/거래처/발주처 검색"
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
            {mergeInfo && <span className="ml-2 text-[11px] font-medium text-emerald-700">· {mergeInfo}</span>}
          </span>
          <button
            onClick={() => {
              setKeyword('');
              setSelectedWh('전체');
              setSelectedType('전체');
              setSelectedSupplier('전체');
              setSelectedVendor('전체');
              setSelectedStatus('전체');
              setSelectedExpiry('전체');
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

