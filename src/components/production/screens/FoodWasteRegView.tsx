'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ProductionActionBar } from '../common/ProductionActionBar';
import { ProductionDataGrid, ProductionGridColumnDef } from '../common/ProductionDataGrid';
import { GYE_MASTER_LIST } from '../data/productionMasterData';
import { Calendar, Trash2 } from 'lucide-react';

interface FoodWasteRow {
  no: number;
  id: string;
  name: string;
  prevWaste: number; // 기폐기량계(kg)
  currentWaste: number; // 폐기량(kg) (editable)
  totalWaste: number; // 총폐기량(kg) (prev + current)
  remark: string; // 비고 (editable)
}

const INITIAL_WASTE_DATA: FoodWasteRow[] = GYE_MASTER_LIST.map((g, idx) => {
  // Give a couple of sample numbers
  let prev = 0;
  let curr = 0;
  let rmk = '';
  if (g.name.includes('선별실')) {
    prev = 15;
    curr = 5;
    rmk = '원채 세척 부산물';
  } else if (g.name.includes('채소작업실')) {
    prev = 22;
    curr = 8;
    rmk = '뿌리 및 껍질 절단';
  } else if (g.name.includes('성형장(도시락)')) {
    prev = 12;
    curr = 3;
    rmk = '반찬 잔여물';
  } else if (g.name.includes('성형장(김밥)')) {
    prev = 10;
    curr = 4;
    rmk = '김밥 꼬투리';
  }

  return {
    no: g.no,
    id: g.id,
    name: g.name,
    prevWaste: prev,
    currentWaste: curr,
    totalWaste: prev + curr,
    remark: rmk,
  };
});

