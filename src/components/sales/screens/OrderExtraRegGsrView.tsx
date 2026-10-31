'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '../common/SalesActionBar';
import { SalesDataGrid, GridColumnDef } from '../common/SalesDataGrid';

interface ExtraOrderItem {
  id: number;
  gubun: string;      // 구분
  partName: string;   // 품명
  spec: string;       // 규격
  unit: string;       // 단위
  orderQty: number;   // 주문수량
  delivDate: string;  // 납품일자
  shift: string;      // 편수
  storeName: string;  // 편의점명
  currentStock: number; // 현재고
  unitPrice: number;  // 납품단가
  orderAmt: number;   // 주문금액
  poNo: string;       // P/O no.
  remark: string;     // 비고
}

const INITIAL_ROWS: ExtraOrderItem[] = [
  { id: 1, gubun: '추가', partName: '더블치즈소시지김밥1편', spec: '230g', unit: 'ea', orderQty: 30, delivDate: '2026-10-30', shift: '1편', storeName: 'GS25 역삼스타점', currentStock: 45, unitPrice: 2160, orderAmt: 64800, poNo: 'PO-EX-261030-01', remark: '긴급 추가요청' },
  { id: 2, gubun: '추가', partName: '더큰)스팸김치볶음밥', spec: '160g', unit: 'ea', orderQty: 50, delivDate: '2026-10-30', shift: '1편', storeName: 'GS25 강남중앙점', currentStock: 80, unitPrice: 1080, orderAmt: 54000, poNo: 'PO-EX-261030-02', remark: '오전 조기품절' },
  { id: 3, gubun: '추가', partName: '착한1900핫도그(양배추)', spec: '130g', unit: 'ea', orderQty: 25, delivDate: '2026-10-30', shift: '1편', storeName: 'GS25 종로타워점', currentStock: 20, unitPrice: 1286, orderAmt: 32150, poNo: 'PO-EX-261030-03', remark: '특수 행사' },
  { id: 4, gubun: '추가', partName: '혜자)돌아온제육도시락', spec: '460g', unit: 'ea', orderQty: 40, delivDate: '2026-10-30', shift: '2편', storeName: 'GS25 부산서면점', currentStock: 35, unitPrice: 3915, orderAmt: 156600, poNo: 'PO-EX-261030-04', remark: '야간 주문추가' },
];

const COLUMNS: GridColumnDef[] = [
  { key: 'gubun', label: '구분', width: '60px', align: 'center', editable: true },
  { key: 'partName', minWidth: '260px', label: '품명', align: 'left', editable: true },
  { key: 'spec', label: '규격', width: '75px', align: 'center', editable: true },
  { key: 'unit', label: '단위', width: '45px', align: 'center', editable: true },
  { key: 'orderQty', label: '주문수량', width: '80px', align: 'right', format: 'number', editable: true },
  { key: 'delivDate', label: '납품일자', width: '90px', align: 'center', format: 'date', editable: true },
  { key: 'shift', label: '편수', width: '55px', align: 'center', editable: true },
  { key: 'storeName', label: '편의점명', width: '130px', align: 'left', editable: true },
  { key: 'currentStock', label: '현재고', width: '75px', align: 'right', format: 'number' },
  { key: 'unitPrice', label: '납품단가', width: '85px', align: 'right', format: 'currency', editable: true },
  { key: 'orderAmt', label: '주문금액', width: '100px', align: 'right', format: 'currency' },
  { key: 'poNo', label: 'P/O no.', width: '125px', align: 'center', editable: true },
  { key: 'remark', label: '비고', width: '130px', align: 'left', editable: true },
];

