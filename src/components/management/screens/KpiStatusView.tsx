'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';
import { exportGridToExcel } from '@/lib/excelExport';

import { useInlineEdit } from '@/components/common/EditableCell';
import { EditableTableWrapper } from '@/components/common/EditableTableWrapper';
interface KpiRow {
  id: number;
  item: string;
  total: number;
  dailyAvg: number;
  days: number[];
}

const DAYS_IN_OCT = 31;

const KPI_METRICS: KpiRow[] = [
  {
    id: 1,
    item: '총 매출액(원)',
    total: 3179622813,
    dailyAvg: 102568478,
    days: [113835588, 108420000, 115200000, 98400000, 102500000, 105800000, 112000000, 106500000, 104200000, 118500000, 110200000, 99500000, 101800000, 104500000, 107200000, 103000000, 105000000, 114200000, 108900000, 102400000, 101500000, 103800000, 106200000, 108500000, 105400000, 102100000, 104800000, 107500000, 109200000, 105256016, 104000000],
  },
  {
    id: 2,
    item: '매출 원가(원)',
    total: 2479600000,
    dailyAvg: 79987096,
    days: [88791758, 84567600, 89856000, 76752000, 79950000, 82524000, 87360000, 83070000, 81276000, 92430000, 85956000, 77610000, 79404000, 81510000, 83616000, 80340000, 81900000, 89076000, 84942000, 79872000, 79170000, 80964000, 82836000, 84630000, 82212000, 79638000, 81744000, 83850000, 85176000, 82100000, 81120000],
  },
  {
    id: 3,
    item: '영업 이익(원)',
    total: 397452813,
    dailyAvg: 12821058,
    days: [14229448, 13552500, 14400000, 12300000, 12812500, 13225000, 14000000, 13312500, 13025000, 14812500, 13775000, 12437500, 12725000, 13062500, 13400000, 12875000, 13125000, 14275000, 13612500, 12800000, 12687500, 12975000, 13275000, 13562500, 13175000, 12762500, 13100000, 13437500, 13650000, 13157000, 13000000],
  },
  {
    id: 4,
    item: '영업이익율(%)',
    total: 12.5,
    dailyAvg: 12.5,
    days: [12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5],
  },
  {
    id: 5,
    item: '총 생산수량(ea)',
    total: 1692569,
    dailyAvg: 54599,
    days: [60800, 58000, 61500, 52600, 54800, 56500, 59800, 56900, 55700, 63200, 58900, 53200, 54400, 55800, 57200, 55000, 56100, 61000, 58200, 54700, 54200, 55500, 56800, 58000, 56300, 54600, 56000, 57400, 58300, 54599, 55600],
  },
  {
    id: 6,
    item: '생산 수량/H (1편)',
    total: 865,
    dailyAvg: 865,
    days: [885, 870, 890, 830, 845, 860, 880, 865, 855, 910, 875, 840, 850, 860, 870, 855, 865, 895, 880, 850, 845, 858, 868, 878, 862, 848, 860, 872, 880, 865, 860],
  },
  {
    id: 7,
    item: '공정 불량율(%)',
    total: 0.65,
    dailyAvg: 0.65,
    days: [0.62, 0.68, 0.65, 0.70, 0.64, 0.63, 0.60, 0.66, 0.67, 0.58, 0.63, 0.71, 0.69, 0.65, 0.62, 0.66, 0.64, 0.59, 0.62, 0.68, 0.70, 0.66, 0.63, 0.61, 0.65, 0.69, 0.64, 0.62, 0.60, 0.65, 0.64],
  },
];

const CATEGORY_PIE = [
  { name: '주먹밥/삼각김밥', value: 38, color: '#3b82f6' },
  { name: '도시락', value: 26, color: '#10b981' },
  { name: '김밥', value: 18, color: '#f59e0b' },
  { name: '샌드위치', value: 11, color: '#8b5cf6' },
  { name: '햄버거/조리면', value: 7, color: '#ec4899' },
];

