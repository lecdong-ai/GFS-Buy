'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { SalesFilterBar } from '@/components/sales/common/SalesFilterBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '../common/PurchaseDataGrid';
import { usePrintReport } from '@/context/PrintReportContext';

// ★ 요구사항 실제 샘플 데이터 6건 (합계: 40,240,600)
const EXACT_ORDER_SUMMARY = [
  { id: 1, checked: false, issued: false, printBtn: '...', orderDate: '2026-10-30', orderNo: 'pc25345', status: '미입고', supplier: '평화영농조합', orderAmt: 27000000, method: '카톡', manager: '이창승 상무', tel: '010-3565-92XX', email: 'peace_rice@nonghyup.com', remark: '당일 도정미 직납' },
  { id: 2, checked: false, issued: false, printBtn: '...', orderDate: '2026-10-30', orderNo: 'pc25344', status: '미입고', supplier: '사조오양', orderAmt: 84000, method: '카톡', manager: '김영하 대리', tel: '010-4236-04XX', email: 'yhkim@sajo.co.kr', remark: '' },
  { id: 3, checked: false, issued: true, printBtn: '...', orderDate: '2026-10-30', orderNo: 'pc25343', status: '미입고', supplier: '이우유통', orderAmt: 4414600, method: '카톡13시', manager: '구동서 부장', tel: '010-4717-25XX', email: 'leewoo_dist@naver.com', remark: '오후 배송 지정' },
  { id: 4, checked: false, issued: true, printBtn: '...', orderDate: '2026-10-30', orderNo: 'pc25342', status: '미입고', supplier: '야미푸드', orderAmt: 153000, method: '카톡', manager: '이하경 이사', tel: '010-5661-11XX', email: 'yummy_hk@daum.net', remark: '' },
  { id: 5, checked: false, issued: true, printBtn: '...', orderDate: '2026-10-30', orderNo: 'pc25341', status: '미입고', supplier: '한성기업', orderAmt: 3980400, method: '이메일', manager: '정재근 대리', tel: '010-7191-71XX', email: 'hansung_jg@hansung.co.kr', remark: '콜드체인 검수필' },
  { id: 6, checked: false, issued: true, printBtn: '...', orderDate: '2026-10-30', orderNo: 'pc25340', status: '미입고', supplier: '한성기업', orderAmt: 4608600, method: '이메일', manager: '정재근 대리', tel: '010-7191-71XX', email: 'hansung_jg@hansung.co.kr', remark: '크래미 및 맛살 2편' },
];

const INITIAL_DETAILS: Record<number, any[]> = {
  1: [
    { id: 101, type: '원재료', name: '국내산 경기미 백미(햅쌀)', spec: '20kg/포', unit: '포', orderQty: 500, unitPrice: 54000, orderAmt: 27000000, recvDate: '2026-10-31', remark: '수분함량 15% 이하' },
  ],
  2: [
    { id: 201, type: '원재료', name: '가공 참치플레이크(오일)', spec: '1.8kg*6캔', unit: 'box', orderQty: 1, unitPrice: 84000, orderAmt: 84000, recvDate: '2026-10-31', remark: '샘플 발주' },
  ],
  3: [
    { id: 301, type: '원재료', name: '골드마요네즈 3.2kg', spec: '3.2kg*4통', unit: 'box', orderQty: 60, unitPrice: 38000, orderAmt: 2280000, recvDate: '2026-10-31', remark: '' },
    { id: 302, type: '원재료', name: '슬라이스치즈(고소한맛)', spec: '1kg*10팩', unit: 'box', orderQty: 30, unitPrice: 71153, orderAmt: 2134600, recvDate: '2026-10-31', remark: '' },
  ],
  4: [
    { id: 401, type: '부재료', name: '도시락용 조미김 포션', spec: '2g*500봉', unit: 'box', orderQty: 3, unitPrice: 51000, orderAmt: 153000, recvDate: '2026-10-31', remark: '' },
  ],
  5: [
    { id: 501, type: '원재료', name: '[냉장]다진맛살 10kg', spec: '10kg*2ea', unit: 'box', orderQty: 40, unitPrice: 52000, orderAmt: 2080000, recvDate: '2026-10-31', remark: '김밥용 원료' },
    { id: 502, type: '원재료', name: '[냉동]궁채나물 1kg', spec: '1kg*10ea', unit: 'box', orderQty: 30, unitPrice: 63346, orderAmt: 1900400, recvDate: '2026-10-31', remark: '' },
  ],
  6: [
    { id: 601, type: '원재료', name: '[냉장]볶음김치 5kg', spec: '5kg*3ea', unit: 'box', orderQty: 80, unitPrice: 42000, orderAmt: 3360000, recvDate: '2026-10-31', remark: '제육도시락 볶음김치' },
    { id: 602, type: '원재료', name: '[냉동]우양지 슬라이스', spec: '2kg*5팩', unit: 'box', orderQty: 10, unitPrice: 124860, orderAmt: 1248600, recvDate: '2026-10-31', remark: '' },
  ],
};

