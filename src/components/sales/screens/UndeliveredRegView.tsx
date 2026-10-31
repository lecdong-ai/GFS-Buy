'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '../common/SalesActionBar';
import { SalesDataGrid, GridColumnDef } from '../common/SalesDataGrid';
import { usePipeline } from '@/context/PipelineContext';

interface SalesRegRow {
  id: number;
  storeCode: string;    // 점포코드
  storeName: string;    // 점포명
  salesDate: string;    // 일자
  shift: string;        // 편수
  productCode: string;  // 상품코드
  productName: string;  // 상품명
  orderQty: number;     // 발주수량
  orderAmt: number;     // 발주금액
  delivQty: number;     // 납품수량
  delivAmt: number;     // 납품금액
  unDelivQty: number;   // 미납수량
  unDelivAmt: number;   // 미납금액
  unDelivReason: string;// 미납사유
  remark: string;       // 비고
}

// 캡처 화면 092133.png 규격 컬럼
const INITIAL_ROWS: SalesRegRow[] = [
  { id: 1, storeCode: 'GS25-1001', storeName: 'GS25 역삼스타점', salesDate: '2026-10-30', shift: '1편', productCode: '27000388865', productName: '넷플)더담은K떡볶이김밥', orderQty: 30, orderAmt: 76350, delivQty: 30, delivAmt: 76350, unDelivQty: 0, unDelivAmt: 0, unDelivReason: '', remark: '정상납품' },
  { id: 2, storeCode: 'GS25-1001', storeName: 'GS25 역삼스타점', salesDate: '2026-10-30', shift: '1편', productCode: '27000388781', productName: '더블치즈소시지김밥1편', orderQty: 25, orderAmt: 54000, delivQty: 25, delivAmt: 54000, unDelivQty: 0, unDelivAmt: 0, unDelivReason: '', remark: '정상납품' },
  { id: 3, storeCode: 'GS25-1002', storeName: 'GS25 강남중앙점', salesDate: '2026-10-30', shift: '1편', productCode: '27000388732', productName: '혜자)돌아온부대찌개도시락', orderQty: 40, orderAmt: 168000, delivQty: 40, delivAmt: 168000, unDelivQty: 0, unDelivAmt: 0, unDelivReason: '', remark: '정상납품' },
  { id: 4, storeCode: 'GS25-1002', storeName: 'GS25 강남중앙점', salesDate: '2026-10-30', shift: '1편', productCode: '27000388859', productName: '혜자)통등심돈까스도시락', orderQty: 35, orderAmt: 171500, delivQty: 30, delivAmt: 147000, unDelivQty: 5, unDelivAmt: 24500, unDelivReason: '성형 라인 생산 부족', remark: '5ea 미납품' },
  { id: 5, storeCode: 'GS25-1003', storeName: 'GS25 종로타워점', salesDate: '2026-10-30', shift: '2편', productCode: '27000388785', productName: '더큰)스팸김치볶음밥', orderQty: 80, orderAmt: 86400, delivQty: 80, delivAmt: 86400, unDelivQty: 0, unDelivAmt: 0, unDelivReason: '', remark: '정상납품' },
  { id: 6, storeCode: 'GS25-1004', storeName: 'GS25 판교테크노점', salesDate: '2026-10-30', shift: '1편', productCode: '27000388710', productName: '착한1900핫도그(양배추)', orderQty: 50, orderAmt: 64300, delivQty: 50, delivAmt: 64300, unDelivQty: 0, unDelivAmt: 0, unDelivReason: '', remark: '정상납품' },
  { id: 7, storeCode: 'GS25-1005', storeName: 'GS25 부산서면점', salesDate: '2026-10-30', shift: '2편', productCode: '27000388829', productName: '무스비)햄&참치김치', orderQty: 45, orderAmt: 53190, delivQty: 45, delivAmt: 53190, unDelivQty: 0, unDelivAmt: 0, unDelivReason: '', remark: '정상납품' },
];