export const OrderExtraRegGsrView: React.FC = () => {
  const [orderDate, setOrderDate] = useState('2026년 10월 30일 금요일');
  const [customer, setCustomer] = useState('(주)영풍');
  const [storeKeyword, setStoreKeyword] = useState('');
  const [shift, setShift] = useState<'1편' | '2편'>('1편');
  const [rows, setRows] = useState<ExtraOrderItem[]>(INITIAL_ROWS);

  useEffect(() => {
    fetch('/api/sales/order?orderType=추가')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: ExtraOrderItem[] = [];
          json.data.forEach((o: any) => {
            (o.details || []).forEach((dt: any, dtIdx: number) => {
              loaded.push({
                id: dt.id || dtIdx + 1,
                gubun: '추가',
                partName: dt.product?.name || '제품',
                spec: dt.product?.spec || '230g',
                unit: dt.product?.unit || 'ea',
                orderQty: dt.totalQty || 10,
                delivDate: o.orderDate,
                shift: (o.shift as '1편' | '2편') || '1편',
                storeName: o.remark || 'GS25 지정점',
                currentStock: 100,
                unitPrice: dt.unitPrice || 2000,
                orderAmt: dt.amount || 20000,
                poNo: o.orderNo,
                remark: o.remark || '',
              });
            });
          });
          if (loaded.length > 0) {
            setRows(loaded);
          }
        }
      })
      .catch((err) => console.error('Failed to load extra orders', err));
  }, []);

  const handleNew = () => {
    const newRow: ExtraOrderItem = {
      id: Date.now(),
      gubun: '추가',
      partName: '신규추가품목',
      spec: '100g',
      unit: 'ea',
      orderQty: 10,
      delivDate: '2026-10-30',
      shift,
      storeName: storeKeyword || 'GS25 직영점',
      currentStock: 50,
      unitPrice: 2000,
      orderAmt: 20000,
      poNo: `PO-EX-${Date.now().toString().slice(-6)}`,
      remark: '개별입력',
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/sales/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          orderType: '추가',
          orderDate: new Date().toISOString().slice(0, 10),
          centerCode: customer || 'GSR 김해일배',
          shift,
          items: rows.map((r) => ({
            productId: 1,
            orderQty: r.orderQty,
            unitPrice: r.unitPrice,
            amount: r.orderAmt,
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('추가 주문 내역이 데이터베이스에 성공적으로 저장되었습니다.');
      } else {
        alert('저장 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('저장 중 오류: ' + err.message);
    }
  };

  const handleReset = () => {
    setRows(INITIAL_ROWS);
    setStoreKeyword('');
  };

  const handleRowChange = (id: any, key: string, val: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, [key]: val };
          if (key === 'orderQty' || key === 'unitPrice') {
            const q = Number(key === 'orderQty' ? val : updated.orderQty) || 0;
            const p = Number(key === 'unitPrice' ? val : updated.unitPrice) || 0;
            updated.orderAmt = q * p;
          }
          return updated;
        }
        return r;
      })
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 (화면 캡처 091409.png: 신규, 저장, 초기화, ?) */}
      <SalesActionBar
        title="추가주문등록GSR(개별등록)"
        buttons={[
          { key: 'new', label: '신규', icon: 'reset', variant: 'secondary', onClick: handleNew },
          { key: 'save', label: '저장', icon: 'save', variant: 'primary', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: handleReset },
        ]}
        helpContent="정기 발주 마감 후 점포 유선/메신저로 긴급 접수된 추가 수량을 점포별/편수별로 개별 등록합니다."
      />

      {/* 2. 조건 검색 바 (화면 캡처 091409.png: 주문일, 거래처, 편의점, 편수, 최종업로드일시) */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex flex-wrap items-center gap-4">
          {/* 주문일 */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">주문일:</span>
            <select
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[11px] font-medium rounded-xs shadow-2xs h-6"
            >
              <option value="2026년 10월 30일 금요일">2026년 10월 30일 금요일</option>
              <option value="2026년 10월 29일 목요일">2026년 10월 29일 목요일</option>
              <option value="2026년 10월 28일 수요일">2026년 10월 28일 수요일</option>
            </select>
          </div>

          {/* 거래처 */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">거래처:</span>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[11px] font-medium rounded-xs shadow-2xs h-6 w-32"
            >
              <option value="(주)영풍">(주)영풍</option>
              <option value="GS리테일(주)">GS리테일(주)</option>
              <option value="(주)해인">(주)해인</option>
            </select>
          </div>

          {/* 편의점 */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">편의점:</span>
            <input
              type="text"
              placeholder="점포명 검색"
              value={storeKeyword}
              onChange={(e) => setStoreKeyword(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[11px] rounded-xs shadow-2xs h-6 w-36"
            />
          </div>

          {/* 편수 라디오 */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">편수:</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="shift"
                checked={shift === '1편'}
                onChange={() => setShift('1편')}
                className="w-3.5 h-3.5 text-blue-600"
              />
              <span className="font-medium text-gray-800">1편</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="shift"
                checked={shift === '2편'}
                onChange={() => setShift('2편')}
                className="w-3.5 h-3.5 text-blue-600"
              />
              <span className="font-medium text-gray-800">2편</span>
            </label>
          </div>
        </div>

        {/* 우측 최종업로드일시 */}
        <div className="text-[11px] text-gray-600 font-sans">
          <span>최종업로드일시: </span>
          <span className="font-mono text-blue-900 font-bold">2026-10-28 12:06</span>
        </div>
      </div>

      {/* 3. 그리드 영역 (#c5c9f7 연보라 헤더, #fdfde0 하단 합계줄) */}
      <div className="flex-1 p-1 min-h-0 overflow-hidden flex flex-col">
        <SalesDataGrid
          columns={COLUMNS}
          data={rows}
          onRowChange={handleRowChange}
        />
      </div>
    </div>
  );
};
