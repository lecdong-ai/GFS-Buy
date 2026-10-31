'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { SalesFilterBar } from '@/components/sales/common/SalesFilterBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '../common/PurchaseDataGrid';

const CANCEL_COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'orderNo', label: '발주번호', width: '100px', align: 'center' },
  { key: 'orderDate', label: '발주일', width: '90px', align: 'center', format: 'date' },
  { key: 'cancelDate', label: '발주취소일', width: '90px', align: 'center', format: 'date' },
  { key: 'supplier', label: '거래처', width: '130px', align: 'left' },
  { key: 'type', label: '구분', width: '70px', align: 'center' },
  { key: 'name', label: '품명', width: '220px', align: 'left' },
  { key: 'spec', label: '규격', width: '100px', align: 'center' },
  { key: 'unit', label: '단위', width: '50px', align: 'center' },
  { key: 'unitPrice', label: '발주단가', width: '90px', align: 'right', format: 'currency' },
  { key: 'orderQty', label: '발주수량', width: '80px', align: 'right', format: 'number' },
  { key: 'orderAmt', label: '발주금액(합계)', width: '120px', align: 'right', format: 'currency' },
  { key: 'delivQty', label: '납품수량', width: '80px', align: 'right', format: 'number' },
  { key: 'delivAmt', label: '납품금액(합계)', width: '120px', align: 'right', format: 'currency' },
  { key: 'delivDate', label: '납품일자', width: '90px', align: 'center', format: 'date' },
  { key: 'lotNo', label: 'LOT no.', width: '100px', align: 'center' },
  { key: 'remark', label: '비고', width: '160px', align: 'left' },
];

const SAMPLE_CANCEL_DATA = [
  { id: 1, orderNo: 'pc25330', orderDate: '2026-10-29', cancelDate: '2026-10-30', supplier: '사조오양', type: '원재료', name: '가공 참치플레이크(오일)', spec: '1.8kg*6캔', unit: 'box', unitPrice: 68000, orderQty: 20, orderAmt: 1360000, delivQty: 0, delivAmt: 0, delivDate: '2026-10-30', lotNo: 'LOT-261029-S01', remark: '생산계획 변경 취소' },
  { id: 2, orderNo: 'pc25328', orderDate: '2026-10-29', cancelDate: '2026-10-30', supplier: '한성기업', type: '원재료', name: '[냉장]다진맛살 10kg', spec: '10kg*2ea', unit: 'box', unitPrice: 52000, orderQty: 15, orderAmt: 780000, delivQty: 0, delivAmt: 0, delivDate: '2026-10-30', lotNo: 'LOT-261029-H02', remark: '기존 재고 잉여로 취소' },
  { id: 3, orderNo: 'pc25324', orderDate: '2026-10-28', cancelDate: '2026-10-30', supplier: '두레', type: '부재료', name: '두레)ET-30 용기', spec: '50ea*2줄', unit: 'box', unitPrice: 42000, orderQty: 30, orderAmt: 1260000, delivQty: 0, delivAmt: 0, delivDate: '2026-10-29', lotNo: 'LOT-261028-D01', remark: '금형 규격 변경' },
  { id: 4, orderNo: 'pc25319', orderDate: '2026-10-28', cancelDate: '2026-10-30', supplier: 'CJ제일제당', type: '원재료', name: '[냉장]계란구이 포션', spec: '1020g*12ea', unit: 'box', unitPrice: 78000, orderQty: 10, orderAmt: 780000, delivQty: 0, delivAmt: 0, delivDate: '2026-10-29', lotNo: 'LOT-261028-C01', remark: '공급사 납기 지연으로 취소' },
];

export const OrderCancelStatusView: React.FC = () => {
  const [startDate, setStartDate] = useState('2026-10-30');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [data, setData] = useState(SAMPLE_CANCEL_DATA);

  useEffect(() => {
    fetch('/api/purchase/order?status=발주취소')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded = json.data.map((o: any, idx: number) => ({
            id: o.id || idx + 1,
            orderNo: o.orderNo,
            orderDate: o.orderDate,
            cancelDate: o.cancelDate || '2026-10-30',
            supplier: o.partner?.name || o.partnerName || '거래처',
            type: '원재료',
            name: o.details?.[0]?.product?.name || '자재',
            spec: o.details?.[0]?.product?.spec || '',
            unit: o.details?.[0]?.product?.unit || 'kg',
            unitPrice: o.details?.[0]?.unitPrice || 5000,
            orderQty: o.details?.[0]?.orderQty || 10,
            orderAmt: o.totalAmount || 50000,
            delivQty: 0,
            delivAmt: 0,
            delivDate: o.orderDate,
            lotNo: `LOT-${o.orderDate?.replace(/-/g, '')}`,
            remark: o.cancelReason || '발주 취소',
          }));
          setData(loaded);
        }
      })
      .catch((err) => console.error('Failed to load cancelled purchase orders', err));
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none">
      <SalesActionBar
        title="발주취소현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => alert('초기화 완료') },
        ]}
        helpContent="공급업체에 발주 접수 후 취소 처리된 원부자재 발주 목록 및 취소 사유를 조회합니다."
      />

      <SalesFilterBar
        label="기준일자"
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
        }}
        dataCount={data.length}
        onRefresh={() => alert('새로고침')}
      />

      <div className="flex-1 p-1.5 min-h-0 overflow-hidden flex flex-col">
        <PurchaseDataGrid
          columns={CANCEL_COLUMNS}
          data={data}
        />
      </div>
    </div>
  );
};

