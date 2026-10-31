'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { SalesFilterBar } from '@/components/sales/common/SalesFilterBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '../common/PurchaseDataGrid';
import { usePrintReport } from '@/context/PrintReportContext';
import { exportGridToExcel } from '@/lib/excelExport';

const INITIAL_STATUS_DATA = [
  { id: 1, checked: false, status: '입고완료', recvDate: '2026-10-30', orderNo: 'pc25315', orderDate: '2026-10-29', supplier: '[네트웍스]대림', type: '원재료', name: '[상온]1/2절김', spec: '200매*30ea', unit: 'box', orderPrice: 48000, orderQty: 2, orderAmt: 96000, carNo: '경기88바1234', recvQty: 2, expiryDate: '2027-10-25', carTemp: '18℃', markStatus: 'O', lookStatus: 'O', carClean: 'O', totalJudge: 'O', buyPrice: 48000, recvAmt: 96000, diffQty: 0, diffAmt: 0, lotNo: 'LOT-261029-D01', poNo: 'PO-D-01', remark: '', supplierProdId: 'DL-01' },
  { id: 2, checked: false, status: '부분입고', recvDate: '2026-10-30', orderNo: 'pc25315', orderDate: '2026-10-29', supplier: '[네트웍스]대림', type: '원재료', name: '[상온]삼각김밥김', spec: '100매*32ea', unit: 'box', orderPrice: 52000, orderQty: 4, orderAmt: 208000, carNo: '경기88바1234', recvQty: 2, expiryDate: '2027-10-25', carTemp: '18℃', markStatus: 'O', lookStatus: 'O', carClean: 'O', totalJudge: 'O', buyPrice: 52000, recvAmt: 104000, diffQty: -2, diffAmt: -104000, lotNo: 'LOT-261029-D02', poNo: 'PO-D-02', remark: '공급량 부족 분할', supplierProdId: 'DL-02' },
  { id: 3, checked: false, status: '입고완료', recvDate: '2026-10-30', orderNo: 'pc25338', orderDate: '2026-10-29', supplier: '[네트웍스]두레', type: '부재료', name: '두레)ET-30', spec: '50ea*2줄', unit: 'box', orderPrice: 38000, orderQty: 6, orderAmt: 228000, carNo: '충북80아5678', recvQty: 6, expiryDate: '2028-10-29', carTemp: '20℃', markStatus: 'O', lookStatus: 'O', carClean: 'O', totalJudge: 'O', buyPrice: 38000, recvAmt: 228000, diffQty: 0, diffAmt: 0, lotNo: 'LOT-261029-DR01', poNo: 'PO-DR-01', remark: '', supplierProdId: 'DR-ET30' },
  { id: 4, checked: false, status: '입고완료', recvDate: '2026-10-30', orderNo: 'pc25326', orderDate: '2026-10-29', supplier: '[네트웍스]CJ', type: '원재료', name: '[냉장]계란구이', spec: '1020g*12ea', unit: 'box', orderPrice: 78000, orderQty: 4, orderAmt: 312000, carNo: '서울92사7788', recvQty: 4, expiryDate: '2026-11-20', carTemp: '3.2℃', markStatus: 'O', lookStatus: 'O', carClean: 'O', totalJudge: 'O', buyPrice: 78000, recvAmt: 312000, diffQty: 0, diffAmt: 0, lotNo: 'LOT-261029-CJ01', poNo: 'PO-CJ-01', remark: '', supplierProdId: 'CJ-EGG' },
  { id: 5, checked: false, status: '입고완료', recvDate: '2026-10-30', orderNo: 'pc25322', orderDate: '2026-10-29', supplier: '[네트웍스]한성', type: '원재료', name: '[냉장]다진맛살', spec: '10kg*2ea', unit: 'box', orderPrice: 52000, orderQty: 4, orderAmt: 208000, carNo: '서울90바4455', recvQty: 4, expiryDate: '2026-11-15', carTemp: '2.8℃', markStatus: 'O', lookStatus: 'O', carClean: 'O', totalJudge: 'O', buyPrice: 52000, recvAmt: 208000, diffQty: 0, diffAmt: 0, lotNo: 'LOT-261029-HS02', poNo: 'PO-HS-01', remark: '', supplierProdId: 'HS-CRAB' },
  { id: 6, checked: false, status: '입고완료', recvDate: '2026-10-30', orderNo: 'pc25322', orderDate: '2026-10-29', supplier: '[네트웍스]한성', type: '원재료', name: '[냉장]볶음김치', spec: '5kg*3ea', unit: 'box', orderPrice: 42000, orderQty: 10, orderAmt: 420000, carNo: '서울90바4455', recvQty: 10, expiryDate: '2026-11-25', carTemp: '3.0℃', markStatus: 'O', lookStatus: 'O', carClean: 'O', totalJudge: 'O', buyPrice: 42000, recvAmt: 420000, diffQty: 0, diffAmt: 0, lotNo: 'LOT-261029-HS03', poNo: 'PO-HS-02', remark: '', supplierProdId: 'HS-KIMCHI' },
];

const COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'checked', label: '선택', width: '45px', align: 'center', format: 'checkbox', sticky: true, leftOffset: '36px' },
  { key: 'status', label: '상태', width: '65px', align: 'center', sticky: true, leftOffset: '81px' },
  { key: 'recvDate', label: '입고일', width: '85px', align: 'center', format: 'date', sticky: true, leftOffset: '146px' },
  { key: 'orderNo', label: '발주번호', width: '80px', align: 'center', sticky: true, leftOffset: '231px' },
  { key: 'orderDate', label: '발주일', width: '85px', align: 'center', format: 'date' },
  { key: 'supplier', label: '거래처', width: '110px', align: 'left' },
  { key: 'type', label: '구분', width: '60px', align: 'center' },
  { key: 'name', label: '품명', width: '180px', align: 'left' },
  { key: 'spec', label: '규격', width: '90px', align: 'center' },
  { key: 'unit', label: '단위', width: '45px', align: 'center' },
  { key: 'orderPrice', label: '발주단가', width: '80px', align: 'right', format: 'currency' },
  { key: 'orderQty', label: '발주수량', width: '65px', align: 'right', format: 'number' },
  { key: 'orderAmt', label: '발주금액(합계)', width: '100px', align: 'right', format: 'currency' },
  { key: 'carNo', label: '차량번호', width: '95px', align: 'center', editable: true },
  { key: 'recvQty', label: '입고수량', width: '70px', align: 'right', format: 'number', editable: true },
  { key: 'expiryDate', label: '유통기한', width: '95px', align: 'center', datePicker: true },
  { key: 'carTemp', label: '차량온도', width: '70px', align: 'center', editable: true },
  { key: 'markStatus', label: '표시상태', width: '60px', align: 'center', haccpToggle: true },
  { key: 'lookStatus', label: '외관상태', width: '60px', align: 'center', haccpToggle: true },
  { key: 'carClean', label: '차량청결', width: '60px', align: 'center', haccpToggle: true },
  { key: 'totalJudge', label: '종합판정', width: '60px', align: 'center', haccpToggle: true },
  { key: 'buyPrice', label: '구매단가', width: '80px', align: 'right', format: 'currency', editable: true },
  { key: 'recvAmt', label: '입고금액(합계)', width: '100px', align: 'right', format: 'currency' },
  { key: 'diffQty', label: '차이수량', width: '70px', align: 'right', format: 'number', dangerIfNegative: true },
  { key: 'diffAmt', label: '금액차이(합계)', width: '100px', align: 'right', format: 'currency', dangerIfNegative: true },
  { key: 'lotNo', label: 'LOT no.', width: '110px', align: 'center', editable: true },
  { key: 'poNo', label: 'po_no', width: '80px', align: 'center' },
  { key: 'remark', label: '비고', width: '130px', align: 'left', editable: true },
  { key: 'supplierProdId', label: '거래처제품id', width: '95px', align: 'center' },
];

