'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Printer,
  FileSpreadsheet,
  X,
  FileText,
  ShieldCheck,
  Package,
  Calculator,
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Tag,
  Truck,
} from 'lucide-react';
import { usePrintReport, PrintDocumentType } from '@/context/PrintReportContext';
import { usePipeline } from '@/context/PipelineContext';
import { LotLabelPrint } from './labels/LotLabelPrint';
import { DeliveryBoxLabel } from './labels/DeliveryBoxLabel';

export const PrintReportModal: React.FC = () => {
  const { isPrintModalOpen, closePrintModal, activeDocType, setActiveDocType } = usePrintReport();
  const { dispatchedWorkOrders, depletedMaterials, pipelineCostResults } = usePipeline();

  const [shiftFilter, setShiftFilter] = useState<'1편' | '2편'>('1편');
  const printDate = '2026-10-30';

  if (!isPrintModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // ----------------------------------------------------
  // Excel Export Handler for active document
  // ----------------------------------------------------
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    if (activeDocType === 'WORK_ORDER') {
      const data = dispatchedWorkOrders.map((w, idx) => ({
        순번: idx + 1,
        공정코드: w.gyeId,
        공정명: w.gyeName,
        작업라인: w.lineName,
        품목명: w.partName,
        규격: w.partSpec,
        단위: w.unit,
        지시수량: shiftFilter === '1편' ? w.orderQty1 : w.orderQty2,
        목표투입량: w.prodQty,
        편수: shiftFilter,
        배차완료시간: w.completeTime,
        CCP점검: '중심온도 ≥75℃ / 성형실온 ≤18℃',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, '작업지시서');
      XLSX.writeFile(wb, `GFS_공정별작업지시서_${shiftFilter}_${printDate}.xlsx`);
    } else if (activeDocType === 'HACCP_INSPECTION') {
      const sampleHaccp = [
        { 순번: 1, 공급업체: '동원에프앤비', 품명: '참치통조림', 규격: '1.88kg*6캔', 입고량: 120, 유통기한: '2027-10-20', 차량청결: '적합(O)', 입고온도: '상온(21.4℃)', 외관상태: '적합(O)', 표시상태: '적합(O)', 종합판정: '합격' },
        { 순번: 2, 공급업체: '오뚜기물류', 품명: '골드마요네즈', 규격: '3.2kg*4통', 입고량: 80, 유통기한: '2027-04-15', 차량청결: '적합(O)', 입고온도: '상온(20.8℃)', 외관상태: '적합(O)', 표시상태: '적합(O)', 종합판정: '합격' },
        { 순번: 3, 공급업체: '하림', 품명: '스모크닭가슴살', 규격: '1kg*10봉', 입고량: 200, 유통기한: '2026-11-15', 차량청결: '적합(O)', 입고온도: '냉장(2.3℃)', 외관상태: '적합(O)', 표시상태: '적합(O)', 종합판정: '합격' },
        { 순번: 4, 공급업체: 'CJ제일제당', 품명: '스팸클래식', 규격: '1.81kg*6캔', 입고량: 90, 유통기한: '2028-05-10', 차량청결: '적합(O)', 입고온도: '상온(21.0℃)', 외관상태: '적합(O)', 표시상태: '적합(O)', 종합판정: '합격' },
        { 순번: 5, 공급업체: '대관령한우영농', 품명: '소불고기양념육', 규격: '10kg*5박스', 입고량: 150, 유통기한: '2026-11-05', 차량청결: '적합(O)', 입고온도: '냉장(1.8℃)', 외관상태: '적합(O)', 표시상태: '적합(O)', 종합판정: '합격' },
      ];
      const ws = XLSX.utils.json_to_sheet(sampleHaccp);
      XLSX.utils.book_append_sheet(wb, ws, '입고검수일지');
      XLSX.writeFile(wb, `GFS_HACCP_원부재료입고검수일지_${printDate}.xlsx`);
    } else if (activeDocType === 'MATERIAL_LEDGER') {
      const data = depletedMaterials.map((m, idx) => ({
        순번: idx + 1,
        자재코드: m.partCode,
        품명: m.partName,
        규격: m.partSpec,
        단위: m.unit,
        보관창고: m.warehouse,
        전일이월: m.carriedOverQty,
        당일입고: m.inQty,
        생산출고: m.outQty,
        기말재고: m.currentStock,
        안전재고: m.safetyStock,
        FEFO_LOT: m.fefoLotNo,
        유통기한: m.expiryDate,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, '자재수불부');
      XLSX.writeFile(wb, `GFS_일일자재수불부_${printDate}.xlsx`);
    } else if (activeDocType === 'COST_SHEET') {
      const data = pipelineCostResults.map((c, idx) => ({
        순번: idx + 1,
        제품코드: c.productId,
        제품명: c.productName,
        판매수량: c.salesQty,
        납품단가: c.unitPrice,
        매출액: c.salesAmount,
        직접재료비: c.directMaterialCost,
        제품물류비: c.logisticsCost,
        간접비배분: c.indirectCostAllocated,
        제조원가총액: c.totalCost,
        영업이익: c.salesProfit,
        영업이익률: `${c.profitRate}%`,
        판정: c.isLossItem ? '역마진경고' : '정상',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, '원가손익계산서');
      XLSX.writeFile(wb, `GFS_완성품원가_및_손익계산서_${printDate}.xlsx`);
    } else if (activeDocType === 'DELIVERY_STATEMENT') {
      const data = [
        { 순번: 1, 품목명: '넷플)더담은K떡볶이김밥', 규격: '230g', 단위: '개', 납품수량: 82, 단가: 2545, 공급가액: 208690, 세액: 20869 },
        { 순번: 2, 품목명: '혜자)돌아온제육도시락', 규격: '460g', 단위: 'ea', 납품수량: 45, 단가: 3915, 공급가액: 176175, 세액: 17618 },
        { 순번: 3, 품목명: '더큰)스팸계란볶음밥', 규격: '150g', 단위: 'ea', 납품수량: 209, 단가: 1180, 공급가액: 246620, 세액: 24662 },
        { 순번: 4, 품목명: '참치김치볶음김밥', 규격: '210g', 단위: '개', 납품수량: 77, 단가: 2084, 공급가액: 160468, 세액: 16047 },
        { 순번: 5, 품목명: 'THE근본김밥 1편', 규격: '200g', 단위: '개', 납품수량: 115, 단가: 1660, 공급가액: 190900, 세액: 19090 },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, '거래명세표');
      XLSX.writeFile(wb, `GFS_출하거래명세표_${printDate}.xlsx`);
    } else if (activeDocType === 'PURCHASE_ORDER') {
      const data = [
        { 순번: 1, 발주번호: 'PC25345', 공급처: '평화영농조합', 품목명: '국내산 경기미 백미(햅쌀)', 규격: '20kg/포', 단위: '포', 발주수량: 500, 단가: 54000, 발주금액: 27000000, 납기일자: '2026-10-31' },
        { 순번: 2, 발주번호: 'PC25344', 공급처: '사조오양', 품목명: '가공 참치플레이크(오일)', 규격: '1.8kg*6캔', 단위: 'box', 발주수량: 1, 단가: 84000, 발주금액: 84000, 납기일자: '2026-10-31' },
        { 순번: 3, 발주번호: 'PC25343', 공급처: '이우유통', 품목명: '골드마요네즈 3.2kg', 규격: '3.2kg*4통', 단위: 'box', 발주수량: 60, 단가: 38000, 발주금액: 2280000, 납기일자: '2026-10-31' },
        { 순번: 4, 발주번호: 'PC25341', 공급처: '한성기업', 품목명: '[냉장]다진맛살 10kg', 규격: '10kg*2ea', 단위: 'box', 발주수량: 40, 단가: 52000, 발주금액: 2080000, 납기일자: '2026-10-31' },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, '원부자재발주서');
      XLSX.writeFile(wb, `GFS_원부재료발주서_${printDate}.xlsx`);
    } else if (activeDocType === 'LOT_LABEL') {
      const data = [
        { LOT번호: 'LOT-261031-A01', 품번: '10002015', 품명: '참치마요삼각김밥', 규격: '110g', 생산일시: '2026-10-31 08:30', 유통기한: '2026-11-03 08:00', 라인: '1편 (삼각A)', 검수자: '김품질' },
        { LOT번호: 'LOT-261031-A02', 품번: '10002018', 품명: '전주비빔삼각김밥', 규격: '115g', 생산일시: '2026-10-31 09:10', 유통기한: '2026-11-03 09:00', 라인: '1편 (삼각B)', 검수자: '김품질' },
        { LOT번호: 'LOT-261031-B01', 품번: '10001021', 품명: '참치마요김밥(줄김밥)', 규격: '230g', 생산일시: '2026-10-31 09:45', 유통기한: '2026-11-02 18:00', 라인: '2편 (줄김밥)', 검수자: '이검수' },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'LOT라벨');
      XLSX.writeFile(wb, `GFS_LOT품질라벨_${printDate}.xlsx`);
    } else if (activeDocType === 'DELIVERY_BOX_LABEL') {
      const data = [
        { 박스번호: 'BOX-261031-KM01', 물류센터: 'GS리테일 김해일배센터', 센터코드: 'GSR-KMH', 품번: '10002015', 품명: '참치마요삼각김밥 30입', 박스입수: 30, 출하일시: '2026-10-31 16:00', 온도대: '저온(0~10℃)' },
        { 박스번호: 'BOX-261031-KM02', 물류센터: 'GS리테일 김해일배센터', 센터코드: 'GSR-KMH', 품번: '10002018', 품명: '전주비빔삼각김밥 30입', 박스입수: 30, 출하일시: '2026-10-31 16:00', 온도대: '저온(0~10℃)' },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, '납품박스라벨');
      XLSX.writeFile(wb, `GFS_GS25납품박스물류라벨_${printDate}.xlsx`);
    }
  };

  return (
    <>
      {/* Print Specific CSS to isolate printable paper */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-report-area,
          #printable-report-area * {
            visibility: visible !important;
          }
          #printable-report-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 select-none no-print">
        <div className="bg-[#f1f5f9] w-full max-w-5xl rounded-lg shadow-2xl border border-gray-400 flex flex-col max-h-[94vh] overflow-hidden">
          {/* Header */}
          <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-600 rounded text-white shadow-xs">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[14px] text-white">
                    ProdCore: (주)GFS 엔터프라이즈 표준 규격 출력 & 보고서 센터
                  </h3>
                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-semibold rounded border border-blue-500/30">
                    A4 규격 인쇄 및 XLSX 내보내기
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  식약처 HACCP 법정 양식 및 GS리테일 납품 공정 지시서, 일일 자재수불부, 손익계산서를 정규 서식으로 인쇄합니다.
                </p>
              </div>
            </div>

            <button
              onClick={closePrintModal}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Document Type Selector Tabs */}
          <div className="bg-white border-b border-gray-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveDocType('WORK_ORDER')}
                className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDocType === 'WORK_ORDER'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. 공정별 작업지시서</span>
              </button>

              <button
                onClick={() => setActiveDocType('HACCP_INSPECTION')}
                className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDocType === 'HACCP_INSPECTION'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2. HACCP 원료 입고검수일지</span>
              </button>

              <button
                onClick={() => setActiveDocType('MATERIAL_LEDGER')}
                className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDocType === 'MATERIAL_LEDGER'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>3. 일일 자재수불부</span>
              </button>

              <button
                onClick={() => setActiveDocType('COST_SHEET')}
                className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDocType === 'COST_SHEET'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>4. 완성품 원가 및 손익계산서</span>
              </button>

              <button
                onClick={() => setActiveDocType('DELIVERY_STATEMENT')}
                className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDocType === 'DELIVERY_STATEMENT'
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>5. 출하 거래명세표</span>
              </button>

              <button
                onClick={() => setActiveDocType('PURCHASE_ORDER')}
                className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDocType === 'PURCHASE_ORDER'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>6. 원부자재 발주서</span>
              </button>

              <button
                onClick={() => setActiveDocType('LOT_LABEL')}
                className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDocType === 'LOT_LABEL'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>7. LOT 품질 바코드 라벨</span>
              </button>

              <button
                onClick={() => setActiveDocType('DELIVERY_BOX_LABEL')}
                className={`px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeDocType === 'DELIVERY_BOX_LABEL'
                    ? 'bg-cyan-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>8. GS25 납품 박스 라벨</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {activeDocType === 'WORK_ORDER' && (
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded border border-gray-300">
                  <button
                    onClick={() => setShiftFilter('1편')}
                    className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                      shiftFilter === '1편' ? 'bg-blue-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    1편 (오전)
                  </button>
                  <button
                    onClick={() => setShiftFilter('2편')}
                    className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                      shiftFilter === '2편' ? 'bg-indigo-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    2편 (야간)
                  </button>
                </div>
              )}

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-400 rounded font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>엑셀 다운로드 (XLSX)</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>표준 서식 인쇄 (Print)</span>
              </button>
            </div>
          </div>

          {/* Printable Report Canvas Area */}
          <div className="p-4 flex-1 overflow-y-auto bg-gray-200 flex justify-center">
            {/* The Document Sheet */}
            <div
              id="printable-report-area"
              className="bg-white w-full max-w-[850px] p-8 shadow-md border border-gray-300 text-black font-sans leading-normal"
            >
              {/* Document Header & Stamp Box */}
              <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold tracking-tight">
                      (주)지에프에스 (GFS)
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      | FRESH FOOD MANUFACTURING
                    </span>
                  </div>
                  <h1 className="text-2xl font-black mt-2 tracking-tight">
                    {activeDocType === 'WORK_ORDER' && '제조공정 작업지시서 [HACCP 기준]'}
                    {activeDocType === 'HACCP_INSPECTION' && '원부재료 입고 및 위생 검수 점검표'}
                    {activeDocType === 'MATERIAL_LEDGER' && '일일 원부자재 수불 현황부'}
                    {activeDocType === 'COST_SHEET' && '제품별 원가 및 손익분석 결산서'}
                  </h1>
                  <div className="text-xs text-gray-600 mt-1 flex items-center gap-4">
                    <span>
                      <strong>작업일자:</strong> {printDate}
                    </span>
                    <span>
                      <strong>문서번호:</strong>{' '}
                      {activeDocType === 'WORK_ORDER' && `GFS-SOP-20261030-${shiftFilter === '1편' ? '01' : '02'}`}
                      {activeDocType === 'HACCP_INSPECTION' && 'GFS-QA-20261030-H01'}
                      {activeDocType === 'MATERIAL_LEDGER' && 'GFS-INV-20261030-01'}
                      {activeDocType === 'COST_SHEET' && 'GFS-COST-20261030-M10'}
                    </span>
                    <span>
                      <strong>보안등급:</strong> 대외비 (사내한)
                    </span>
                  </div>
                </div>

                {/* 3-Step Approval Stamp Box (결재란) */}
                <table className="border-collapse border border-black text-center text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black">
                      <th rowSpan={2} className="w-6 border-r border-black font-bold p-1 bg-gray-200">
                        결<br />재
                      </th>
                      <th className="w-16 border-r border-black p-1 font-semibold">담당/작성</th>
                      <th className="w-16 border-r border-black p-1 font-semibold">검토</th>
                      <th className="w-16 p-1 font-semibold">승인/공장장</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="h-12 border-t border-black">
                      <td className="border-r border-black align-bottom pb-1 text-[10px] text-gray-500 font-serif">
                        전정우
                      </td>
                      <td className="border-r border-black align-bottom pb-1 text-[10px] text-gray-400 font-serif">
                        (인)
                      </td>
                      <td className="align-bottom pb-1 text-[10px] text-gray-400 font-serif">
                        (인)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 1. WORK ORDER VIEW */}
              {activeDocType === 'WORK_ORDER' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold bg-gray-100 p-2 border border-gray-300">
                    <div>
                      <span>배송구분: </span>
                      <span className="text-blue-800 font-extrabold text-sm mr-4">{shiftFilter} 출하</span>
                      <span>대상라인: </span>
                      <span className="font-bold">46개 계 (성형장, 취반실, 조리실, 가열실)</span>
                    </div>
                    <div>
                      <span>총 지시공정수: </span>
                      <span className="font-mono font-bold text-blue-900">
                        {dispatchedWorkOrders.length}건
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-xs border-collapse border border-black">
                    <thead className="bg-gray-100 text-center font-bold border-b-2 border-black">
                      <tr>
                        <th className="border border-black py-1.5 px-1 w-8">No</th>
                        <th className="border border-black py-1.5 px-2 w-16">공정코드</th>
                        <th className="border border-black py-1.5 px-2 w-24">공정(계)명</th>
                        <th className="border border-black py-1.5 px-2">품목명 (생산/반제품)</th>
                        <th className="border border-black py-1.5 px-2 w-14">규격</th>
                        <th className="border border-black py-1.5 px-2 text-right w-16">지시량</th>
                        <th className="border border-black py-1.5 px-2 text-right w-16">투입량</th>
                        <th className="border border-black py-1.5 px-2 w-14">배차완료</th>
                        <th className="border border-black py-1.5 px-2 w-32">CCP 점검기준</th>
                        <th className="border border-black py-1.5 px-2 w-12">확인</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {dispatchedWorkOrders.map((w, idx) => (
                        <tr key={w.id} className="text-center">
                          <td className="border border-black py-1 px-1 font-mono">{idx + 1}</td>
                          <td className="border border-black py-1 px-1 font-mono font-bold">{w.gyeId}</td>
                          <td className="border border-black py-1 px-1 font-medium text-left">{w.gyeName}</td>
                          <td className="border border-black py-1 px-2 font-bold text-left">{w.partName}</td>
                          <td className="border border-black py-1 px-1 text-[10px] text-gray-700">{w.partSpec}</td>
                          <td className="border border-black py-1 px-1 font-mono font-extrabold text-right text-blue-900">
                            {(shiftFilter === '1편' ? w.orderQty1 : w.orderQty2).toLocaleString()}
                          </td>
                          <td className="border border-black py-1 px-1 font-mono text-right text-gray-800">
                            {w.prodQty.toLocaleString()}
                          </td>
                          <td className="border border-black py-1 px-1 font-mono text-[10px]">{w.completeTime}</td>
                          <td className="border border-black py-1 px-1 text-[9px] text-gray-600 text-left">
                            중심온도 ≥75℃ / 성형실온 ≤18℃
                          </td>
                          <td className="border border-black py-1 px-1 text-center font-serif text-[10px] text-gray-400">
                            (서명)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-[10px] text-gray-500 border-t border-gray-300 pt-2 flex justify-between items-center">
                    <span>* 본 작업지시서는 식품위생법 및 HACCP 선행요건에 의거하여 2년간 보관됩니다.</span>
                    <span>페이지 1 / 1</span>
                  </div>
                </div>
              )}

              {/* 2. HACCP INSPECTION VIEW */}
              {activeDocType === 'HACCP_INSPECTION' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold bg-gray-100 p-2 border border-gray-300">
                    <div>
                      <span>검수장소: </span>
                      <span className="font-bold text-gray-900 mr-4">원부재료 입고 하역장 (Dock 1~3)</span>
                      <span>검수기준: </span>
                      <span className="font-bold text-emerald-800">식약처 HACCP 입고 검수 기준서 준수</span>
                    </div>
                    <div>
                      <span>합격판정: </span>
                      <span className="font-bold text-emerald-700">전 항목 적합</span>
                    </div>
                  </div>

                  <table className="w-full text-xs border-collapse border border-black">
                    <thead className="bg-gray-100 text-center font-bold border-b-2 border-black">
                      <tr>
                        <th className="border border-black py-1.5 px-1 w-8">No</th>
                        <th className="border border-black py-1.5 px-2 w-24">협력업체</th>
                        <th className="border border-black py-1.5 px-2">원부재료 품명</th>
                        <th className="border border-black py-1.5 px-1 w-16">규격</th>
                        <th className="border border-black py-1.5 px-1 text-right w-14">입고량</th>
                        <th className="border border-black py-1.5 px-1 w-16">유통기한</th>
                        <th className="border border-black py-1.5 px-1 w-12">차량청결</th>
                        <th className="border border-black py-1.5 px-1 w-14">입고온도</th>
                        <th className="border border-black py-1.5 px-1 w-12">외관/포장</th>
                        <th className="border border-black py-1.5 px-1 w-12">표시사항</th>
                        <th className="border border-black py-1.5 px-1 w-12">종합판정</th>
                        <th className="border border-black py-1.5 px-1 w-12">검수자</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {[
                        { id: 1, vendor: '동원에프앤비', name: '참치통조림(라이트)', spec: '1.88kg*6캔', qty: 120, exp: '2027-10-20', clean: 'O', temp: '21.4℃', visual: 'O', mark: 'O', result: '적합' },
                        { id: 2, vendor: '오뚜기물류', name: '골드마요네즈', spec: '3.2kg*4통', qty: 80, exp: '2027-04-15', clean: 'O', temp: '20.8℃', visual: 'O', mark: 'O', result: '적합' },
                        { id: 3, vendor: '하림', name: '스모크닭가슴살', spec: '1kg*10봉', qty: 200, exp: '2026-11-15', clean: 'O', temp: '2.3℃', visual: 'O', mark: 'O', result: '적합' },
                        { id: 4, vendor: 'CJ제일제당', name: '스팸클래식', spec: '1.81kg*6캔', qty: 90, exp: '2028-05-10', clean: 'O', temp: '21.0℃', visual: 'O', mark: 'O', result: '적합' },
                        { id: 5, vendor: '대관령한우영농', name: '소불고기양념육', spec: '10kg*5박스', qty: 150, exp: '2026-11-05', clean: 'O', temp: '1.8℃', visual: 'O', mark: 'O', result: '적합' },
                        { id: 6, vendor: '성경식품', name: '도시락용구이김', spec: '100장*10봉', qty: 300, exp: '2027-08-30', clean: 'O', temp: '22.0℃', visual: 'O', mark: 'O', result: '적합' },
                        { id: 7, vendor: '농협양곡유통', name: '신동진 쌀(특등)', spec: '20kg*50포', qty: 1000, exp: '2027-03-01', clean: 'O', temp: '상온', visual: 'O', mark: 'O', result: '적합' },
                        { id: 8, vendor: '진미식품', name: '볶음김치토핑', spec: '5kg*4봉', qty: 160, exp: '2026-12-20', clean: 'O', temp: '3.1℃', visual: 'O', mark: 'O', result: '적합' },
                      ].map((item) => (
                        <tr key={item.id} className="text-center">
                          <td className="border border-black py-1 px-1 font-mono">{item.id}</td>
                          <td className="border border-black py-1 px-1 text-left font-medium">{item.vendor}</td>
                          <td className="border border-black py-1 px-2 text-left font-bold">{item.name}</td>
                          <td className="border border-black py-1 px-1 text-[10px] text-gray-700">{item.spec}</td>
                          <td className="border border-black py-1 px-1 font-mono font-bold text-right">{item.qty}</td>
                          <td className="border border-black py-1 px-1 font-mono text-[10px]">{item.exp}</td>
                          <td className="border border-black py-1 px-1 font-bold text-emerald-700">{item.clean}</td>
                          <td className="border border-black py-1 px-1 font-mono text-[10px]">{item.temp}</td>
                          <td className="border border-black py-1 px-1 font-bold text-emerald-700">{item.visual}</td>
                          <td className="border border-black py-1 px-1 font-bold text-emerald-700">{item.mark}</td>
                          <td className="border border-black py-1 px-1 font-bold text-blue-900 bg-blue-50/50">{item.result}</td>
                          <td className="border border-black py-1 px-1 font-serif text-[10px] text-gray-400">(인)</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-[10px] text-gray-500 border-t border-gray-300 pt-2 flex justify-between items-center">
                    <span>* 부적합 발생 시 즉시 격리보관 후 반품처리하며, 식약처 실사 시 증빙으로 제출됩니다.</span>
                    <span>페이지 1 / 1</span>
                  </div>
                </div>
              )}

              {/* 3. MATERIAL LEDGER VIEW */}
              {activeDocType === 'MATERIAL_LEDGER' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold bg-gray-100 p-2 border border-gray-300">
                    <div>
                      <span>자재구분: </span>
                      <span className="font-bold text-gray-900 mr-4">원료, 부재료, 포장재 전 품목</span>
                      <span>재고평가: </span>
                      <span className="font-bold text-indigo-800">선입선출법(FEFO) 적용</span>
                    </div>
                    <div>
                      <span>총 수불품목수: </span>
                      <span className="font-mono font-bold text-indigo-900">
                        {depletedMaterials.length}개 품목
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-xs border-collapse border border-black">
                    <thead className="bg-gray-100 text-center font-bold border-b-2 border-black">
                      <tr>
                        <th className="border border-black py-1.5 px-1 w-8">No</th>
                        <th className="border border-black py-1.5 px-2 w-18">자재코드</th>
                        <th className="border border-black py-1.5 px-2">자재품명</th>
                        <th className="border border-black py-1.5 px-1 w-14">규격</th>
                        <th className="border border-black py-1.5 px-1 w-14">창고명</th>
                        <th className="border border-black py-1.5 px-1 text-right w-14">전일이월</th>
                        <th className="border border-black py-1.5 px-1 text-right w-14">당일입고</th>
                        <th className="border border-black py-1.5 px-1 text-right w-14">생산출고</th>
                        <th className="border border-black py-1.5 px-1 text-right w-16">기말재고</th>
                        <th className="border border-black py-1.5 px-1 text-right w-14">안전재고</th>
                        <th className="border border-black py-1.5 px-1 w-20">FEFO LOT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300 font-mono">
                      {depletedMaterials.map((m, idx) => (
                        <tr key={m.id} className="text-center">
                          <td className="border border-black py-1 px-1">{idx + 1}</td>
                          <td className="border border-black py-1 px-1 font-bold text-gray-800">{m.partCode}</td>
                          <td className="border border-black py-1 px-2 font-sans font-bold text-left">{m.partName}</td>
                          <td className="border border-black py-1 px-1 text-[10px] text-gray-700">{m.partSpec}</td>
                          <td className="border border-black py-1 px-1 font-sans text-[10px]">{m.warehouse}</td>
                          <td className="border border-black py-1 px-1 text-right text-gray-600">{m.carriedOverQty.toLocaleString()}</td>
                          <td className="border border-black py-1 px-1 text-right text-emerald-700 font-bold">{m.inQty.toLocaleString()}</td>
                          <td className="border border-black py-1 px-1 text-right text-rose-700 font-bold">{m.outQty.toLocaleString()}</td>
                          <td className="border border-black py-1 px-1 text-right font-extrabold text-blue-900 bg-blue-50/30">
                            {m.currentStock.toLocaleString()}
                          </td>
                          <td className="border border-black py-1 px-1 text-right text-gray-500">{m.safetyStock.toLocaleString()}</td>
                          <td className="border border-black py-1 px-1 text-[9px] text-gray-600">{m.fefoLotNo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-[10px] text-gray-500 border-t border-gray-300 pt-2 flex justify-between items-center">
                    <span>* 본 수불부는 결산 및 세무 감사에 사용되는 법정 회계 증빙 문서입니다.</span>
                    <span>페이지 1 / 1</span>
                  </div>
                </div>
              )}

              {/* 4. COST STATEMENT VIEW */}
              {activeDocType === 'COST_SHEET' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold bg-gray-100 p-2 border border-gray-300">
                    <div>
                      <span>원가배부방식: </span>
                      <span className="font-bold text-gray-900 mr-4">직접재료비 + 간접비 배분 + 물류비(12.5%)</span>
                      <span>손익기준: </span>
                      <span className="font-bold text-amber-900">GS리테일 B2B 공급가 기준</span>
                    </div>
                    <div>
                      <span>원가분석 건수: </span>
                      <span className="font-mono font-bold text-amber-900">
                        {pipelineCostResults.length}건
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-xs border-collapse border border-black">
                    <thead className="bg-gray-100 text-center font-bold border-b-2 border-black">
                      <tr>
                        <th className="border border-black py-1.5 px-1 w-8">No</th>
                        <th className="border border-black py-1.5 px-2">대표제품명</th>
                        <th className="border border-black py-1.5 px-1 text-right w-14">판매량</th>
                        <th className="border border-black py-1.5 px-1 text-right w-16">납품단가</th>
                        <th className="border border-black py-1.5 px-1 text-right w-20">매출액</th>
                        <th className="border border-black py-1.5 px-1 text-right w-18">직접재료비</th>
                        <th className="border border-black py-1.5 px-1 text-right w-16">물류비(12.5%)</th>
                        <th className="border border-black py-1.5 px-1 text-right w-16">간접비배분</th>
                        <th className="border border-black py-1.5 px-1 text-right w-20">제조원가계</th>
                        <th className="border border-black py-1.5 px-1 text-right w-18">영업이익</th>
                        <th className="border border-black py-1.5 px-1 text-right w-14">이익률</th>
                        <th className="border border-black py-1.5 px-1 w-14">판정</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300 font-mono">
                      {pipelineCostResults.map((c, idx) => (
                        <tr key={c.id} className="text-center">
                          <td className="border border-black py-1 px-1">{idx + 1}</td>
                          <td className="border border-black py-1 px-2 font-sans font-bold text-left">{c.productName}</td>
                          <td className="border border-black py-1 px-1 text-right">{c.salesQty.toLocaleString()}</td>
                          <td className="border border-black py-1 px-1 text-right">{c.unitPrice.toLocaleString()}</td>
                          <td className="border border-black py-1 px-1 text-right font-bold text-gray-900">{c.salesAmount.toLocaleString()}</td>
                          <td className="border border-black py-1 px-1 text-right text-gray-700">{c.directMaterialCost.toLocaleString()}</td>
                          <td className="border border-black py-1 px-1 text-right text-gray-600">{c.logisticsCost.toLocaleString()}</td>
                          <td className="border border-black py-1 px-1 text-right text-gray-600">{c.indirectCostAllocated.toLocaleString()}</td>
                          <td className="border border-black py-1 px-1 text-right font-bold text-gray-900 bg-gray-50">{c.totalCost.toLocaleString()}</td>
                          <td className={`border border-black py-1 px-1 text-right font-extrabold ${c.isLossItem ? 'text-red-600 bg-red-50' : 'text-blue-900'}`}>
                            {c.salesProfit.toLocaleString()}
                          </td>
                          <td className={`border border-black py-1 px-1 text-right font-bold ${c.isLossItem ? 'text-red-600' : 'text-emerald-700'}`}>
                            {c.profitRate}%
                          </td>
                          <td className="border border-black py-1 px-1 font-sans text-[10px]">
                            {c.isLossItem ? (
                              <span className="font-bold text-red-600">역마진</span>
                            ) : (
                              <span className="text-emerald-700 font-semibold">정상</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-[10px] text-gray-500 border-t border-gray-300 pt-2 flex justify-between items-center">
                    <span>* 붉은색 표시 품목은 원가 초과로 개당 손실이 발생하는 역마진 제품입니다.</span>
                    <span>페이지 1 / 1</span>
                  </div>
                </div>
              )}

              {/* 5. 출하 거래명세표 (DELIVERY_STATEMENT) */}
              {activeDocType === 'DELIVERY_STATEMENT' && (
                <div className="flex flex-col gap-3 font-serif">
                  <div className="text-center pb-2 border-b-2 border-black">
                    <h1 className="text-2xl font-black tracking-widest text-black underline underline-offset-4">
                      거 래 명 세 표 (공급받는자 보관용)
                    </h1>
                    <div className="flex justify-between items-center text-xs mt-2 font-sans">
                      <span>발행일자: 2026년 10월 30일</span>
                      <span>거래처: GS리테일 (수도권 센터)</span>
                      <span>전표번호: TR-20261030-0192</span>
                    </div>
                  </div>

                  {/* 공급자 / 공급받는자 */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                    <table className="w-full border-collapse border border-black">
                      <tbody>
                        <tr>
                          <td rowSpan={4} className="border border-black bg-gray-100 text-center font-bold w-6">공급자</td>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold w-16">등록번호</td>
                          <td colSpan={3} className="border border-black px-1.5 py-0.5 font-bold">128-86-34892</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold">상호(법인)</td>
                          <td className="border border-black px-1.5 py-0.5">(주)GFS</td>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold w-12">성명</td>
                          <td className="border border-black px-1.5 py-0.5">박 지 훈</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold">사업장주소</td>
                          <td colSpan={3} className="border border-black px-1.5 py-0.5 text-[10px]">경기도 광주시 곤지암읍 독고개길 86-12</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold">업태/종목</td>
                          <td className="border border-black px-1.5 py-0.5">제조업</td>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold">종목</td>
                          <td className="border border-black px-1.5 py-0.5">도시락, 김밥류</td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="w-full border-collapse border border-black">
                      <tbody>
                        <tr>
                          <td rowSpan={4} className="border border-black bg-gray-100 text-center font-bold w-6">공급받는자</td>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold w-16">등록번호</td>
                          <td colSpan={3} className="border border-black px-1.5 py-0.5 font-bold">116-81-18745</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold">상호(법인)</td>
                          <td className="border border-black px-1.5 py-0.5">(주)GS리테일</td>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold w-12">성명</td>
                          <td className="border border-black px-1.5 py-0.5">허 연 수</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold">사업장주소</td>
                          <td colSpan={3} className="border border-black px-1.5 py-0.5 text-[10px]">서울시 강남구 논현로 508 GS타워</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold">업태/종목</td>
                          <td className="border border-black px-1.5 py-0.5">도소매업</td>
                          <td className="border border-black px-1.5 py-0.5 bg-gray-50 font-semibold">종목</td>
                          <td className="border border-black px-1.5 py-0.5">체인화 편의점</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 품목 내역 그리드 */}
                  <table className="w-full border-collapse border border-black text-[11px] font-sans mt-2">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black py-1 px-1 w-10 text-center">순번</th>
                        <th className="border border-black py-1 px-2 text-left">품목명</th>
                        <th className="border border-black py-1 px-1 w-16 text-center">규격</th>
                        <th className="border border-black py-1 px-1 w-12 text-center">단위</th>
                        <th className="border border-black py-1 px-2 w-16 text-right">수량</th>
                        <th className="border border-black py-1 px-2 w-20 text-right">단가</th>
                        <th className="border border-black py-1 px-2 w-24 text-right">공급가액</th>
                        <th className="border border-black py-1 px-2 w-20 text-right">세액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { no: 1, name: '넷플)더담은K떡볶이김밥', spec: '230g', unit: '개', qty: 82, price: 2545, supply: 208690, vat: 20869 },
                        { no: 2, name: '혜자)돌아온제육도시락', spec: '460g', unit: 'ea', qty: 45, price: 3915, supply: 176175, vat: 17618 },
                        { no: 3, name: '더큰)스팸계란볶음밥', spec: '150g', unit: 'ea', qty: 209, price: 1180, supply: 246620, vat: 24662 },
                        { no: 4, name: '참치김치볶음김밥', spec: '210g', unit: '개', qty: 77, price: 2084, supply: 160468, vat: 16047 },
                        { no: 5, name: 'THE근본김밥 1편', spec: '200g', unit: '개', qty: 115, price: 1660, supply: 190900, vat: 19090 },
                        { no: 6, name: '혜자)통등심돈까스도시락', spec: '450g', unit: 'ea', qty: 103, price: 4900, supply: 504700, vat: 50470 },
                      ].map((row) => (
                        <tr key={row.no} className="hover:bg-gray-50">
                          <td className="border border-black py-1 px-1 text-center">{row.no}</td>
                          <td className="border border-black py-1 px-2 font-bold">{row.name}</td>
                          <td className="border border-black py-1 px-1 text-center">{row.spec}</td>
                          <td className="border border-black py-1 px-1 text-center">{row.unit}</td>
                          <td className="border border-black py-1 px-2 text-right font-semibold">{row.qty.toLocaleString()}</td>
                          <td className="border border-black py-1 px-2 text-right">{row.price.toLocaleString()}</td>
                          <td className="border border-black py-1 px-2 text-right font-bold">{row.supply.toLocaleString()}</td>
                          <td className="border border-black py-1 px-2 text-right">{row.vat.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td colSpan={4} className="border border-black py-1 px-2 text-center">합 계</td>
                        <td className="border border-black py-1 px-2 text-right">631</td>
                        <td className="border border-black py-1 px-2 text-center">-</td>
                        <td className="border border-black py-1 px-2 text-right">1,487,553</td>
                        <td className="border border-black py-1 px-2 text-right">148,756</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="text-[11px] font-sans border border-black p-2 bg-gray-50 flex justify-between items-center mt-2">
                    <span><strong>총 청구금액:</strong> 일백육십삼만육천삼백구원 (₩ 1,636,309)</span>
                    <span>인수자 확인: ___________________ (서명)</span>
                  </div>
                </div>
              )}

              {/* 6. 원부자재 발주서 (PURCHASE_ORDER) */}
              {activeDocType === 'PURCHASE_ORDER' && (
                <div className="flex flex-col gap-3 font-serif">
                  <div className="text-center pb-2 border-b-2 border-black">
                    <h1 className="text-2xl font-black tracking-widest text-black underline underline-offset-4">
                      자 재 발 주 서 (PURCHASE ORDER)
                    </h1>
                    <div className="flex justify-between items-center text-xs mt-2 font-sans">
                      <span>발주번호: PO-20261030-0082</span>
                      <span>발주일자: 2026년 10월 30일</span>
                      <span>납기일자: 2026년 10월 31일 (06:00 이전 입고)</span>
                    </div>
                  </div>

                  <div className="border border-black p-2.5 text-xs font-sans bg-gray-50 flex justify-between">
                    <div>
                      <p><strong>수신(공급처):</strong> 평화영농조합 귀하</p>
                      <p><strong>담당자:</strong> 이창승 상무 (010-3565-92XX)</p>
                      <p><strong>납품장소:</strong> (주)GFS 곤지암 물류센터 1층 자재입고장</p>
                    </div>
                    <div className="text-right">
                      <p><strong>발신:</strong> (주)GFS 구매자재팀</p>
                      <p><strong>발주담당:</strong> 정재근 대리 (031-760-8800)</p>
                      <p><strong>검수조건:</strong> 콜드체인 온도준수 및 HACCP 검사성적서 동봉</p>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-black text-[11px] font-sans mt-2">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black py-1 px-1 w-10 text-center">순번</th>
                        <th className="border border-black py-1 px-2 text-left">품명 / 규격</th>
                        <th className="border border-black py-1 px-1 w-14 text-center">단위</th>
                        <th className="border border-black py-1 px-2 w-20 text-right">발주수량</th>
                        <th className="border border-black py-1 px-2 w-24 text-right">단가</th>
                        <th className="border border-black py-1 px-2 w-28 text-right">발주금액</th>
                        <th className="border border-black py-1 px-2 text-left">비고 및 검수기준</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { no: 1, name: '국내산 경기미 백미(햅쌀)', spec: '20kg/포', unit: '포', qty: 500, price: 54000, amt: 27000000, remark: '당일 도정미 직납, 수분 15% 이하' },
                        { no: 2, name: '가공 참치플레이크(오일)', spec: '1.8kg*6캔', unit: 'box', qty: 10, price: 84000, amt: 840000, remark: '원터치캔 파손 및 찌그러짐 검수' },
                        { no: 3, name: '골드마요네즈 3.2kg', spec: '3.2kg*4통', unit: 'box', qty: 60, price: 38000, amt: 2280000, remark: '유통기한 잔여 80% 이상' },
                        { no: 4, name: '슬라이스치즈(고소한맛)', spec: '1kg*10팩', unit: 'box', qty: 30, price: 71153, amt: 2134590, remark: '냉장 0~5℃ 유지 운송' },
                      ].map((row) => (
                        <tr key={row.no} className="hover:bg-gray-50">
                          <td className="border border-black py-1 px-1 text-center">{row.no}</td>
                          <td className="border border-black py-1 px-2 font-bold">{row.name} <span className="font-normal text-gray-500">({row.spec})</span></td>
                          <td className="border border-black py-1 px-1 text-center">{row.unit}</td>
                          <td className="border border-black py-1 px-2 text-right font-bold">{row.qty.toLocaleString()}</td>
                          <td className="border border-black py-1 px-2 text-right">{row.price.toLocaleString()}</td>
                          <td className="border border-black py-1 px-2 text-right font-extrabold text-blue-900">{row.amt.toLocaleString()}</td>
                          <td className="border border-black py-1 px-2 text-[10px] text-gray-600">{row.remark}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td colSpan={3} className="border border-black py-1 px-2 text-center">합 계</td>
                        <td className="border border-black py-1 px-2 text-right">600</td>
                        <td className="border border-black py-1 px-2 text-center">-</td>
                        <td className="border border-black py-1 px-2 text-right text-blue-900">32,254,590</td>
                        <td className="border border-black py-1 px-2 text-left text-[10px]">부가세 별도 (면세품 포함)</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="text-[10px] text-gray-600 border-t border-gray-300 pt-2 flex justify-between items-center">
                    <span>* 본 발주서는 전자문서로 발행되어 직인 날인과 동일한 효력을 가집니다.</span>
                    <span>(주)GFS 대표이사 박지훈 (인)</span>
                  </div>
                </div>
              )}

              {/* 7. LOT 품질관리 바코드 라벨 (LOT_LABEL) */}
              {activeDocType === 'LOT_LABEL' && (
                <div className="flex flex-col gap-2 font-sans">
                  <LotLabelPrint />
                </div>
              )}

              {/* 8. GS25 납품 박스 물류라벨 (DELIVERY_BOX_LABEL) */}
              {activeDocType === 'DELIVERY_BOX_LABEL' && (
                <div className="flex flex-col gap-2 font-sans">
                  <DeliveryBoxLabel />
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="bg-[#f1f5f9] border-t border-gray-300 px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="text-gray-500 text-[11px] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>(주)GFS 엔터프라이즈 ERP 공문서 출력 엔진</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={closePrintModal}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded cursor-pointer transition-colors"
              >
                닫기
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>지금 인쇄하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
