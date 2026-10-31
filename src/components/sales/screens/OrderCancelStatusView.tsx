'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '../common/SalesActionBar';
import { SalesFilterBar } from '../common/SalesFilterBar';
import { SalesDataGrid, GridColumnDef } from '../common/SalesDataGrid';
import { exportGridToExcel } from '@/lib/excelExport';

interface OrderCancelRow {
  id: number;
  orderNo: string;        // 주문번호
  orderDate: string;      // 주문날짜
  cancelDate: string;     // 주문취소일
  clientName: string;     // 거래처
  gubun: string;          // 구분
  partName: string;       // 품명
  spec: string;           // 규격
  unit: string;           // 단위
  orderPrice: number;     // 주문단가
  orderQty: number;       // 주문수량
  orderAmt: number;       // 주문금액
  tradeQty: number;       // 거래량
  tradeAmt: number;       // 거래금액
  delivDate: string;      // 납기일
  lotNo: string;          // LOT no.
  remark: string;         // 비고
}

const INITIAL_ROWS: OrderCancelRow[] = [
  { id: 1, orderNo: 'ORD-261029-012', orderDate: '2026-10-29', cancelDate: '2026-10-30', clientName: 'GSR 김해일배', gubun: '완성품', partName: '넷플)더담은K떡볶이김밥', spec: '240g', unit: 'ea', orderPrice: 2545, orderQty: 40, orderAmt: 101800, tradeQty: 0, tradeAmt: 0, delivDate: '2026-10-30', lotNo: 'LOT-261029-C01', remark: '점포 냉장고 수리 긴급취소' },
  { id: 2, orderNo: 'ORD-261029-015', orderDate: '2026-10-29', cancelDate: '2026-10-30', clientName: 'GSR 양산조리센터', gubun: '완성품', partName: '혜자)돌아온제육도시락', spec: '460g', unit: 'ea', orderPrice: 3915, orderQty: 20, orderAmt: 78300, tradeQty: 0, tradeAmt: 0, delivDate: '2026-10-30', lotNo: 'LOT-261029-C02', remark: '중복 발주 취소' },
  { id: 3, orderNo: 'ORD-261029-021', orderDate: '2026-10-29', cancelDate: '2026-10-30', clientName: 'GSR 부산물류센터', gubun: '완성품', partName: '더큰)스팸김치볶음밥', spec: '160g', unit: 'ea', orderPrice: 1080, orderQty: 50, orderAmt: 54000, tradeQty: 0, tradeAmt: 0, delivDate: '2026-10-30', lotNo: 'LOT-261029-C03', remark: '발주 착오 수량정정' },
  { id: 4, orderNo: 'ORD-261029-028', orderDate: '2026-10-29', cancelDate: '2026-10-30', clientName: 'GSR 신광주 저온', gubun: '완성품', partName: '착한1900핫도그(양배추)', spec: '130g', unit: 'ea', orderPrice: 1286, orderQty: 30, orderAmt: 38580, tradeQty: 0, tradeAmt: 0, delivDate: '2026-10-30', lotNo: 'LOT-261029-C04', remark: '점포 폐점 사전취소' },
];

const COLUMNS: GridColumnDef[] = [
  { key: 'orderNo', label: '주문번호', width: '130px', align: 'center' },
  { key: 'orderDate', label: '주문날짜', width: '90px', align: 'center', format: 'date' },
  { key: 'cancelDate', label: '주문취소일', width: '90px', align: 'center', format: 'date' },
  { key: 'clientName', label: '거래처', width: '120px', align: 'left' },
  { key: 'gubun', label: '구분', width: '60px', align: 'center' },
  { key: 'partName', minWidth: '260px', label: '품명', align: 'left' },
  { key: 'spec', label: '규격', width: '70px', align: 'center' },
  { key: 'unit', label: '단위', width: '45px', align: 'center' },
  { key: 'orderPrice', label: '주문단가', width: '85px', align: 'right', format: 'currency' },
  { key: 'orderQty', label: '주문수량', width: '80px', align: 'right', format: 'number' },
  { key: 'orderAmt', label: '주문금액', width: '100px', align: 'right', format: 'currency' },
  { key: 'tradeQty', label: '거래량', width: '75px', align: 'right', format: 'number' },
  { key: 'tradeAmt', label: '거래금액', width: '95px', align: 'right', format: 'currency' },
  { key: 'delivDate', label: '납기일', width: '90px', align: 'center', format: 'date' },
  { key: 'lotNo', label: 'LOT no.', width: '125px', align: 'center' },
  { key: 'remark', label: '비고', width: '160px', align: 'left' },
];

export const OrderCancelStatusView: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-10-30');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [rows, setRows] = useState<OrderCancelRow[]>(INITIAL_ROWS);

  useEffect(() => {
    fetch('/api/sales/order?status=취소')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: OrderCancelRow[] = json.data.map((o: any, idx: number) => ({
            id: o.id || idx + 1,
            orderNo: o.orderNo,
            orderDate: o.orderDate,
            cancelDate: o.cancelDate || o.updatedAt?.slice(0, 10) || '2026-10-30',
            clientName: o.centerCode || 'GSR 김해일배',
            gubun: '완성품',
            partName: o.details?.[0]?.product?.name || '제품',
            spec: o.details?.[0]?.product?.spec || '230g',
            unit: 'ea',
            orderPrice: o.details?.[0]?.unitPrice || 2000,
            orderQty: o.totalQty || 10,
            orderAmt: o.totalAmount || 20000,
            tradeQty: 0,
            tradeAmt: 0,
            delivDate: o.orderDate,
            lotNo: `LOT-${o.orderDate?.replace(/-/g, '')}`,
            remark: o.cancelReason || '발주 취소',
          }));
          setRows(loaded);
        }
      })
      .catch((err) => console.error('Failed to load cancelled orders', err));
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 (화면 캡처 091644.png: 조회, 엑셀다운로드, ?) */}
      <SalesActionBar
        title="주문취소현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          { key: 'excel', label: '엑셀다운로드', icon: 'excel', variant: 'secondary', onClick: () => exportGridToExcel({ filename: '주문취소현황', sheetName: '주문취소현황', columns: COLUMNS, data: rows }) },
        ]}
        helpContent="접수 후 취소 처리된 GS리테일 주문 건의 일자별, 품목별 취소 수량 및 사유를 조회합니다."
      />

      {/* 2. 조건 검색 바 (화면 캡처 091644.png: 기준일자, [<][>], 일간~연간) */}
      <SalesFilterBar
        label="기준일자"
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
        }}
        dataCount={rows.length}
      />

      {/* 3. 단일 그리드 (#c5c9f7 연보라 헤더, #fdfde0 하단 합계줄) */}
      <div className="flex-1 p-1 min-h-0 overflow-hidden flex flex-col">
        <SalesDataGrid columns={COLUMNS} data={rows} />
      </div>
    </div>
  );
};
