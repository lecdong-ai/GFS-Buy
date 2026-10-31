'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { SalesFilterBar } from '@/components/sales/common/SalesFilterBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '../common/PurchaseDataGrid';
import { Plus, Trash2, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { exportGridToExcel } from '@/lib/excelExport';
import { erpConfirm } from '@/context/ConfirmContext';

interface OrderMasterRow {
  id: number;
  checked: boolean;
  orderNo: string;
  orderDate: string;
  status: '미입고' | '부분입고' | '입고완료' | '발주취소';
  supplier: string;
  itemCount: number;
  orderAmt: number;
  receivedAmt: number;
  unreceivedAmt: number;
  expectedDate: string;
  manager: string;
  tel: string;
  remark: string;
}

interface OrderDetailRow {
  id: number;
  itemCode: string;
  type: string;
  name: string;
  spec: string;
  unit: string;
  orderQty: number;
  unitPrice: number;
  orderAmt: number;
  receivedQty: number;
  unreceivedQty: number;
  expectedDate: string;
  warehouse: string;
  remark: string;
}

const INITIAL_MASTER_DATA: OrderMasterRow[] = [
  { id: 1, checked: false, orderNo: 'pc25345', orderDate: '2026-10-30', status: '미입고', supplier: '평화영농조합', itemCount: 1, orderAmt: 27000000, receivedAmt: 0, unreceivedAmt: 27000000, expectedDate: '2026-10-31', manager: '이창승 상무', tel: '010-3565-92XX', remark: '당일 도정미 직납' },
  { id: 2, checked: false, orderNo: 'pc25344', orderDate: '2026-10-30', status: '미입고', supplier: '사조오양', itemCount: 1, orderAmt: 84000, receivedAmt: 0, unreceivedAmt: 84000, expectedDate: '2026-10-31', manager: '김영하 대리', tel: '010-4236-04XX', remark: '시제품 연구용' },
  { id: 3, checked: false, orderNo: 'pc25343', orderDate: '2026-10-30', status: '부분입고', supplier: '이우유통', itemCount: 2, orderAmt: 4414600, receivedAmt: 2280000, unreceivedAmt: 2134600, expectedDate: '2026-10-31', manager: '구동서 부장', tel: '010-4717-25XX', remark: '마요네즈 선입고 완료' },
  { id: 4, checked: false, orderNo: 'pc25342', orderDate: '2026-10-30', status: '입고완료', supplier: '야미푸드', itemCount: 1, orderAmt: 153000, receivedAmt: 153000, unreceivedAmt: 0, expectedDate: '2026-10-30', manager: '이하경 이사', tel: '010-5661-11XX', remark: '검수 통과 완료' },
  { id: 5, checked: false, orderNo: 'pc25341', orderDate: '2026-10-30', status: '미입고', supplier: '한성기업', itemCount: 2, orderAmt: 3980400, receivedAmt: 0, unreceivedAmt: 3980400, expectedDate: '2026-10-31', manager: '정재근 대리', tel: '010-7191-71XX', remark: '콜드체인 검수필' },
  { id: 6, checked: false, orderNo: 'pc25340', orderDate: '2026-10-30', status: '미입고', supplier: '한성기업', itemCount: 2, orderAmt: 4608600, receivedAmt: 0, unreceivedAmt: 4608600, expectedDate: '2026-10-31', manager: '정재근 대리', tel: '010-7191-71XX', remark: '크래미 및 맛살 2편' },
  { id: 7, checked: false, orderNo: 'pc25335', orderDate: '2026-10-29', status: '입고완료', supplier: '두레', itemCount: 3, orderAmt: 1850000, receivedAmt: 1850000, unreceivedAmt: 0, expectedDate: '2026-10-30', manager: '박선영 팀장', tel: '010-2345-67XX', remark: '용기류 입고' },
  { id: 8, checked: false, orderNo: 'pc25330', orderDate: '2026-10-29', status: '발주취소', supplier: '사조오양', itemCount: 1, orderAmt: 1360000, receivedAmt: 0, unreceivedAmt: 1360000, expectedDate: '2026-10-30', manager: '김영하 대리', tel: '010-4236-04XX', remark: '생산계획 변경 취소' },
];

const INITIAL_DETAILS: Record<number, OrderDetailRow[]> = {
  1: [
    { id: 101, itemCode: 'RM-RICE-01', type: '원재료', name: '국내산 경기미 백미(햅쌀)', spec: '20kg/포', unit: '포', orderQty: 500, unitPrice: 54000, orderAmt: 27000000, receivedQty: 0, unreceivedQty: 500, expectedDate: '2026-10-31', warehouse: '상온보관고', remark: '수분함량 15% 이하' },
  ],
  2: [
    { id: 201, itemCode: 'RM-TUNA-01', type: '원재료', name: '가공 참치플레이크(오일)', spec: '1.8kg*6캔', unit: 'box', orderQty: 1, unitPrice: 84000, orderAmt: 84000, receivedQty: 0, unreceivedQty: 1, expectedDate: '2026-10-31', warehouse: '상온보관고', remark: '샘플 발주' },
  ],
  3: [
    { id: 301, itemCode: 'RM-MAYO-01', type: '원재료', name: '골드마요네즈 3.2kg', spec: '3.2kg*4통', unit: 'box', orderQty: 60, unitPrice: 38000, orderAmt: 2280000, receivedQty: 60, unreceivedQty: 0, expectedDate: '2026-10-30', warehouse: '상온보관고', remark: '기입고 완료' },
    { id: 302, itemCode: 'RM-CHEESE-01', type: '원재료', name: '슬라이스치즈(고소한맛)', spec: '1kg*10팩', unit: 'box', orderQty: 30, unitPrice: 71153, orderAmt: 2134600, receivedQty: 0, unreceivedQty: 30, expectedDate: '2026-10-31', warehouse: '육류냉장고', remark: '배송중' },
  ],
  4: [
    { id: 401, itemCode: 'SM-GIM-01', type: '부재료', name: '도시락용 조미김 포션', spec: '2g*500봉', unit: 'box', orderQty: 3, unitPrice: 51000, orderAmt: 153000, receivedQty: 3, unreceivedQty: 0, expectedDate: '2026-10-30', warehouse: '부재료보관', remark: '검수 완료' },
  ],
  5: [
    { id: 501, itemCode: 'RM-CRAB-01', type: '원재료', name: '[냉장]다진맛살 10kg', spec: '10kg*2ea', unit: 'box', orderQty: 40, unitPrice: 52000, orderAmt: 2080000, receivedQty: 0, unreceivedQty: 40, expectedDate: '2026-10-31', warehouse: '육류냉장고', remark: '김밥용 원료' },
    { id: 502, itemCode: 'RM-GUNG-01', type: '원재료', name: '[냉동]궁채나물 1kg', spec: '1kg*10ea', unit: 'box', orderQty: 30, unitPrice: 63346, orderAmt: 1900400, receivedQty: 0, unreceivedQty: 30, expectedDate: '2026-10-31', warehouse: '냉동고', remark: '온도확인필' },
  ],
  6: [
    { id: 601, itemCode: 'RM-KIMC-01', type: '원재료', name: '[냉장]볶음김치 5kg', spec: '5kg*3ea', unit: 'box', orderQty: 80, unitPrice: 42000, orderAmt: 3360000, receivedQty: 0, unreceivedQty: 80, expectedDate: '2026-10-31', warehouse: '채소류냉장', remark: '제육도시락용' },
    { id: 602, itemCode: 'RM-BEEF-01', type: '원재료', name: '[냉동]우양지 슬라이스', spec: '2kg*5팩', unit: 'box', orderQty: 10, unitPrice: 124860, orderAmt: 1248600, receivedQty: 0, unreceivedQty: 10, expectedDate: '2026-10-31', warehouse: '냉동고', remark: '' },
  ],
  7: [
    { id: 701, itemCode: 'SM-BOX-01', type: '부재료', name: '두레)ET-30 용기', spec: '50ea*2줄', unit: 'box', orderQty: 20, unitPrice: 42000, orderAmt: 840000, receivedQty: 20, unreceivedQty: 0, expectedDate: '2026-10-30', warehouse: '부재료보관', remark: '' },
    { id: 702, itemCode: 'SM-CAP-01', type: '부재료', name: '두레)ET-30 뚜껑(PET)', spec: '100ea*1줄', unit: 'box', orderQty: 20, unitPrice: 35000, orderAmt: 700000, receivedQty: 20, unreceivedQty: 0, expectedDate: '2026-10-30', warehouse: '부재료보관', remark: '' },
    { id: 703, itemCode: 'SM-BAND-01', type: '부재료', name: '수축 밴드(GS삼각)', spec: '1000ea/롤', unit: '롤', orderQty: 10, unitPrice: 31000, orderAmt: 310000, receivedQty: 10, unreceivedQty: 0, expectedDate: '2026-10-30', warehouse: '부재료보관', remark: '' },
  ],
  8: [
    { id: 801, itemCode: 'RM-TUNA-02', type: '원재료', name: '가공 참치플레이크(오일)', spec: '1.8kg*6캔', unit: 'box', orderQty: 20, unitPrice: 68000, orderAmt: 1360000, receivedQty: 0, unreceivedQty: 20, expectedDate: '2026-10-30', warehouse: '상온보관고', remark: '계획 취소 건' },
  ],
};

const MASTER_COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'checked', label: '선택', width: '45px', align: 'center', format: 'checkbox' },
  { key: 'orderNo', label: '발주번호', width: '90px', align: 'center' },
  { key: 'orderDate', label: '발주일자', width: '90px', align: 'center', format: 'date' },
  {
    key: 'status',
    label: '발주상태',
    width: '85px',
    align: 'center',
    render: (val) => {
      let bg = 'bg-slate-100 text-slate-700 border-slate-300';
      if (val === '미입고') bg = 'bg-blue-50 text-blue-700 border-blue-300 font-bold';
      if (val === '부분입고') bg = 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
      if (val === '입고완료') bg = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      if (val === '발주취소') bg = 'bg-rose-50 text-rose-600 border-rose-300 font-bold';
      return (
        <span className={`inline-block px-1.5 py-0.5 text-[11px] rounded border ${bg}`}>
          {val}
        </span>
      );
    },
  },
  { key: 'supplier', label: '거래처', width: '130px', align: 'left' },
  { key: 'itemCount', label: '품목수', width: '60px', align: 'right', format: 'number' },
  { key: 'orderAmt', label: '발주금액(합계)', width: '120px', align: 'right', format: 'currency', highlight: true },
  { key: 'receivedAmt', label: '기입고금액', width: '110px', align: 'right', format: 'currency' },
  { key: 'unreceivedAmt', label: '미입고금액', width: '110px', align: 'right', format: 'currency' },
  { key: 'expectedDate', label: '입고예정일', width: '90px', align: 'center', format: 'date' },
  { key: 'manager', label: '담당자', width: '90px', align: 'center' },
  { key: 'tel', label: '연락처', width: '110px', align: 'center' },
  { key: 'remark', label: '비고', width: '140px', align: 'left' },
];

