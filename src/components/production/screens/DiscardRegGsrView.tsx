'use client';

import React, { useState, useEffect } from 'react';
import { ProductionActionBar } from '../common/ProductionActionBar';
import { ProductionDataGrid, ProductionGridColumnDef } from '../common/ProductionDataGrid';
import { GYE_MASTER_LIST } from '../data/productionMasterData';
import { Calendar } from 'lucide-react';

interface LeftGyeDiscardRow {
  no: number;
  id: string;
  name: string;
  discardWeight: number; // 0.0
}

interface RightPartDiscardRow {
  id: number;
  gyeId: string;
  category: string;
  partName: string;
  partSpec: string;
  unit: string;
  accumDiscard: number;
  prodDiscard: number;
  totalDiscard: number;
}

const INITIAL_LEFT_DATA: LeftGyeDiscardRow[] = GYE_MASTER_LIST.map((g) => ({
  no: g.no,
  id: g.id,
  name: g.name,
  discardWeight: 0.0,
}));

const SAMPLE_RIGHT_PARTS: RightPartDiscardRow[] = [
  // 성형장(김밥) - GFS005
  { id: 1, gyeId: 'GFS005', category: '반제품', partName: '참치마요김밥(밥김)', partSpec: '230g*1줄', unit: 'kg', accumDiscard: 1.2, prodDiscard: 0.5, totalDiscard: 1.7 },
  { id: 2, gyeId: 'GFS005', category: '원재료', partName: '김밥용 구운김(완도)', partSpec: '100장/속', unit: '속', accumDiscard: 0.0, prodDiscard: 0.0, totalDiscard: 0.0 },
  { id: 3, gyeId: 'GFS005', category: '반제품', partName: '매콤제육김밥(밥김)', partSpec: '240g*1줄', unit: 'kg', accumDiscard: 0.8, prodDiscard: 0.3, totalDiscard: 1.1 },
  // 성형장(도시락) - GFS004
  { id: 4, gyeId: 'GFS004', category: '반제품', partName: '11찬도시락 밥반찬', partSpec: '460g*1팩', unit: 'kg', accumDiscard: 2.1, prodDiscard: 0.8, totalDiscard: 2.9 },
  { id: 5, gyeId: 'GFS004', category: '부재료', partName: '도시락 ET-30 용기', partSpec: '50ea*2줄', unit: 'box', accumDiscard: 0.0, prodDiscard: 0.0, totalDiscard: 0.0 },
  // 조리실(데침/삶기) - GFS551
  { id: 6, gyeId: 'GFS551', category: '원재료', partName: '시금치(데침용)', partSpec: '10kg/상자', unit: 'kg', accumDiscard: 3.5, prodDiscard: 1.2, totalDiscard: 4.7 },
  { id: 7, gyeId: 'GFS551', category: '원재료', partName: '콩나물(데침용)', partSpec: '5kg/봉', unit: 'kg', accumDiscard: 1.0, prodDiscard: 0.4, totalDiscard: 1.4 },
  // 튀김실(튀김) - GFS501
  { id: 8, gyeId: 'GFS501', category: '반제품', partName: '등심돈까스 튀김', partSpec: '120g*10ea', unit: 'kg', accumDiscard: 1.5, prodDiscard: 0.6, totalDiscard: 2.1 },
  { id: 9, gyeId: 'GFS501', category: '원재료', partName: '치킨가라아게(냉동)', partSpec: '1kg*10팩', unit: 'kg', accumDiscard: 0.5, prodDiscard: 0.2, totalDiscard: 0.7 },
];

