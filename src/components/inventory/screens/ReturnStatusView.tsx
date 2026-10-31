'use client';

import React, { useState, useEffect } from 'react';
import { InventoryActionBar } from '../common/InventoryActionBar';
import { InventoryDataGrid, InventoryGridColumnDef } from '../common/InventoryDataGrid';
import { erpConfirm } from '@/context/ConfirmContext';
import { VENDOR_OPTIONS } from '../data/inventoryMasterData';
import { Calendar } from 'lucide-react';

interface ReturnStatusRow {
  id: number;
  returnDate: string;
  vendorName: string;
  variety: string;
  category: string;
  itemName: string;
  spec: string;
  unit: string;
  returnQty: number;
  unitPrice: number;
  returnAmount: number;
  returnReason: string;
  remark: string;
}

const SAMPLE_RETURN_STATUS: ReturnStatusRow[] = [
  { id: 1, returnDate: '2026-10-30', vendorName: '[네트웍스]광주식품', variety: '수산가공', category: '원재료', itemName: '가공 참치플레이크(오일)', spec: '1.8kg*6캔', unit: 'box', returnQty: 2, unitPrice: 68000, returnAmount: 136000, returnReason: '캔 파손 및 오일 누유', remark: '반품 완료' },
  { id: 2, returnDate: '2026-10-30', vendorName: '[네트웍스]광주식품', variety: '채소류', category: '원재료', itemName: '[냉장]대파(세척절단)', spec: '10kg/상자', unit: 'kg', returnQty: 20, unitPrice: 4200, returnAmount: 84000, returnReason: '신선도 저하', remark: '교환 출고 완료' },
  { id: 3, returnDate: '2026-10-29', vendorName: '두레', variety: '용기류', category: '부재료', itemName: '두레)ET-30 용기', spec: '50ea*2줄', unit: 'box', returnQty: 5, unitPrice: 42000, returnAmount: 210000, returnReason: '규격 오배송', remark: '반품 승인' },
  { id: 4, returnDate: '2026-10-28', vendorName: '사조오양', variety: '어육가공', category: '원재료', itemName: '[냉장]다진맛살 10kg', spec: '10kg*2ea', unit: 'box', returnQty: 3, unitPrice: 52000, returnAmount: 156000, returnReason: '유통기한 임박 입고', remark: '반품 환불 처리' },
];