const DETAIL_COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'itemCode', label: '품목코드', width: '100px', align: 'center' },
  { key: 'type', label: '구분', width: '65px', align: 'center' },
  { key: 'name', label: '품명', width: '220px', align: 'left' },
  { key: 'spec', label: '규격', width: '100px', align: 'center' },
  { key: 'unit', label: '단위', width: '50px', align: 'center' },
  { key: 'orderQty', label: '발주수량', width: '85px', align: 'right', format: 'number' },
  { key: 'unitPrice', label: '발주단가', width: '85px', align: 'right', format: 'currency' },
  { key: 'orderAmt', label: '발주금액(합계)', width: '110px', align: 'right', format: 'currency' },
  { key: 'receivedQty', label: '기입고수량', width: '85px', align: 'right', format: 'number' },
  { key: 'unreceivedQty', label: '미입고수량', width: '85px', align: 'right', format: 'number' },
  { key: 'expectedDate', label: '납품예정일', width: '90px', align: 'center', format: 'date' },
  { key: 'warehouse', label: '보관창고', width: '95px', align: 'center' },
  { key: 'remark', label: '비고', width: '150px', align: 'left' },
];

export const OrderStatusEditView: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-10-29');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [supplierFilter, setSupplierFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');

  const [masterList, setMasterList] = useState<OrderMasterRow[]>(INITIAL_MASTER_DATA);
  const [selectedMasterId, setSelectedMasterId] = useState<number>(1);
  const [detailsMap, setDetailsMap] = useState<Record<number, OrderDetailRow[]>>(INITIAL_DETAILS);

  // DB에서 실제 발주 내역 로드
  useEffect(() => {
    fetch('/api/purchase/order')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const newMaster: OrderMasterRow[] = [];
          const newDetails: Record<number, OrderDetailRow[]> = {};

          res.data.forEach((po: any, idx: number) => {
            const masterId = po.id || idx + 1;
            const details = po.details || [];
            const receivedAmt = details.reduce((sum: number, d: any) => sum + (d.receivedQty * d.unitPrice), 0);
            const totalAmt = po.totalAmount || details.reduce((sum: number, d: any) => sum + d.amount, 0);

            newMaster.push({
              id: masterId,
              checked: false,
              orderNo: po.orderNo,
              orderDate: po.orderDate,
              status: (po.status as any) || '미입고',
              supplier: po.partnerName || po.partner?.name || '공급사',
              itemCount: details.length || 1,
              orderAmt: totalAmt,
              receivedAmt,
              unreceivedAmt: totalAmt - receivedAmt,
              expectedDate: po.deliveryDate || po.orderDate,
              manager: po.createdBy || '관리자',
              tel: po.partner?.tel || '010-0000-0000',
              remark: po.remark || '',
            });

            newDetails[masterId] = details.map((d: any, dIdx: number) => ({
              id: d.id || dIdx + 1,
              itemCode: d.productCode || `MAT-${d.productId}`,
              type: d.category || '원재료',
              name: d.productName || d.product?.name || '원료',
              spec: d.product?.spec || '-',
              unit: d.unit || 'ea',
              orderQty: d.orderQty || 0,
              unitPrice: d.unitPrice || 0,
              orderAmt: d.amount || 0,
              receivedQty: d.receivedQty || 0,
              unreceivedQty: d.remainQty || d.orderQty || 0,
              expectedDate: po.deliveryDate || po.orderDate,
              warehouse: d.product?.warehouse || '상온보관고',
              remark: d.remark || '',
            }));
          });

          setMasterList(newMaster);
          setDetailsMap(newDetails);
          if (newMaster.length > 0) {
            setSelectedMasterId(newMaster[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load purchase orders from DB:', err));
  }, []);

  // Filtered master list
  const filteredMasterList = masterList.filter((row) => {
    if (supplierFilter !== '전체' && row.supplier !== supplierFilter) return false;
    if (statusFilter !== '전체' && row.status !== statusFilter) return false;
    return true;
  });

  const selectedMaster = masterList.find((m) => m.id === selectedMasterId);
  const currentDetails = detailsMap[selectedMasterId] || [];

  const handleMasterCheck = (id: number, checked: boolean) => {
    setMasterList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked } : item))
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setMasterList((prev) => prev.map((item) => ({ ...item, checked })));
  };

  const handleDeleteChecked = async () => {
    const checkedItems = masterList.filter((m) => m.checked);
    if (checkedItems.length === 0) {
      alert('취소/삭제할 발주 항목을 선택해주세요.');
      return;
    }
    const ok = await erpConfirm(`선택한 ${checkedItems.length}건의 발주서를 취소하시겠습니까?`, '발주 취소 확인', 'danger');
    if (ok) {
      try {
        for (const item of checkedItems) {
          await fetch('/api/purchase/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'cancel',
              orderNo: item.orderNo,
              cancelReason: '사용자 선택 취소',
            }),
          });
        }
        setMasterList((prev) =>
          prev.map((m) => (m.checked ? { ...m, status: '발주취소' as any, checked: false } : m))
        );
        alert('선택한 발주서가 성공적으로 취소되었습니다.');
      } catch (err: any) {
        alert('발주 취소 처리 중 오류: ' + err.message);
      }
    }
  };

  const handleSave = () => {
    alert('발주 정보 수정사항이 안전하게 저장되었습니다.');
  };

  const handleReset = () => {
    setMasterList(INITIAL_MASTER_DATA);
    setDetailsMap(INITIAL_DETAILS);
    setSupplierFilter('전체');
    setStatusFilter('전체');
    alert('데이터가 초기화되었습니다.');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <SalesActionBar
        title="발주현황/수정"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료되었습니다.') },
          { key: 'save', label: '저장', icon: 'save', variant: 'primary', onClick: handleSave },
          { key: 'delete', label: '삭제', icon: 'delete', variant: 'danger', onClick: handleDeleteChecked },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: handleReset },
          { key: 'excel', label: '엑셀다운로드', icon: 'excel', variant: 'secondary', onClick: () => exportGridToExcel({ filename: '발주현황수정', sheetName: '발주현황', columns: MASTER_COLUMNS, data: filteredMasterList }) },
        ]}
        helpContent="공급사별 발주 진행 현황을 조회하고 발주 정보 및 세부 품목 내역을 조회/수정/삭제합니다."
      />

      {/* 2. 검색 필터 바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex flex-wrap items-center gap-4">
          <SalesFilterBar
            label="발주일자"
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
          />

          <div className="flex items-center gap-1.5 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">매입처:</span>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] rounded focus:outline-blue-500 shadow-sm"
            >
              <option value="전체">전체 매입처</option>
              <option value="평화영농조합">평화영농조합</option>
              <option value="사조오양">사조오양</option>
              <option value="이우유통">이우유통</option>
              <option value="야미푸드">야미푸드</option>
              <option value="한성기업">한성기업</option>
              <option value="두레">두레</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">발주상태:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] rounded focus:outline-blue-500 shadow-sm"
            >
              <option value="전체">전체 상태</option>
              <option value="미입고">미입고</option>
              <option value="부분입고">부분입고</option>
              <option value="입고완료">입고완료</option>
              <option value="발주취소">발주취소</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-xs">
            조회건수: <span className="text-blue-700 font-bold">{filteredMasterList.length}</span> 건
          </span>
        </div>
      </div>

      {/* 3. 상하 2분할 레이아웃 */}
      <div className="flex-1 flex flex-col min-h-0 p-2 gap-2">
        {/* 상단: 요약 발주 목록 (Master) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                발주 마스터 현황
              </span>
              <label className="flex items-center gap-1 text-[11px] text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded cursor-pointer"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                전체선택
              </label>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-600">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-blue-600" />
                미입고: <span className="font-semibold">{masterList.filter((m) => m.status === '미입고').length}</span>
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle size={12} className="text-amber-600" />
                부분입고: <span className="font-semibold">{masterList.filter((m) => m.status === '부분입고').length}</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-600" />
                입고완료: <span className="font-semibold">{masterList.filter((m) => m.status === '입고완료').length}</span>
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <PurchaseDataGrid
              columns={MASTER_COLUMNS}
              data={filteredMasterList}
              selectedRowId={selectedMasterId}
              onRowClick={(row) => setSelectedMasterId(row.id)}
              onCellChange={(id, key, val) => {
                if (key === 'checked') handleMasterCheck(id, val);
              }}
              summaryRowTitle="합계 (총 발주)"
            />
          </div>
        </div>

        {/* 하단: 내역 상세 그리드 (Detail) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">
                발주 상세 품목 내역 ▶
              </span>
              {selectedMaster ? (
                <span className="bg-blue-100 text-blue-900 border border-blue-300 font-semibold px-2 py-0.5 rounded text-[11px]">
                  발주번호: <span className="font-mono font-bold text-blue-700">{selectedMaster.orderNo}</span> | 거래처: <span className="font-bold">{selectedMaster.supplier}</span> | 상태: <span className="font-bold">{selectedMaster.status}</span>
                </span>
              ) : (
                <span className="text-gray-500 text-[11px]">선택된 발주가 없습니다.</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600 font-medium">
                품목수: <span className="text-blue-700 font-bold">{currentDetails.length}</span> 건
              </span>
              <button
                onClick={() => {
                  if (!selectedMaster) return;
                  const newItem: OrderDetailRow = {
                    id: Date.now(),
                    itemCode: 'RM-NEW-01',
                    type: '원재료',
                    name: '신규 발주품목(추가)',
                    spec: '단위규격',
                    unit: 'box',
                    orderQty: 10,
                    unitPrice: 25000,
                    orderAmt: 250000,
                    receivedQty: 0,
                    unreceivedQty: 10,
                    expectedDate: selectedMaster.expectedDate,
                    warehouse: '상온보관고',
                    remark: '',
                  };
                  setDetailsMap((prev) => ({
                    ...prev,
                    [selectedMasterId]: [...(prev[selectedMasterId] || []), newItem],
                  }));
                }}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-[11px] flex items-center gap-1 shadow-xs"
              >
                <Plus size={12} /> 품목 추가
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {currentDetails.length > 0 ? (
              <PurchaseDataGrid
                columns={DETAIL_COLUMNS}
                data={currentDetails}
                summaryRowTitle="합계 (품목)"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-[13px]">
                상단에서 발주 건을 선택하면 상세 품목 리스트가 표시됩니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