export const KpiStatusView: React.FC = () => {
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('10');
  const [viewMode, setViewMode] = useState<'matrix' | 'charts'>('matrix');
  const [metrics, setMetrics] = useState<KpiRow[]>(KPI_METRICS);

  useEffect(() => {
    const kpiMonth = `${year}-${month.padStart(2, '0')}`;
    fetch(`/api/management/kpi?kpiMonth=${kpiMonth}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          // If custom KPI records exist, update metrics
        }
      })
      .catch((err) => console.error('Fetch kpi status failed:', err));
  }, [year, month]);

  // Chart trend data from days 1 to 31
  const chartData = useMemo(() => {
    return Array.from({ length: DAYS_IN_OCT }, (_, i) => ({
      day: `${i + 1}일`,
      매출액: Math.round(KPI_METRICS[0].days[i] / 10000), // 만원 단위
      영업이익: Math.round(KPI_METRICS[2].days[i] / 10000),
      생산량: KPI_METRICS[4].days[i],
      수량H: KPI_METRICS[5].days[i],
    }));
  }, []);

  // ── 인라인 편집 ──
  const { editingCell, editValue, setEditValue, startEditing, cancelEditing, isEditing } = useInlineEdit();
  const saveEdit = (rowId: string | number, colKey: string, rows: any[], setRows: (r: any[]) => void) => {
    setRows(rows.map(r => {
      const id = r.id ?? r.no ?? r.idx ?? r.index;
      if (id === rowId) {
        const numVal = Number(editValue);
        return { ...r, [colKey]: isNaN(numVal) || editValue.trim() === '' ? editValue : numVal };
      }
      return r;
    }));
    cancelEditing();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      {/* 1. 상단 액션 바 */}
      <SalesActionBar
        title="경영지표현황"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', variant: 'primary', onClick: () => alert('조회 완료') },
          { key: 'excel', label: '엑셀다운로드', icon: 'excel', variant: 'secondary', onClick: () => exportGridToExcel({ filename: '경영지표현황', sheetName: '경영지표', columns: [{ key: 'item', label: '항목' }, { key: 'total', label: '합계' }, { key: 'dailyAvg', label: '일평균' }], data: metrics }) },
          { key: 'reset', label: '초기화', icon: 'reset', variant: 'secondary', onClick: () => alert('초기화 완료') },
        ]}
        helpContent="월간 매출액, 원가, 영업이익률 및 공정 생산성 핵심 경영지표의 31일 일별 매트릭스 실적과 추세 그래프를 조회합니다."
      />

      {/* 2. 조건 검색 바 */}
      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">연도:</span>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] font-medium rounded-xs shadow-2xs w-[65px] text-center"
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

          <div className="flex items-center gap-2 pl-3 border-l border-gray-300">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[12.5px] font-bold border transition-colors ${
                viewMode === 'matrix' ? 'bg-[#3b5998] text-white border-[#2d4373]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={12} />
              31일 매트릭스 그리드
            </button>
            <button
              type="button"
              onClick={() => setViewMode('charts')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[12.5px] font-bold border transition-colors ${
                viewMode === 'charts' ? 'bg-[#3b5998] text-white border-[#2d4373]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <TrendingUp size={12} />
              경영 시각화 대시보드
            </button>
          </div>
        </div>

        <div className="text-[12.5px] text-gray-600 font-semibold bg-white px-2 py-0.5 rounded border border-gray-300 shadow-2xs">
          데이터수: <span className="font-bold text-blue-700">{KPI_METRICS.length}</span> 건
        </div>
      </div>

      {/* 3. 본문 뷰 (매트릭스 or 차트) */}
      <div className="flex-1 p-2 min-h-0 overflow-hidden flex flex-col">
        {viewMode === 'matrix' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs overflow-hidden">
            <div className="bg-[#dfe3ec] px-3 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
              <span className="font-bold text-gray-800">2026년 10월 일별 경영지표 매트릭스 (단위: 원, %, ea)</span>
              <span className="text-[12.5px] text-gray-600">가로 스크롤을 통해 1일~31일 전체 지표를 조회할 수 있습니다.</span>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              <EditableTableWrapper><table className="w-full min-w-full border-collapse text-[12.5px]">
                <thead className="sticky top-0 z-20 bg-[#c5cbf0] text-gray-800 font-bold border-b border-[#a0a0a0]">
                  <tr>
                    <th className="border border-[#a0a0a0] px-2 py-1 sticky left-0 z-30 bg-[#c5cbf0] min-w-[160px] text-left">
                      경영지표항목
                    </th>
                    <th className="border border-[#a0a0a0] px-2 py-1 sticky left-[160px] z-30 bg-[#c5cbf0] min-w-[120px] text-right">
                      합계
                    </th>
                    <th className="border border-[#a0a0a0] px-2 py-1 sticky left-[280px] z-30 bg-[#c5cbf0] min-w-[100px] text-right">
                      일평균
                    </th>
                    {Array.from({ length: DAYS_IN_OCT }, (_, i) => (
                      <th key={i} className="border border-[#a0a0a0] px-2 py-1 min-w-[85px] text-right">
                        {i + 1}일
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {KPI_METRICS.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50 border-b border-gray-200">
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 px-2 py-1 sticky left-0 z-10 bg-white font-bold text-gray-900 shadow-xs">
                        {row.item}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 px-2 py-1 sticky left-[160px] z-10 bg-white text-right font-mono font-bold text-blue-900 shadow-xs">
                        {row.total.toLocaleString()}
                      </td>
                      <td className="cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 border border-gray-300 px-2 py-1 sticky left-[280px] z-10 bg-white text-right font-mono text-gray-700 shadow-xs">
                        {row.dailyAvg.toLocaleString()}
                      </td>
                      {row.days.map((val, idx) => (
                        <td key={idx} className="border border-gray-200 px-2 py-1 text-right font-mono">
                          {val.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table></EditableTableWrapper>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto grid grid-cols-2 gap-3 p-1">
            {/* Chart 1: 일별 매출 및 영업이익 추이 */}
            <div className="bg-white border border-gray-300 rounded p-3 shadow-xs flex flex-col h-[280px]">
              <h2 className="text-[12px] font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-blue-600" />
                10월 일별 매출액 및 영업이익 추이 (단위: 만원)
              </h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="매출액" stroke="#2563eb" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="영업이익" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: 품목 카테고리별 매출 비중 */}
            <div className="bg-white border border-gray-300 rounded p-3 shadow-xs flex flex-col h-[280px]">
              <h2 className="text-[12px] font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <PieIcon size={14} className="text-emerald-600" />
                카테고리별 매출 구성비 (%)
              </h2>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={CATEGORY_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                      {CATEGORY_PIE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: 일별 생산 수량 추이 */}
            <div className="bg-white border border-gray-300 rounded p-3 shadow-xs flex flex-col h-[280px]">
              <h2 className="text-[12px] font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <BarChart3 size={14} className="text-amber-600" />
                일별 총 생산수량 추이 (개)
              </h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="생산량" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: 생산성 지표 (시간당 생산 수량) */}
            <div className="bg-white border border-gray-300 rounded p-3 shadow-xs flex flex-col h-[280px]">
              <h2 className="text-[12px] font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <Activity size={14} className="text-indigo-600" />
                라인 생산성 (생산 수량/H)
              </h2>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis domain={[800, 950]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="수량H" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

