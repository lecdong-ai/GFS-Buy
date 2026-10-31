'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '../common/SalesActionBar';
import { SalesDataGrid, GridColumnDef } from '../common/SalesDataGrid';
import { usePipeline } from '@/context/PipelineContext';
import { exportGridToExcel } from '@/lib/excelExport';

interface OrderUploadRow {
  id: number;
  gubun: string;      // 구분
  partNo: string;     // 품번
  partName: string;   // 품명
  spec: string;       // 규격
  unit: string;       // 단위
  orderQty: number;   // 주문수량
  delivDate: string;  // 납품일자
  unitPrice: number;  // 납품단가
  orderAmt: number;   // 주문금액
  delivTo: string;    // 납품처
  shipTo: string;     // 배송처
  poNo: string;       // P/O no.
  shift: string;      // 편수
  remark: string;     // 비고
  status: string;     // 상태
}

const INITIAL_ROWS: OrderUploadRow[] = [
  { id: 1, gubun: '정상', partNo: '27000388865', partName: '넷플)더담은K떡볶이김밥', spec: '240g', unit: 'ea', orderQty: 180, delivDate: '2026-10-30', unitPrice: 2545, orderAmt: 458100, delivTo: 'GS리테일(주)', shipTo: 'GSR 김해일배', poNo: 'PO-20261029-01', shift: '1편', remark: '오전납품', status: '확정' },
  { id: 2, gubun: '정상', partNo: '27000388781', partName: '더블치즈소시지김밥1편', spec: '230g', unit: 'ea', orderQty: 220, delivDate: '2026-10-30', unitPrice: 2160, orderAmt: 475200, delivTo: 'GS리테일(주)', shipTo: 'GSR 김해일배', poNo: 'PO-20261029-02', shift: '1편', remark: '오전납품', status: '확정' },
  { id: 3, gubun: '정상', partNo: '27000388782', partName: '불고기치즈김밥2편', spec: '235g', unit: 'ea', orderQty: 150, delivDate: '2026-10-30', unitPrice: 2127, orderAmt: 319050, delivTo: 'GS리테일(주)', shipTo: 'GSR 김해2일배', poNo: 'PO-20261029-03', shift: '2편', remark: '야간납품', status: '확정' },
  { id: 4, gubun: '정상', partNo: '27000388804', partName: '직화)한돈제육쌈김밥', spec: '240g', unit: 'ea', orderQty: 130, delivDate: '2026-10-30', unitPrice: 2186, orderAmt: 284180, delivTo: 'GS리테일(주)', shipTo: 'GSR 양산조리센터', poNo: 'PO-20261029-04', shift: '2편', remark: '야간납품', status: '확정' },
  { id: 5, gubun: '정상', partNo: '27000388820', partName: '더큰)오징어제육깻잎주먹밥', spec: '160g', unit: 'ea', orderQty: 350, delivDate: '2026-10-30', unitPrice: 1064, orderAmt: 372400, delivTo: 'GS리테일(주)', shipTo: 'GSR 부산물류센터', poNo: 'PO-20261029-05', shift: '1편', remark: '오전납품', status: '확정' },
  { id: 6, gubun: '정상', partNo: '27000388710', partName: '착한1900핫도그(양배추)', spec: '130g', unit: 'ea', orderQty: 90, delivDate: '2026-10-30', unitPrice: 1286, orderAmt: 115740, delivTo: 'GS리테일(주)', shipTo: 'GSR 신광주 저온', poNo: 'PO-20261029-06', shift: '1편', remark: '오전납품', status: '확정' },
  { id: 7, gubun: '정상', partNo: '27000388733', partName: '혜자)돌아온제육도시락', spec: '460g', unit: 'ea', orderQty: 240, delivDate: '2026-10-30', unitPrice: 3915, orderAmt: 939600, delivTo: 'GS리테일(주)', shipTo: 'GSR 김해일배', poNo: 'PO-20261029-07', shift: '1편', remark: '오전납품', status: '확정' },
  { id: 8, gubun: '정상', partNo: '27000388859', partName: '혜자)통등심돈까스도시락', spec: '480g', unit: 'ea', orderQty: 160, delivDate: '2026-10-30', unitPrice: 4900, orderAmt: 784000, delivTo: 'GS리테일(주)', shipTo: 'GSR 해인 CVS', poNo: 'PO-20261029-08', shift: '1편', remark: '오전납품', status: '확정' },
];

