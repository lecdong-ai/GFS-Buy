'use client';

import React, { useState, useEffect } from 'react';
import { InventoryActionBar } from '../common/InventoryActionBar';
import { InventoryDataGrid, InventoryGridColumnDef } from '../common/InventoryDataGrid';
import { VENDOR_OPTIONS } from '../data/inventoryMasterData';
import { Calendar } from 'lucide-react';

interface CustomerStockRow {
  id: number;
  itemCode: string;
  category: string;
  variety: string;
  itemName: string;
  spec: string;
  unit: string;
  currentStock: number;
}

const SAMPLE_CUSTOMER_STOCK: CustomerStockRow[] = [
  { id: 1, itemCode: 'RM-RICE-01', category: '원재료', variety: '곡류', itemName: '국내산 경기미 햅쌀', spec: '20kg/포', unit: '포', currentStock: 430 },
  { id: 2, itemCode: 'RM-TUNA-01', category: '원재료', variety: '수산가공', itemName: '가공 참치플레이크(오일)', spec: '1.8kg*6캔', unit: 'box', currentStock: 35 },
  { id: 3, itemCode: 'RM-PORK-01', category: '원재료', variety: '육가공', itemName: '[냉장]제육불고기 토핑', spec: '5kg*3ea', unit: 'kg', currentStock: 70 },
  { id: 4, itemCode: 'RM-MAYO-01', category: '원재료', variety: '소스/유지', itemName: '골드마요네즈 3.2kg', spec: '3.2kg*4통', unit: 'box', currentStock: 45 },
  { id: 5, itemCode: 'RM-CHEESE-01', category: '원재료', variety: '유제품', itemName: '슬라이스치즈(고소한맛)', spec: '1kg*10팩', unit: 'box', currentStock: 20 },
  { id: 6, itemCode: 'SM-BOX-01', category: '부재료', variety: '용기류', itemName: '두레)ET-30 용기', spec: '50ea*2줄', unit: 'box', currentStock: 35 },
  { id: 7, itemCode: 'SM-GIM-01', category: '부재료', variety: '포장류', itemName: '도시락용 조미김 포션', spec: '2g*500봉', unit: 'box', currentStock: 7 },
];

export const CustomerStockStatusView: React.FC = () => {
  const [baseDate, setBaseDate] = useState('2026년 10월 30일 금요일');
  const [varietyFilter, setVarietyFilter] = useState('ALL');
  const [vendorFilter, setVendorFilter] = useState('[네트웍스]광주식품');
  const [stockData, setStockData] = useState<CustomerStockRow[]>(SAMPLE_CUSTOMER_STOCK);

  useEffect(() => {
    fetch('/api/inventory/stock')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const mapped: CustomerStockRow[] = json.data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            itemCode: item.productCode || `RM-${idx + 1}`,
            category: item.product?.category || '원재료',
            variety: '일반',
            itemName: item.product?.name || item.productCode || '자재',
            spec: item.product?.spec || '표준규격',
            unit: item.product?.unit || 'ea',
            currentStock: Number(item.qty) || 0,
          }));
          setStockData(mapped);
        }
      })
      .catch((err) => console.error('Fetch customer stock failed:', err));
  }, []);

  const filteredData = stockData.filter((item) => {
    if (varietyFilter !== 'ALL' && item.variety !== varietyFilter) return false;
    return true;
  });

  const COLUMNS: InventoryGridColumnDef[] = [
    { key: 'itemCode', label: '품번', width: '100px', align: 'center' },
    { key: 'category', label: '구분', width: '70px', align: 'center' },
    { key: 'variety', label: '품종', width: '90px', align: 'center' },
    { key: 'itemName', minWidth: '260px', label: '품명', align: 'left' },
    { key: 'spec', label: '규격', width: '110px', align: 'center' },
    { key: 'unit', label: '단위', width: '55px', align: 'center' },
    { key: 'currentStock', label: '현재고', width: '95px', align: 'right', format: 'number' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <InventoryActionBar
        title="거래처재고현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('거래처 재고가 조회되었습니다.') },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('조회 조건이 초기화되었습니다.') },
        ]}
        helpContent="외주 임가공처 또는 공급 거래처별로 보관 중인 위탁 사급 자재의 현재고를 조회합니다."
      />

      {/* 2. 조회 조건바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              기준일자:
            </span>
            <input
              type="text"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[185px] text-center"
            />
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">품종:</span>
            <select
              value={varietyFilter}
              onChange={(e) => setVarietyFilter(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] rounded-xs shadow-2xs focus:outline-blue-500"
            >
              <option value="ALL">ALL (전체)</option>
              <option value="곡류">곡류</option>
              <option value="수산가공">수산가공</option>
              <option value="육가공">육가공</option>
              <option value="소스/유지">소스/유지</option>
              <option value="용기류">용기류</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">거래처:</span>
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] rounded-xs shadow-2xs focus:outline-blue-500 font-medium"
            >
              {VENDOR_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
            데이터수: <span className="text-blue-700 font-bold">{filteredData.length}</span>
          </span>
        </div>
      </div>

      {/* 3. 단일 그리드 */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full flex flex-col bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="flex-1 min-h-0">
            <InventoryDataGrid
              columns={COLUMNS}
              data={filteredData}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

