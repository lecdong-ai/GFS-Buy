'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
import { ChartPoint } from './dashboardData';

// React 19 + Recharts defaultProps 콘솔 경고 억제 (Next.js 오버레이 방지)
if (typeof window !== 'undefined') {
  const origError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('defaultProps') || args[0].includes('Support for defaultProps'))
    ) {
      return;
    }
    origError(...args);
  };
}

interface ErpChartPanelProps {
  title: string;
  monthlyData: ChartPoint[];
  yearlyData: ChartPoint[];
  yDomain?: [number, number];
  defaultMode?: 'monthly' | 'yearly';
  showZeroLabels?: boolean;
}

export const ErpChartPanel: React.FC<ErpChartPanelProps> = ({
  title,
  monthlyData,
  yearlyData,
  yDomain = [0, 120],
  defaultMode = 'monthly',
  showZeroLabels = false,
}) => {
  const [mode, setMode] = useState<'monthly' | 'yearly'>(defaultMode);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentData = mode === 'monthly' ? monthlyData : yearlyData;

  // Custom label formatter: NaN 방지 및 안전한 좌표 계산
  const renderCustomizedLabel = (props: any) => {
    if (!props) return null;
    const { x, y, width, value } = props;
    if (
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      typeof width !== 'number' ||
      isNaN(x) ||
      isNaN(y) ||
      isNaN(width)
    ) {
      return null;
    }
    if (!value || (!showZeroLabels && value === 0)) return null;

    return (
      <text
        x={x + width / 2}
        y={y - 3}
        fill="#1e293b"
        textAnchor="middle"
        dominantBaseline="auto"
        className="text-[9px] font-medium"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="flex flex-col border border-gray-300 bg-white shadow-xs rounded-md overflow-hidden text-[12.5px]">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#f1f5f9] border-b border-gray-300 select-none">
        <div className="flex items-center gap-2 font-black text-slate-800 text-[13px]">
          <span className="text-[12px] text-blue-600 leading-none">■</span>
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode('monthly')}
            className={`px-3 py-1 text-[12px] font-bold border rounded-xs transition-colors cursor-pointer shadow-2xs ${
              mode === 'monthly'
                ? 'bg-[#2563eb] text-white border-[#1d4ed8] shadow-inner'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            당월
          </button>
          <button
            type="button"
            onClick={() => setMode('yearly')}
            className={`px-3 py-1 text-[12px] font-bold border rounded-xs transition-colors cursor-pointer shadow-2xs ${
              mode === 'yearly'
                ? 'bg-[#2563eb] text-white border-[#1d4ed8] shadow-inner'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            년
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[250px] p-2 bg-white min-h-[250px] relative">
        {isMounted ? (
          <ResponsiveContainer width="100%" height={230} minWidth={0} minHeight={0}>
            <BarChart
              data={currentData}
              margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="2 2" vertical={true} horizontal={true} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#475569' }}
                interval={mode === 'monthly' ? 1 : 0}
                tickLine={{ stroke: '#64748b' }}
                axisLine={{ stroke: '#64748b' }}
              />
              <YAxis
                domain={
                  mode === 'yearly'
                    ? [0, (dataMax: number) => Math.ceil((dataMax || 1000) * 1.15)]
                    : yDomain
                }
                tick={{ fontSize: 10, fill: '#475569' }}
                tickLine={{ stroke: '#64748b' }}
                axisLine={{ stroke: '#64748b' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartPoint;
                    return (
                      <div className="bg-white border border-gray-400 p-1.5 shadow-md text-xs">
                        <div className="font-semibold text-gray-700">
                          {mode === 'monthly' ? `${data.label}일` : data.label}
                        </div>
                        <div className="text-[#2b7de9] font-bold">
                          {data.value?.toLocaleString() ?? 0} 백만
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                fill="#2b7de9"
                maxBarSize={mode === 'monthly' ? 14 : 26}
                radius={[1, 1, 0, 0]}
              >
                <LabelList content={renderCustomizedLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            차트 로딩 중...
          </div>
        )}
      </div>
    </div>
  );
};