const COLUMNS: GridColumnDef[] = [
  { key: 'gubun', label: '구분', width: '60px', align: 'center' },
  { key: 'partNo', label: '품번', width: '105px', align: 'center' },
  { key: 'partName', minWidth: '260px', label: '품명', align: 'left' },
  { key: 'spec', label: '규격', width: '70px', align: 'center' },
  { key: 'unit', label: '단위', width: '45px', align: 'center' },
  { key: 'orderQty', label: '주문수량', width: '80px', align: 'right', format: 'number' },
  { key: 'delivDate', label: '납품일자', width: '90px', align: 'center', format: 'date' },
  { key: 'unitPrice', label: '납품단가', width: '85px', align: 'right', format: 'currency' },
  { key: 'orderAmt', label: '주문금액', width: '100px', align: 'right', format: 'currency' },
  { key: 'delivTo', label: '납품처', width: '110px', align: 'left' },
  { key: 'shipTo', label: '배송처', width: '120px', align: 'left' },
  { key: 'poNo', label: 'P/O no.', width: '130px', align: 'center' },
  { key: 'shift', label: '편수', width: '55px', align: 'center' },
  { key: 'remark', label: '비고', width: '110px', align: 'left' },
  { key: 'status', label: '상태', width: '60px', align: 'center' },
];

export const OrderUploadGsrView: React.FC = () => {
  const [data, setData] = useState<OrderUploadRow[]>(INITIAL_ROWS);
  const { openExcelOrderModal } = usePipeline();

  useEffect(() => {
    fetch('/api/sales/order')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: OrderUploadRow[] = [];
          json.data.forEach((o: any) => {
            (o.details || []).forEach((dt: any, dtIdx: number) => {
              loaded.push({
                id: dt.id || dtIdx + 1,
                gubun: '정규',
                partNo: dt.product?.productCode || '27000388865',
                partName: dt.product?.name || '제품',
                spec: dt.product?.spec || '230g',
                unit: dt.product?.unit || 'ea',
                orderQty: dt.totalQty || 10,
                delivDate: o.orderDate,
                unitPrice: dt.unitPrice || 2000,
                orderAmt: dt.amount || 20000,
                delivTo: o.centerCode || 'GS리테일',
                shipTo: o.centerCode || '김해물류',
                poNo: o.orderNo,
                shift: o.shift || '1편',
                remark: o.remark || '정상 접수',
                status: o.status || '완료',
              });
            });
          });
          if (loaded.length > 0) {
            setData(loaded);
          }
        }
      })
      .catch((err) => console.error('Failed to load uploaded orders', err));
  }, []);

  const handleReset = () => {
    setData(INITIAL_ROWS);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 (화면 캡처 091210.png: 초기화, 엑셀업로드, ?) */}
      <SalesActionBar
        title="주문등록GSR(upload)"
        buttons={[
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: handleReset },
          { key: 'download', label: '엑셀다운로드', icon: 'excel', variant: 'secondary', onClick: () => exportGridToExcel({ filename: '주문등록_GSR_출하내역', sheetName: '수주내역', columns: COLUMNS, data }) },
          { key: 'upload', label: '엑셀업로드', icon: 'excel', variant: 'primary', onClick: openExcelOrderModal },
        ]}
        helpContent="GS리테일 B2B EDI 시스템에서 내려받은 점포별/센터별 발주 엑셀 파일을 업로드하여 생산 및 출하 시스템으로 일괄 등록합니다."
      />

      {/* 2. 서브 헤더 바 (화면 캡처 091210.png: 최종업로드일시) */}
      <div className="h-[25px] bg-[#f8fafc] border-b border-gray-300 px-3 flex items-center justify-between text-[11px] text-gray-700 font-sans shadow-2xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-600">최종업로드일시:</span>
          <span className="font-mono text-blue-900 font-bold">2026-10-29 14:15</span>
        </div>
        <div className="text-gray-500 text-[10px]">
          GS리테일 B2B 자동수신 채널 연동 중
        </div>
      </div>

      {/* 3. 그리드 영역 (#c5c9f7 연보라 헤더, #fdfde0 하단 합계줄) */}
      <div className="flex-1 p-1 min-h-0 overflow-hidden flex flex-col">
        <SalesDataGrid columns={COLUMNS} data={data} />
      </div>
    </div>
  );
};