export const DiscardRegGsrView: React.FC = () => {
  const [discardDate, setDiscardDate] = useState('2026년 10월 30일 금요일');
  const [leftData, setLeftData] = useState<LeftGyeDiscardRow[]>(INITIAL_LEFT_DATA);
  const [selectedGyeId, setSelectedGyeId] = useState<string>('GFS005');
  const [partsData, setPartsData] = useState<RightPartDiscardRow[]>(SAMPLE_RIGHT_PARTS);

  useEffect(() => {
    fetch('/api/production/discard')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: RightPartDiscardRow[] = json.data.map((r: any) => ({
            id: r.id,
            gyeId: r.gyeId || 'GFS005',
            category: '반제품',
            partName: r.productName,
            partSpec: r.spec || '',
            unit: r.unit || 'kg',
            accumDiscard: r.discardQty,
            prodDiscard: 0,
            totalDiscard: r.discardQty,
          }));
          setPartsData(loaded);
        }
      })
      .catch((err) => console.error('Failed to load discards', err));
  }, []);

  // Selected Gye
  const selectedGye = GYE_MASTER_LIST.find((g) => g.id === selectedGyeId) || GYE_MASTER_LIST[0];

  // Filter right items
  const currentParts = partsData.filter((p) => p.gyeId === selectedGyeId);
  const displayParts = currentParts.length > 0 ? currentParts : [
    { id: 901, gyeId: selectedGyeId, category: '반제품', partName: `${selectedGye.name} 공정품목`, partSpec: '규격미정', unit: 'kg', accumDiscard: 0, prodDiscard: 0, totalDiscard: 0 },
  ];

  // Handle cell edit on right grid (production discard edit)
  const handlePartCellChange = (rowId: number, colKey: string, newVal: any) => {
    if (colKey === 'prodDiscard') {
      const numVal = Number(newVal) || 0;
      setPartsData((prev) =>
        prev.map((item) => {
          if (item.id === rowId) {
            const newTotal = Number((item.accumDiscard + numVal).toFixed(1));
            return {
              ...item,
              prodDiscard: numVal,
              totalDiscard: newTotal,
            };
          }
          return item;
        })
      );
    }
  };

  const handleSave = async () => {
    try {
      for (const item of currentParts) {
        if (item.prodDiscard > 0 || item.totalDiscard > 0) {
          await fetch('/api/production/discard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gyeId: selectedGyeId,
              gyeName: selectedGye.name,
              productName: item.partName,
              spec: item.partSpec,
              unit: item.unit,
              discardQty: item.totalDiscard,
              reason: '생산 잔품 폐기',
            }),
          });
        }
      }
      alert('폐기등록 데이터가 데이터베이스에 안전하게 저장되었습니다.');
    } catch (err: any) {
      alert('저장 중 오류: ' + err.message);
    }
  };

  const handleReset = () => {
    setLeftData(INITIAL_LEFT_DATA);
    setPartsData(SAMPLE_RIGHT_PARTS);
    alert('폐기 데이터가 초기화되었습니다.');
  };

  // Left columns
  const LEFT_COLUMNS: ProductionGridColumnDef[] = [
    { key: 'name', label: '계명칭', width: '150px', align: 'left' },
    {
      key: 'discardWeight',
      label: '폐기중량',
      width: '90px',
      align: 'right',
      render: (val) => Number(val || 0).toFixed(1),
    },
  ];

  // Right columns
  const RIGHT_COLUMNS: ProductionGridColumnDef[] = [
    { key: 'category', label: '구분', width: '70px', align: 'center' },
    { key: 'partName', minWidth: '260px', label: '파트명', align: 'left' },
    { key: 'partSpec', label: '파트규격', width: '100px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    { key: 'accumDiscard', label: '누적폐기량', width: '90px', align: 'right', format: 'number' },
    { key: 'prodDiscard', label: '생산폐기량', width: '90px', align: 'right', format: 'number', editable: true },
    { key: 'totalDiscard', label: '총폐기량', width: '90px', align: 'right', format: 'number' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <ProductionActionBar
        title="폐기등록"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('폐기 정보가 조회되었습니다.') },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: handleReset },
        ]}
        helpContent="공정 계별 및 품목별 생산 중 발생한 폐기량을 조회하고 실시간으로 등록/수정합니다."
      />

      {/* 2. 조회 조건바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-700 flex items-center gap-1">
            <Calendar size={13} className="text-blue-700" />
            폐기일:
          </span>
          <input
            type="text"
            value={discardDate}
            onChange={(e) => setDiscardDate(e.target.value)}
            className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[185px] text-center"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
            선택공정: <span className="text-blue-700 font-bold">{selectedGye.id} - {selectedGye.name}</span>
          </span>
        </div>
      </div>

      {/* 3. 좌우 2분할 레이아웃 (좌측 약 35% : 우측 약 65%) */}
      <div className="flex-1 flex min-h-0 p-2 gap-2">
        {/* 좌측: 계 목록 및 폐기중량 */}
        <div className="w-[320px] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs shrink-0">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <span className="font-bold text-gray-800">계 마스터 목록</span>
            <span className="text-[11px] font-mono text-gray-600 font-bold bg-white px-1.5 py-0.2 rounded border border-gray-300">
              46
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <ProductionDataGrid
              columns={LEFT_COLUMNS}
              data={leftData}
              selectedRowId={selectedGye.no}
              onRowClick={(row) => setSelectedGyeId(row.id)}
              summaryValues={{
                discardWeight: '0.0',
              }}
              summaryRowTitle="총합계"
            />
          </div>
        </div>

        {/* 우측: 파트별 폐기 내역 */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">세부 파트 폐기량 ▶</span>
              <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.2 rounded border border-blue-300 font-semibold">
                {selectedGye.name}
              </span>
            </div>
            <span className="text-[11px] text-gray-600 font-medium">
              품목수: <span className="font-bold text-blue-700">{displayParts.length}</span> 건
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <ProductionDataGrid
              columns={RIGHT_COLUMNS}
              data={displayParts}
              onCellChange={handlePartCellChange}
              summaryValues={{
                accumDiscard: 0,
                prodDiscard: 0,
                totalDiscard: 0,
              }}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

