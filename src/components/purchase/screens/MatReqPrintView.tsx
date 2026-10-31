'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '../common/PurchaseDataGrid';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { GYE_MASTER_LIST } from '@/components/production/data/productionMasterData';
import { usePrintReport } from '@/context/PrintReportContext';
import { exportGridToExcel } from '@/lib/excelExport';

interface MatReqRow {
  id: number;
  partCategory: string; // 파트구분 (원재료, 부재료, 반제품)
  partName: string; // 파트명
  partSpec: string; // 파트규격
  partUnit: string; // 파트단위
  reqCalcQty: number; // 소요계산수량
  currentStock: number; // 현재고
  safetyStock: number; // 안전재고
  gyeName: string; // 계명칭
  recipeYield: number; // 레시피수율(%)
  remark: string; // 비고
}

const SAMPLE_DATA: MatReqRow[] = [
  { id: 1, partCategory: '원재료', partName: '국내산 경기미 20kg', partSpec: '20kg/포', partUnit: 'kg', reqCalcQty: 1850.5, currentStock: 2500, safetyStock: 500, gyeName: '취반(계량)', recipeYield: 98.5, remark: '초밥용 원료곡' },
  { id: 2, partCategory: '원재료', partName: '[상온]삼각김밥김', partSpec: '100매*32ea', partUnit: '속', reqCalcQty: 120.0, currentStock: 150, safetyStock: 30, gyeName: '성형장(삼각김밥)', recipeYield: 99.0, remark: '정상 재고' },
  { id: 3, partCategory: '원재료', partName: '[냉장]다진맛살', partSpec: '10kg*2ea', partUnit: 'kg', reqCalcQty: 85.0, currentStock: 70, safetyStock: 25, gyeName: '조리실(볶음)', recipeYield: 97.0, remark: '재고 부족 주의' },
  { id: 4, partCategory: '원재료', partName: '[냉장]볶음김치', partSpec: '5kg*3ea', partUnit: 'kg', reqCalcQty: 240.0, currentStock: 300, safetyStock: 50, gyeName: '성형장(김밥)', recipeYield: 96.5, remark: '김밥용 토핑' },
  { id: 5, partCategory: '원재료', partName: '[냉장]계란구이', partSpec: '1020g*12ea', partUnit: 'ea', reqCalcQty: 520.0, currentStock: 480, safetyStock: 100, gyeName: '성형장(도시락)', recipeYield: 99.2, remark: '도시락 토핑' },
  { id: 6, partCategory: '부재료', partName: '두레)ET-30 용기', partSpec: '50ea*2줄', partUnit: 'ea', reqCalcQty: 3200, currentStock: 5000, safetyStock: 1000, gyeName: '성형장(도시락)', recipeYield: 100.0, remark: '포장 부재료' },
  { id: 7, partCategory: '원재료', partName: '성경)참돌자반', partSpec: '500g*1봉', partUnit: 'kg', reqCalcQty: 45.0, currentStock: 60, safetyStock: 15, gyeName: '계량실(계량)', recipeYield: 98.0, remark: '비빔밥용' },
  { id: 8, partCategory: '원재료', partName: '순창고추장 조미액', partSpec: '10kg*1통', partUnit: 'kg', reqCalcQty: 110.0, currentStock: 130, safetyStock: 20, gyeName: '계량실(소스류)', recipeYield: 95.0, remark: '제육양념' },
  { id: 9, partCategory: '부재료', partName: '정우)PP]5찬도시락용기', partSpec: '80ea*4pk/box', partUnit: 'ea', reqCalcQty: 2800, currentStock: 4200, safetyStock: 800, gyeName: '성형장(도시락)', recipeYield: 100.0, remark: '5찬 전용' },
  { id: 10, partCategory: '원재료', partName: '[냉동]궁채나물', partSpec: '1kg*10ea', partUnit: 'kg', reqCalcQty: 60.0, currentStock: 50, safetyStock: 15, gyeName: '조리실(데침/삶기)', recipeYield: 94.0, remark: '결품 주의' },
  { id: 11, partCategory: '원재료', partName: '골드마요네즈 3.2kg', partSpec: '3.2kg*4통', partUnit: 'kg', reqCalcQty: 75.0, currentStock: 90, safetyStock: 20, gyeName: '계량실(소스류)', recipeYield: 98.5, remark: '참치마요 배합용' },
  { id: 12, partCategory: '원재료', partName: '스팸 클래식 1.81kg', partSpec: '1.81kg*6ea', partUnit: 'kg', reqCalcQty: 140.0, currentStock: 180, safetyStock: 30, gyeName: '조리실(볶음)', recipeYield: 96.0, remark: '더큰삼각김밥용' },
];

const COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'partCategory', label: '파트구분', width: '80px', align: 'center' },
  { key: 'partName', minWidth: '260px', label: '파트명', align: 'left' },
  { key: 'partSpec', label: '파트규격', width: '120px', align: 'center' },
  { key: 'partUnit', label: '파트단위', width: '60px', align: 'center' },
  { key: 'reqCalcQty', label: '소요계산수량', width: '95px', align: 'right', format: 'number' },
  { key: 'currentStock', label: '현재고', width: '85px', align: 'right', format: 'number' },
  { key: 'safetyStock', label: '안전재고', width: '85px', align: 'right', format: 'number' },
  { key: 'gyeName', label: '계명칭', width: '130px', align: 'left' },
  { key: 'recipeYield', label: '레시피수율(%)', width: '90px', align: 'right' },
  { key: 'remark', label: '비고', width: '150px', align: 'left' },
];

export const MatReqPrintView: React.FC = () => {
  const { openPrintModal } = usePrintReport();
  const [reqDate, setReqDate] = useState('2026-10-30');
  const [selectedGye, setSelectedGye] = useState('ALL');
  const [data, setData] = useState<MatReqRow[]>(SAMPLE_DATA);

  useEffect(() => {
    fetch('/api/purchase/order-req-confirm')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: MatReqRow[] = json.data.map((r: any, idx: number) => ({
            id: r.id || idx + 1,
            partCategory: r.category || '원재료',
            partName: r.materialName || '원부자재',
            partSpec: r.spec || '',
            partUnit: r.unit || 'kg',
            reqCalcQty: r.requiredQty || 0,
            currentStock: r.currentStock || 0,
            safetyStock: 50,
            gyeName: r.gyeName || '성형장',
            recipeYield: 99.0,
            remark: r.remark || '',
          }));
          setData(loaded);
        }
      })
      .catch((err) => console.error('Failed to load mat requirements', err));
  }, []);

  const filteredData = data.filter((row) => {
    if (selectedGye !== 'ALL' && row.gyeName !== selectedGye) return false;
    return true;
  });

  const handlePrevDay = () => {
    const d = new Date(reqDate);
    d.setDate(d.getDate() - 1);
    setReqDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(reqDate);
    d.setDate(d.getDate() + 1);
    setReqDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <SalesActionBar
        title="자재소요량출력"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('자재소요량이 조회되었습니다.') },
          { key: 'print', label: '소요량출력', icon: 'print', variant: 'secondary', onClick: () => openPrintModal('MATERIAL_LEDGER') },
          {
            key: 'excel',
            label: '엑셀다운로드',
            icon: 'excel',
            variant: 'secondary',
            onClick: () =>
              exportGridToExcel({
                filename: `자재소요량_${reqDate}`,
                sheetName: '소요량산출',
                columns: COLUMNS,
                data: filteredData,
              }),
          },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => alert('조회 조건이 초기화되었습니다.') },
        ]}
        helpContent="GS리테일 일일 발주량 및 생산계획 기준으로 BOM 다단계 역산을 통해 산출된 자재 소요량을 계(공정)별로 출력합니다."
      />

      {/* 2. 조건 검색 바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-blue-700" />
              기준일자:
            </span>
            <button
              type="button"
              onClick={handlePrevDay}
              className="px-1.5 py-0.5 border border-gray-400 bg-white hover:bg-gray-100 rounded text-[11px]"
            >
              <ChevronLeft size={12} />
            </button>
            <input
              type="date"
              value={reqDate}
              onChange={(e) => setReqDate(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[130px]"
            />
            <button
              type="button"
              onClick={handleNextDay}
              className="px-1.5 py-0.5 border border-gray-400 bg-white hover:bg-gray-100 rounded text-[11px]"
            >
              <ChevronRight size={12} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">공정(계):</span>
            <select
              value={selectedGye}
              onChange={(e) => setSelectedGye(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] rounded-xs shadow-2xs"
            >
              <option value="ALL">전체 공정 (ALL)</option>
              {GYE_MASTER_LIST.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.id} - {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] text-gray-600 font-semibold bg-white px-2 py-0.5 rounded border border-gray-300 shadow-2xs">
          데이터수: <span className="font-bold text-blue-700">{filteredData.length}</span> 건
        </div>
      </div>

      {/* 3. 데이터 그리드 */}
      <div className="flex-1 p-2 min-h-0 overflow-hidden flex flex-col">
        <PurchaseDataGrid
          columns={COLUMNS}
          data={filteredData}
          summaryRowTitle="합계"
        />
      </div>
    </div>
  );
};
