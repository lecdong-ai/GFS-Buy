'use client';

import React, { useState, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { PurchaseDataGrid, PurchaseGridColumnDef } from '@/components/purchase/common/PurchaseDataGrid';

interface KpiRegRow {
  id: number;
  kpiName: string; // 경영지표항목
  targetValue: number; // 목표값 (입력 가능)
  unit: string; // 단위
  description: string; // 설명/비고
}

const SAMPLE_KPI_REG_DATA: KpiRegRow[] = [
  { id: 1, kpiName: '영업일수', targetValue: 31, unit: '일', description: '2026년 10월 총 운영일수' },
  { id: 2, kpiName: '월간 목표매출액', targetValue: 3300000000, unit: '원', description: '월 33억원 목표' },
  { id: 3, kpiName: '목표 영업이익율', targetValue: 12.5, unit: '%', description: '영업이익율 12% 이상 유지' },
  { id: 4, kpiName: '월간 목표생산수량', targetValue: 1750000, unit: 'ea', description: '일평균 5.6만개 생산' },
  { id: 5, kpiName: '생산 수량/H (1편 목표)', targetValue: 850, unit: 'ea/시간', description: '시간당 생산라인 생산성 지표' },
  { id: 6, kpiName: '허용 불량율 한도', targetValue: 0.8, unit: '%', description: '공정 불량 및 폐기 한도율' },
];

const COLUMNS: PurchaseGridColumnDef[] = [
  { key: 'id', label: '순번', width: '60px', align: 'center', sticky: true, leftOffset: '36px' },
  { key: 'kpiName', label: '경영지표항목', width: '220px', align: 'left', sticky: true, leftOffset: '96px' },
  { key: 'targetValue', label: '목표설정값', width: '140px', align: 'right', format: 'number', editable: true },
  { key: 'unit', label: '단위', width: '80px', align: 'center' },
  { key: 'description', label: '지표 설명 및 산출 기준', minWidth: '350px', align: 'left', editable: true },
];

export const KpiRegView: React.FC = () => {
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('10');
  const [rows, setRows] = useState(SAMPLE_KPI_REG_DATA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const kpiMonth = `${year}-${month.padStart(2, '0')}`;
    fetch(`/api/management/kpi?kpiMonth=${kpiMonth}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const mapped: KpiRegRow[] = json.data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            kpiName: item.kpiItem || '경영지표',
            targetValue: Number(item.targetValue) || 0,
            unit: item.unit || '건',
            description: item.remark || '',
          }));
          setRows(mapped);
        }
      })
      .catch((err) => console.error('Fetch kpi failed:', err));
  }, [year, month]);

  const handleCellChange = (id: any, key: string, val: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: key === 'targetValue' ? Number(val) || 0 : val } : r))
    );
  };

  const handleSave = async () => {
    const kpiMonth = `${year}-${month.padStart(2, '0')}`;
    setLoading(true);
    try {
      const res = await fetch('/api/management/kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: rows.map((r) => ({
            kpiMonth,
            kpiItem: r.kpiName,
            targetValue: r.targetValue,
            unit: r.unit,
            remark: r.description,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${year}년 ${month}월 경영지표 목표 설정이 완료되었습니다.`);
      } else {
        alert('저장 중 오류: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (e: any) {
      alert('저장 실패: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <SalesActionBar
        title="경영지표등록"
        buttons={[
          { key: 'save', label: '저장', icon: 'save', variant: 'primary', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => setRows(SAMPLE_KPI_REG_DATA) },
        ]}
        helpContent="월별 매출 목표, 생산 목표량, 영업이익률 및 공정 생산성 핵심성과지표(KPI)를 등록합니다."
      />

      {/* 2. 조건 검색 바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">연도:</span>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[70px] text-center"
            />
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">월:</span>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[50px] text-center"
            />
          </div>
        </div>

        <div className="text-[11px] text-gray-600 font-semibold bg-white px-2 py-0.5 rounded border border-gray-300 shadow-2xs">
          데이터수: <span className="font-bold text-blue-700">{rows.length}</span> 건
        </div>
      </div>

      {/* 3. 데이터 그리드 */}
      <div className="flex-1 p-2 min-h-0 overflow-hidden flex flex-col">
        <PurchaseDataGrid
          columns={COLUMNS}
          data={rows}
          onCellChange={handleCellChange}
        />
      </div>
    </div>
  );
};

