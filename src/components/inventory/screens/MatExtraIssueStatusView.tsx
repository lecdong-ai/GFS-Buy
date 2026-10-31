'use client';

import React, { useState, useEffect } from 'react';
import { InventoryActionBar } from '../common/InventoryActionBar';
import { InventoryDataGrid, InventoryGridColumnDef } from '../common/InventoryDataGrid';
import { INVENTORY_GYE_LIST, InventoryGyeItem } from '../data/inventoryMasterData';
import { Calendar, RotateCw } from 'lucide-react';

interface ExtraIssueDetailRow {
  id: number;
  gyeId: string;
  issueDate: string;
  category: string;
  partName: string;
  partSpec: string;
  unit: string;
  qty: number;
  remark: string;
}

const SAMPLE_EXTRA_ISSUES: ExtraIssueDetailRow[] = [
  // 성형장(김밥)
  { id: 1, gyeId: 'GFS005', issueDate: '2026-10-30', category: '원재료', partName: '가공 참치플레이크(오일)', partSpec: '1.8kg*6캔', unit: 'box', qty: 3, remark: '김밥 추가주문 불출' },
  { id: 2, gyeId: 'GFS005', issueDate: '2026-10-30', category: '부재료', partName: '김밥 포장필름(GS용)', partSpec: '2000매/롤', unit: '롤', qty: 2, remark: '롤 교체 파손분 보충' },
  // 성형장(삼각김밥)
  { id: 3, gyeId: 'GFS007', issueDate: '2026-10-30', category: '원재료', partName: '[냉장]전주비빔 소스토핑', partSpec: '10kg/통', unit: 'kg', qty: 20, remark: '야간 긴급 발주 대응' },
  { id: 4, gyeId: 'GFS007', issueDate: '2026-10-30', category: '부재료', partName: '삼각김밥 포장필름(이지컷)', partSpec: '1000ea/롤', unit: '롤', qty: 5, remark: '' },
  // 성형장(도시락)
  { id: 5, gyeId: 'GFS004', issueDate: '2026-10-30', category: '원재료', partName: '[냉장]제육불고기 토핑', partSpec: '5kg*3ea', unit: 'kg', qty: 15, remark: '추가생산 요청' },
  { id: 6, gyeId: 'GFS004', issueDate: '2026-10-30', category: '부재료', partName: '두레)ET-30 용기', partSpec: '50ea*2줄', unit: 'box', qty: 4, remark: '' },
  // 조리실(볶음)
  { id: 7, gyeId: 'GFS552', issueDate: '2026-10-30', category: '원재료', partName: '순창고추장 조미액', partSpec: '10kg*1통', unit: 'kg', qty: 30, remark: '양념 추가 배합' },
  // 취반(미반류)
  { id: 8, gyeId: 'GFS152', issueDate: '2026-10-30', category: '원재료', partName: '국내산 경기미 햅쌀', partSpec: '20kg/포', unit: '포', qty: 10, remark: '밥솥 2회 추가 가동' },
];

export const MatExtraIssueStatusView: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-10-30');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [periodType, setPeriodType] = useState('일간');
  const [includeCancel, setIncludeCancel] = useState(false);
  const [selectedGyeId, setSelectedGyeId] = useState<string>('GFS005');
  const [issueList, setIssueList] = useState<ExtraIssueDetailRow[]>(SAMPLE_EXTRA_ISSUES);

  useEffect(() => {
    fetch(`/api/inventory/extra-issue`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const mapped: ExtraIssueDetailRow[] = json.data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            gyeId: item.gyeId || 'GFS005',
            issueDate: item.issueDate || '2026-10-30',
            category: item.category || '원재료',
            partName: item.productName || item.productCode || '자재',
            partSpec: '표준규격',
            unit: item.unit || 'kg',
            qty: Number(item.issueQty) || 0,
            remark: item.reason || item.remark || '',
          }));
          setIssueList(mapped);
        }
      })
      .catch((err) => console.error('Fetch extra issue list failed:', err));
  }, []);

  const selectedGye = INVENTORY_GYE_LIST.find((g) => g.id === selectedGyeId) || INVENTORY_GYE_LIST[0];

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

  const filteredDetails = issueList.filter((item) => item.gyeId === selectedGyeId);
  const displayDetails = filteredDetails.length > 0 ? filteredDetails : [
    { id: 991, gyeId: selectedGyeId, issueDate: startDate, category: '원부재료', partName: `${selectedGye.name} 추가불출품목`, partSpec: '표준규격', unit: 'ea', qty: 0, remark: '불출내역 없음' },
  ];

  const LEFT_COLUMNS: InventoryGridColumnDef[] = [
    { key: 'name', label: '계명칭', width: '160px', align: 'left', filterable: false },
  ];

  const RIGHT_COLUMNS: InventoryGridColumnDef[] = [
    { key: 'issueDate', label: '불출일', width: '90px', align: 'center', format: 'date' },
    { key: 'category', label: '구분', width: '70px', align: 'center' },
    { key: 'partName', minWidth: '260px', label: '파트명', align: 'left' },
    { key: 'partSpec', label: '파트규격', width: '120px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    { key: 'qty', label: '수량', width: '80px', align: 'right', format: 'number' },
    { key: 'remark', label: '비고', width: '180px', align: 'left' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <InventoryActionBar
        title="자재추가불출현황(GSR)"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('자재추가불출 내역이 조회되었습니다.') },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('조회 조건이 초기화되었습니다.') },
        ]}
        helpContent="정규 작업지시 외에 긴급 추가생산이나 파손 보충으로 창고에서 추가 불출된 원부자재 내역을 공정별로 조회합니다."
      />

      {/* 2. 조회 조건바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              기간:
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

          <label className="flex items-center gap-1 pl-3 border-l border-gray-300 text-[11px] text-gray-700 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={includeCancel}
              onChange={(e) => setIncludeCancel(e.target.checked)}
              className="rounded accent-blue-600"
            />
            주문취소포함
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert('새로고침')}
            className="p-1 text-gray-600 hover:text-blue-700 hover:bg-gray-200 rounded border border-gray-300 bg-white cursor-pointer shadow-2xs"
            title="새로고침"
          >
            <RotateCw size={13} />
          </button>
        </div>
      </div>

      {/* 3. 좌우 2분할 레이아웃 (좌측 실 약 25% : 우측 내역 약 75%) */}
      <div className="flex-1 flex min-h-0 p-2 gap-2">
        {/* 좌측: 실(46개 공정 목록) */}
        <div className="w-[260px] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs shrink-0">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <span className="font-bold text-gray-800">실</span>
            <span className="text-[11px] font-mono text-gray-600 font-bold bg-white px-1.5 py-0.2 rounded border border-gray-300">
              46
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <InventoryDataGrid
              columns={LEFT_COLUMNS}
              data={INVENTORY_GYE_LIST}
              selectedRowId={selectedGye.no}
              onRowClick={(row) => setSelectedGyeId(row.id)}
              summaryRow={false}
            />
          </div>
        </div>

        {/* 우측: 내역 그리드 */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">내역 ▶</span>
              <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.2 rounded border border-blue-300 font-semibold">
                선택 공정: {selectedGye.name}
              </span>
            </div>
            <span className="text-[11px] text-gray-600 font-medium">
              불출건수: <span className="font-bold text-blue-700">{displayDetails.length}</span> 건
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <InventoryDataGrid
              columns={RIGHT_COLUMNS}
              data={displayDetails}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