const COLUMNS: GridColumnDef[] = [
  { key: 'storeCode', label: '점포코드', width: '95px', align: 'center', editable: true },
  { key: 'storeName', label: '점포명', width: '135px', align: 'left', editable: true },
  { key: 'salesDate', label: '일자', width: '90px', align: 'center', format: 'date', editable: true },
  { key: 'shift', label: '편수', width: '55px', align: 'center', editable: true },
  { key: 'productCode', label: '상품코드', width: '105px', align: 'center', editable: true },
  { key: 'productName', minWidth: '260px', label: '상품명', align: 'left', editable: true },
  { key: 'orderQty', label: '발주수량', width: '80px', align: 'right', format: 'number', editable: true },
  { key: 'orderAmt', label: '발주금액', width: '95px', align: 'right', format: 'currency' },
  { key: 'delivQty', label: '납품수량', width: '80px', align: 'right', format: 'number', editable: true },
  { key: 'delivAmt', label: '납품금액', width: '95px', align: 'right', format: 'currency' },
  { key: 'unDelivQty', label: '미납수량', width: '80px', align: 'right', format: 'number' },
  { key: 'unDelivAmt', label: '미납금액', width: '95px', align: 'right', format: 'currency' },
  { key: 'unDelivReason', label: '미납사유', width: '140px', align: 'left', editable: true },
  { key: 'remark', label: '비고', width: '110px', align: 'left', editable: true },
];

export const UndeliveredRegView: React.FC = () => {
  const [rows, setRows] = useState<SalesRegRow[]>(INITIAL_ROWS);
  const { openExcelOrderModal } = usePipeline();

  useEffect(() => {
    fetch('/api/sales/order')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: SalesRegRow[] = [];
          json.data.forEach((o: any) => {
            (o.details || []).forEach((dt: any, dtIdx: number) => {
              const oQ = dt.totalQty || 10;
              const dQ = oQ;
              const price = dt.unitPrice || 2000;
              loaded.push({
                id: dt.id || dtIdx + 1,
                storeCode: 'GS25-1001',
                storeName: o.centerCode || 'GS25 역삼스타점',
                salesDate: o.orderDate,
                shift: o.shift || '1편',
                productCode: dt.product?.productCode || '27000388710',
                productName: dt.product?.name || '제품',
                orderQty: oQ,
                orderAmt: oQ * price,
                delivQty: dQ,
                delivAmt: dQ * price,
                unDelivQty: 0,
                unDelivAmt: 0,
                unDelivReason: '',
                remark: '',
              });
            });
          });
          if (loaded.length > 0) {
            setRows(loaded);
          }
        }
      })
      .catch((err) => console.error('Failed to load orders for sales reg', err));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/sales/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryDate: new Date().toISOString().slice(0, 10),
          centerCode: rows[0]?.storeName || 'GSR 김해일배',
          items: rows.map((r) => ({
            productCode: r.productCode,
            deliveryQty: r.delivQty,
            unitPrice: r.orderQty > 0 ? Math.round(r.orderAmt / r.orderQty) : 2000,
            amount: r.delivAmt,
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('매출등록 데이터가 데이터베이스에 성공적으로 저장되었습니다.');
      } else {
        alert('저장 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('저장 중 오류: ' + err.message);
    }
  };

  const handleReset = () => {
    setRows(INITIAL_ROWS);
  };

  const handleRowChange = (id: any, key: string, val: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, [key]: val };
          if (key === 'orderQty' || key === 'delivQty') {
            const oQ = Number(key === 'orderQty' ? val : updated.orderQty) || 0;
            const dQ = Number(key === 'delivQty' ? val : updated.delivQty) || 0;
            const price = oQ > 0 ? Math.round(updated.orderAmt / oQ) : 2000;
            updated.delivAmt = dQ * price;
            updated.unDelivQty = Math.max(0, oQ - dQ);
            updated.unDelivAmt = updated.unDelivQty * price;
          }
          return updated;
        }
        return r;
      })
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 (화면 캡처 092133.png: 저장, 초기화, 엑셀업로드, ?) */}
      <SalesActionBar
        title="매출등록"
        buttons={[
          { key: 'save', label: '저장', icon: 'save', variant: 'primary', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: handleReset },
          { key: 'upload', label: '엑셀업로드', icon: 'excel', variant: 'secondary', onClick: openExcelOrderModal },
        ]}
        helpContent="점포별 발주 수량 대비 실제 납품 완료된 수량과 미납 내역을 확정하고 최종 매출 원장으로 등록합니다."
      />

      {/* 2. 단일 그리드 (#c5c9f7 연보라 헤더, #fdfde0 하단 합계줄) */}
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