export const ReceivingStatusEditView: React.FC = () => {
  const { openPrintModal } = usePrintReport();
  const [startDate, setStartDate] = useState('2026-10-30');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [selectAll, setSelectAll] = useState(false);
  const [rows, setRows] = useState(INITIAL_STATUS_DATA);

  useEffect(() => {
    fetch('/api/purchase/receiving')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: any[] = [];
          json.data.forEach((rcv: any) => {
            (rcv.details || []).forEach((dt: any, dtIdx: number) => {
              loaded.push({
                id: dt.id || dtIdx + 1,
                checked: false,
                status: rcv.status || '입고완료',
                recvDate: rcv.receivingDate,
                orderNo: rcv.receivingNo,
                orderDate: rcv.receivingDate,
                supplier: rcv.partner?.name || rcv.partnerName || '거래처',
                type: dt.product?.category || '원재료',
                name: dt.product?.name || dt.productName || '원료',
                spec: dt.product?.spec || '',
                unit: dt.unit || dt.product?.unit || 'kg',
                orderPrice: dt.unitPrice || 5000,
                orderQty: dt.receivedQty || 10,
                orderAmt: dt.amount || 50000,
                carNo: '경기88바1234',
                recvQty: dt.receivedQty || 10,
                expiryDate: dt.expiryDate || '2027-10-25',
                carTemp: '18℃',
                markStatus: 'O',
                lookStatus: 'O',
                carClean: 'O',
                totalJudge: 'O',
                buyPrice: dt.unitPrice || 5000,
                recvAmt: dt.amount || 50000,
                diffQty: 0,
                diffAmt: 0,
                lotNo: dt.lotNo || 'LOT-01',
                poNo: rcv.receivingNo,
                remark: dt.remark || '',
                supplierProdId: dt.productCode || 'PRD-01',
              });
            });
          });
          if (loaded.length > 0) {
            setRows(loaded);
          }
        }
      })
      .catch((err) => console.error('Failed to load receiving list', err));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/purchase/receiving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          receivingDate: startDate,
          partnerId: 'V001',
          items: rows.map((r) => ({
            productId: 1,
            productCode: r.supplierProdId,
            productName: r.name,
            lotNo: r.lotNo,
            expiryDate: r.expiryDate,
            receivedQty: r.recvQty,
            unit: r.unit,
            unitPrice: r.buyPrice,
            amount: r.recvAmt,
            warehouse: '상온보관고',
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('입고 수정사항이 데이터베이스에 안전하게 저장되었습니다.');
      } else {
        alert('저장 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('저장 중 오류: ' + err.message);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setRows((prev) => prev.map((r) => ({ ...r, checked })));
  };

  const handleRowChange = (id: any, key: string, val: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, [key]: val };
          if (key === 'recvQty' || key === 'buyPrice') {
            const qty = Number(key === 'recvQty' ? val : updated.recvQty) || 0;
            const price = Number(key === 'buyPrice' ? val : updated.buyPrice) || 0;
            updated.recvAmt = qty * price;
            updated.diffQty = qty - updated.orderQty;
            updated.diffAmt = updated.recvAmt - updated.orderAmt;
          }
          return updated;
        }
        return r;
      })
    );
  };

  const handleDeleteSelected = () => {
    setRows((prev) => prev.filter((r) => !r.checked));
    alert('선택된 입고 내역이 삭제되었습니다.');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none">
      <SalesActionBar
        title="입고현황/수정"
        buttons={[
          { key: 'print', label: 'HACCP검수일지인쇄(A4)', icon: 'print', variant: 'secondary', onClick: () => openPrintModal('HACCP_INSPECTION') },
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          { key: 'save', label: '저장', icon: 'save', variant: 'secondary', onClick: handleSave },
          { key: 'delete', label: '삭제', icon: 'delete', variant: 'danger', onClick: handleDeleteSelected },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => setRows(INITIAL_STATUS_DATA) },
          { key: 'excel', label: '엑셀다운로드', icon: 'excel', variant: 'secondary', onClick: () => exportGridToExcel({ filename: '입고현황수정', sheetName: '입고현황', columns: COLUMNS, data: rows }) },
        ]}
        helpContent="기 등록된 입고 내역을 29개 전체 컬럼으로 조회하고, 수량/단가/검수 결과 변경 시 실시간으로 차이 금액을 재계산합니다."
      />

      <SalesFilterBar
        label="입고일자"
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
        }}
        dataCount={rows.length}
        onRefresh={() => alert('새로고침')}
      >
        <label className="flex items-center gap-1 font-semibold text-gray-800 cursor-pointer">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="cursor-pointer"
          />
          <span>전체선택</span>
        </label>

        <div className="flex items-center gap-1.5 pl-2 border-l border-gray-300">
          <span className="font-semibold text-gray-700 text-[11px]">매입처:</span>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="border border-gray-300 px-1 py-0.5 bg-white text-gray-800 text-[11px] h-5"
          >
            <option value="ALL">ALL (전체 매입처)</option>
            <option value="대림">[네트웍스]대림</option>
            <option value="두레">[네트웍스]두레</option>
            <option value="CJ">[네트웍스]CJ</option>
            <option value="한성">[네트웍스]한성</option>
          </select>
        </div>
      </SalesFilterBar>

      <div className="flex-1 p-1.5 min-h-0 overflow-hidden flex flex-col">
        <PurchaseDataGrid
          columns={COLUMNS}
          data={rows}
          onRowChange={handleRowChange}
        />
      </div>
    </div>
  );
};