export const ReturnStatusView: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-10-30');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [periodType, setPeriodType] = useState('일간');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [dataList, setDataList] = useState<ReturnStatusRow[]>(SAMPLE_RETURN_STATUS);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(1);

  useEffect(() => {
    fetch('/api/inventory/return')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ReturnStatusRow[] = res.data.map((r: any, idx: number) => ({
            id: r.id || idx + 1,
            returnDate: r.returnDate,
            vendorName: r.partnerName || '공급사',
            variety: '원부자재',
            category: '원재료',
            itemName: r.productName,
            spec: '규격',
            unit: r.unit,
            returnQty: r.returnQty,
            unitPrice: r.unitPrice,
            returnAmount: r.amount,
            returnReason: r.reason,
            remark: r.remark || '처리완료',
          }));
          setDataList(mapped);
          if (mapped.length > 0) setSelectedRowId(mapped[0].id);
        }
      })
      .catch((err) => console.error('Failed to load returns from DB:', err));
  }, []);

  const handleShiftDay = (direction: -1 | 1) => {
    const cur = new Date(startDate);
    cur.setDate(cur.getDate() + direction);
    const newStr = cur.toISOString().split('T')[0];
    setStartDate(newStr);
    setEndDate(newStr);
  };

  const handlePeriodChange = (val: string) => {
    setPeriodType(val);
    const cur = new Date(startDate);
    if (val === '일간') {
      setEndDate(startDate);
    } else if (val === '주간') {
      const end = new Date(cur);
      end.setDate(end.getDate() + 6);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (val === '월간') {
      const end = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const handleDelete = async () => {
    if (!selectedRowId) {
      alert('삭제할 반품 내역을 선택해주세요.');
      return;
    }
    const ok = await erpConfirm('선택한 반품 항목을 삭제하시겠습니까?', '반품 항목 삭제 확인', 'danger');
    if (ok) {
      setDataList((prev) => prev.filter((item) => item.id !== selectedRowId));
      setSelectedRowId(null);
      alert('반품 내역이 삭제되었습니다.');
    }
  };

  const filteredList = dataList.filter((item) => {
    if (vendorFilter !== 'ALL' && item.vendorName !== vendorFilter) return false;
    return true;
  });

  const COLUMNS: InventoryGridColumnDef[] = [
    { key: 'returnDate', label: '반품일', width: '90px', align: 'center', format: 'date' },
    { key: 'vendorName', label: '거래처명', width: '130px', align: 'left' },
    { key: 'variety', label: '품종', width: '80px', align: 'center' },
    { key: 'category', label: '구분', width: '65px', align: 'center' },
    { key: 'itemName', minWidth: '260px', label: '품명', align: 'left' },
    { key: 'spec', label: '규격', width: '95px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    { key: 'returnQty', label: '반품수량', width: '75px', align: 'right', format: 'number' },
    { key: 'unitPrice', label: '단가', width: '85px', align: 'right', format: 'currency' },
    { key: 'returnAmount', label: '반품금액', width: '105px', align: 'right', format: 'currency' },
    { key: 'returnReason', label: '반품사유', width: '160px', align: 'left' },
    { key: 'remark', label: '비고', width: '120px', align: 'left' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <InventoryActionBar
        title="반품현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('반품현황이 조회되었습니다.') },
          { key: 'save', label: '저장', icon: 'save', onClick: () => alert('반품 처리 상태가 저장되었습니다.') },
          { key: 'delete', label: '삭제', icon: 'delete', onClick: handleDelete },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('조회 조건이 초기화되었습니다.') },
        ]}
        helpContent="기간별 및 거래처별 등록된 반품 진행 상태, 반품 사유, 반품 수량 및 금액을 조회하고 관리합니다."
      />

      {/* 2. 조회 조건바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              반품일자:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-gray-400 px-1.5 py-0.5 text-[12px] font-mono rounded-xs shadow-2xs"
            />
            <span className="text-gray-500">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-gray-400 px-1.5 py-0.5 text-[12px] font-mono rounded-xs shadow-2xs"
            />
            <div className="flex items-center ml-0.5">
              <button
                type="button"
                onClick={() => handleShiftDay(-1)}
                className="px-1.5 py-0.5 bg-[#4a72b2] hover:bg-[#3b5e96] text-white rounded-l-xs text-[11px] font-bold"
                title="이전일"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={() => handleShiftDay(1)}
                className="px-1.5 py-0.5 bg-[#4a72b2] hover:bg-[#3b5e96] text-white rounded-r-xs text-[11px] font-bold border-l border-blue-400"
                title="다음일"
              >
                &gt;
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-gray-300 text-[11px]">
            {['일간', '주간', '월간', '분기', '반기', '연간'].map((mode) => (
              <label key={mode} className="flex items-center gap-1 cursor-pointer font-medium text-gray-800">
                <input
                  type="radio"
                  name="periodType"
                  value={mode}
                  checked={periodType === mode}
                  onChange={() => handlePeriodChange(mode)}
                  className="accent-blue-600 cursor-pointer"
                />
                {mode}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">매입처:</span>
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
            데이터수: <span className="text-blue-700 font-bold">{filteredList.length}</span> 건
          </span>
        </div>
      </div>

      {/* 3. 단일 그리드 */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full flex flex-col bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="flex-1 min-h-0">
            <InventoryDataGrid
              columns={COLUMNS}
              data={filteredList}
              selectedRowId={selectedRowId}
              onRowClick={(row) => setSelectedRowId(row.id)}
              summaryValues={{
                returnAmount: 0,
              }}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