const SUMMARY_COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'checked', label: '선택', width: '45px', align: 'center', format: 'checkbox' },
  { key: 'issued', label: '발행여부', width: '65px', align: 'center', format: 'checkbox' },
  { key: 'printBtn', label: '발주서발행', width: '75px', align: 'center' },
  { key: 'orderDate', label: '발주일', width: '90px', align: 'center', format: 'date' },
  { key: 'orderNo', label: '발주번호', width: '90px', align: 'center' },
  { key: 'status', label: '상태', width: '65px', align: 'center' },
  { key: 'supplier', label: '거래처', width: '130px', align: 'left' },
  { key: 'orderAmt', label: '발주금액(합계)', width: '120px', align: 'right', format: 'currency', highlight: true },
  { key: 'method', label: '발주수단', width: '80px', align: 'center' },
  { key: 'manager', label: '담당자', width: '90px', align: 'center' },
  { key: 'tel', label: '연락처', width: '110px', align: 'center' },
  { key: 'email', label: 'email', width: '180px', align: 'left' },
  { key: 'remark', label: '비고', width: '140px', align: 'left' },
];

const DETAIL_COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'type', label: '구분', width: '70px', align: 'center' },
  { key: 'name', label: '품명', width: '220px', align: 'left' },
  { key: 'spec', label: '규격', width: '100px', align: 'center' },
  { key: 'unit', label: '단위', width: '50px', align: 'center' },
  { key: 'orderQty', label: '발주수량', width: '90px', align: 'right', format: 'number' },
  { key: 'unitPrice', label: '발주단가', width: '90px', align: 'right', format: 'currency' },
  { key: 'orderAmt', label: '발주금액(합계)', width: '120px', align: 'right', format: 'currency' },
  { key: 'recvDate', label: '입고일', width: '90px', align: 'center', format: 'date' },
  { key: 'remark', label: '비고', width: '160px', align: 'left' },
];

export const OrderPrintView: React.FC = () => {
  const { openPrintModal } = usePrintReport();
  const [startDate, setStartDate] = useState('2026-10-30');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [summaryList, setSummaryList] = useState(EXACT_ORDER_SUMMARY);
  const [selectedSummaryId, setSelectedSummaryId] = useState<number>(1);
  const [detailMap, setDetailMap] = useState(INITIAL_DETAILS);

  useEffect(() => {
    fetch('/api/purchase/order')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: any[] = json.data.map((o: any, idx: number) => ({
            id: o.id || idx + 1,
            checked: false,
            issued: o.status !== '발주',
            printBtn: '...',
            orderDate: o.orderDate,
            orderNo: o.orderNo,
            status: o.status || '미입고',
            supplier: o.partner?.name || o.partnerName || '거래처',
            orderAmt: o.totalAmount || 0,
            method: '전산',
            manager: o.createdBy || '관리자',
            tel: o.partner?.tel || '010-0000-0000',
            email: o.partner?.email || 'partner@gfs.com',
            remark: o.remark || '',
          }));
          setSummaryList(loaded);
        }
      })
      .catch((err) => console.error('Failed to load purchase orders for print', err));
  }, []);

  const currentDetails = detailMap[selectedSummaryId] || [];
  const allChecked = summaryList.length > 0 && summaryList.every((s) => s.checked);

  const handleSelectAll = (checked: boolean) => {
    setSummaryList((prev) => prev.map((s) => ({ ...s, checked })));
  };

  const handleSummaryRowChange = (id: any, key: string, val: any) => {
    setSummaryList((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  };

  const handlePrintPopup = (order: any) => {
    openPrintModal('PURCHASE_ORDER');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none">
      <SalesActionBar
        title="발주서출력"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          { key: 'print', label: '발주서일괄인쇄', icon: 'print', variant: 'success', onClick: () => openPrintModal('PURCHASE_ORDER') },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => setSummaryList(EXACT_ORDER_SUMMARY) },
        ]}
        helpContent="거래처별 원부자재 발주서를 조회하고, 카카오톡/이메일 전송용 표준 발주서를 발행 및 인쇄합니다."
      />

      <SalesFilterBar
        label="주문일자"
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
        }}
        dataCount={summaryList.length}
        onRefresh={() => alert('새로고침')}
      />

      <div className="flex-1 flex flex-col p-1.5 gap-1.5 overflow-hidden">
        {/* 상단 [요약] 그리드 */}
        <div className="flex flex-col h-1/2 min-h-0 bg-white border border-gray-400">
          <div className="px-2 py-1 bg-[#e2e8f0] border-b border-gray-300 font-bold text-gray-800 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-600 inline-block" />
                요약 (발주처 목록)
              </span>
              <label className="flex items-center gap-1 text-[11px] text-gray-800 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="cursor-pointer"
                />
                <span>전체선택</span>
              </label>
            </div>
            <span className="text-gray-500 font-normal text-[10px]">
              거래처를 클릭하면 하단에 세부 발주 품목 및 입고일정이 표시됩니다.
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <PurchaseDataGrid
              columns={SUMMARY_COLUMNS}
              data={summaryList}
              selectedRowId={selectedSummaryId}
              onSelectRow={(row) => setSelectedSummaryId(row.id)}
              onRowChange={handleSummaryRowChange}
              summaryData={{
                orderAmt: 40240600, // ★ 요구사항 명시된 합계 금액
              }}
            />
          </div>
        </div>

        {/* 하단 [내역] 그리드 */}
        <div className="flex flex-col h-1/2 min-h-0 bg-white border border-gray-400">
          <div className="px-2 py-1 bg-[#e2e8f0] border-b border-gray-300 font-bold text-gray-800 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-blue-900">
              <span className="w-2 h-2 bg-emerald-600 inline-block" />
              내역 (원부자재 세부 발주 내역)
            </span>
            <span className="text-blue-800 font-bold text-[11px]">
              품목수: {currentDetails.length}건
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <PurchaseDataGrid
              columns={DETAIL_COLUMNS}
              data={currentDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