export const FoodWasteRegView: React.FC = () => {
  const [baseDate, setBaseDate] = useState('2026년 10월 30일 금요일');
  const [wasteData, setWasteData] = useState<FoodWasteRow[]>(INITIAL_WASTE_DATA);

  useEffect(() => {
    fetch('/api/production/food-waste')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const map: Record<string, number> = {};
          json.data.forEach((w: any) => {
            map[w.gyeId] = (map[w.gyeId] || 0) + w.wasteQty;
          });
          setWasteData((prev) =>
            prev.map((item) => ({
              ...item,
              prevWaste: map[item.id] || item.prevWaste,
              totalWaste: (map[item.id] || item.prevWaste) + item.currentWaste,
            }))
          );
        }
      })
      .catch((err) => console.error('Failed to load food waste', err));
  }, []);

  // Handle cell edit on 폐기량 or 비고
  const handleCellChange = (no: number, colKey: string, newVal: any) => {
    setWasteData((prev) =>
      prev.map((item) => {
        if (item.no === no) {
          if (colKey === 'currentWaste') {
            const num = Number(newVal) || 0;
            return {
              ...item,
              currentWaste: num,
              totalWaste: item.prevWaste + num,
            };
          }
          if (colKey === 'remark') {
            return {
              ...item,
              remark: String(newVal),
            };
          }
        }
        return item;
      })
    );
  };

  // Real-time sums for summary row
  const summaryTotals = useMemo(() => {
    const prevSum = wasteData.reduce((acc, row) => acc + row.prevWaste, 0);
    const currSum = wasteData.reduce((acc, row) => acc + row.currentWaste, 0);
    const totalSum = wasteData.reduce((acc, row) => acc + row.totalWaste, 0);
    return {
      prevWaste: prevSum,
      currentWaste: currSum,
      totalWaste: totalSum,
    };
  }, [wasteData]);

  const handleSave = async () => {
    try {
      for (const item of wasteData) {
        if (item.currentWaste > 0) {
          await fetch('/api/production/food-waste', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gyeId: item.id,
              gyeName: item.name,
              wasteType: '조리잔여물',
              wasteQty: item.currentWaste,
              remark: item.remark,
            }),
          });
        }
      }
      alert(`음식물쓰레기 등록 완료! (데이터베이스에 안전하게 저장되었습니다)`);
    } catch (err: any) {
      alert('저장 중 오류: ' + err.message);
    }
  };

  const handleReset = () => {
    setWasteData(INITIAL_WASTE_DATA);
    alert('음식물쓰레기 등록 데이터가 초기화되었습니다.');
  };

  const COLUMNS: ProductionGridColumnDef[] = [
    { key: 'name', label: '계명칭', width: '150px', align: 'left' },
    {
      key: 'prevWaste',
      label: '기폐기량계(kg)',
      width: '110px',
      align: 'right',
      format: 'number',
      editable: false,
    },
    {
      key: 'currentWaste',
      label: '폐기량(kg)',
      width: '100px',
      align: 'right',
      format: 'number',
      editable: true,
    },
    {
      key: 'totalWaste',
      label: '총폐기량(kg)',
      width: '110px',
      align: 'right',
      format: 'number',
      editable: false,
    },
    {
      key: 'remark',
      label: '비고',
      width: '200px',
      align: 'left',
      editable: true,
    },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <ProductionActionBar
        title="음식물쓰레기등록"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('음식물쓰레기 실적이 조회되었습니다.') },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: handleReset },
        ]}
        helpContent="각 작업장 계별 당일 발생한 음식물쓰레기(kg)를 입력하여 환경 관리 및 폐기 비용 산출의 기초 데이터로 활용합니다."
      />

      {/* 2. 조회 조건바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-700 flex items-center gap-1">
            <Calendar size={13} className="text-blue-700" />
            기준일자:
          </span>
          <input
            type="text"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[185px] text-center"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
            당일 폐기량 합계: <span className="text-red-600 font-bold">{summaryTotals.currentWaste.toLocaleString()}</span> kg
          </span>
          <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
            누적 총폐기량: <span className="text-blue-700 font-bold">{summaryTotals.totalWaste.toLocaleString()}</span> kg
          </span>
        </div>
      </div>

      {/* 3. 그리드 영역 */}
      <div className="flex-1 min-h-0 p-2 flex gap-3">
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <Trash2 size={13} className="text-gray-700" />
                계별 음식물쓰레기 실적 등록
              </span>
              <span className="text-[11px] text-gray-500 font-normal">
                (폐기량 입력 시 총폐기량 실시간 자동 연산)
              </span>
            </div>
            <span className="text-[11px] font-mono text-gray-600 font-bold bg-white px-1.5 py-0.2 rounded border border-gray-300">
              46개 공정
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <ProductionDataGrid
              columns={COLUMNS}
              data={wasteData}
              onCellChange={handleCellChange}
              summaryValues={{
                prevWaste: summaryTotals.prevWaste,
                currentWaste: summaryTotals.currentWaste,
                totalWaste: summaryTotals.totalWaste,
              }}
              summaryRowTitle="합계"
            />
          </div>
        </div>

        {/* 우측 안내 정보 카드 (여백 활용) */}
        <div className="hidden xl:flex flex-col ml-3 w-80 bg-white border border-[#94a3b8] rounded p-3 text-gray-700 shadow-xs h-fit gap-2">
          <h3 className="font-bold text-[12px] text-gray-800 border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            음식물쓰레기 집계 현황 안내
          </h3>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            - <strong>기폐기량계(kg)</strong>: 당월 누적 또는 전일 차수까지 계근 완료된 폐기량 (수정 불가).<br />
            - <strong>폐기량(kg)</strong>: 오늘 각 공정에서 추가 계근된 폐기량 (흰색 셀 직접 입력).<br />
            - <strong>총폐기량(kg)</strong>: 기폐기량과 오늘 폐기량이 실시간으로 자동 합산됩니다.<br />
            - 작업 완료 후 상단 <strong>[저장]</strong> 버튼을 반드시 눌러주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

