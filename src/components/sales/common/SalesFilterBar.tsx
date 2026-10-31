'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Calendar } from 'lucide-react';
import { DateRangePeriod, getDateRangeForPeriod, shiftDate } from './dateUtils';

interface SalesFilterBarProps {
  label?: string;
  isSingleDate?: boolean;
  date?: string;
  onDateChange?: (date: string) => void;
  startDate?: string;
  endDate?: string;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  children?: React.ReactNode;
  onRefresh?: () => void;
  dataCount?: number;
}

export const SalesFilterBar: React.FC<SalesFilterBarProps> = ({
  label = '기준일자',
  isSingleDate = false,
  date,
  onDateChange,
  startDate,
  endDate,
  onDateRangeChange,
  children,
  onRefresh,
  dataCount,
}) => {
  const [period, setPeriod] = useState<DateRangePeriod>('daily');
  const [currentBaseDate, setCurrentBaseDate] = useState<Date>(() => new Date());

  // Handle period change (일간, 주간, 월간, 분기, 반기, 연간)
  const handlePeriodChange = (newPeriod: DateRangePeriod) => {
    setPeriod(newPeriod);
    if (!isSingleDate && onDateRangeChange) {
      const range = getDateRangeForPeriod(currentBaseDate, newPeriod);
      onDateRangeChange(range.startDate, range.endDate);
    }
  };

  // Handle navigate [<] and [>]
  const handleShift = (direction: -1 | 1) => {
    const nextDate = shiftDate(currentBaseDate, period, direction);
    setCurrentBaseDate(nextDate);

    if (isSingleDate && onDateChange) {
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const d = String(nextDate.getDate()).padStart(2, '0');
      onDateChange(`${y}-${m}-${d}`);
    } else if (onDateRangeChange) {
      const range = getDateRangeForPeriod(nextDate, period);
      onDateRangeChange(range.startDate, range.endDate);
    }
  };

  return (
    <div className="bg-[#f8fafc] border-b border-gray-300 px-3.5 py-2 flex flex-wrap items-center justify-between text-[12.5px] select-none gap-y-1.5">
      {/* Left Filter Controls */}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
        {/* Date / Date Range Filter */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-700 whitespace-nowrap flex items-center gap-1.5 text-[12px]">
            <Calendar className="w-4 h-4 text-gray-500" />
            {label}:
          </span>

          {/* Prev button */}
          <button
            type="button"
            onClick={() => handleShift(-1)}
            className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-xs cursor-pointer shadow-2xs"
            title="이전 기간"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {isSingleDate ? (
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange?.(e.target.value)}
              className="border border-gray-300 px-2 py-0.5 bg-white text-gray-800 text-[12px] focus:outline-none focus:border-blue-600 h-7 rounded-xs shadow-2xs"
            />
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onDateRangeChange?.(e.target.value, endDate || '')}
                className="border border-gray-300 px-2 py-0.5 bg-white text-gray-800 text-[12px] focus:outline-none focus:border-blue-600 h-7 rounded-xs shadow-2xs"
              />
              <span className="text-gray-500 text-[12px]">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onDateRangeChange?.(startDate || '', e.target.value)}
                className="border border-gray-300 px-2 py-0.5 bg-white text-gray-800 text-[12px] focus:outline-none focus:border-blue-600 h-7 rounded-xs shadow-2xs"
              />
            </div>
          )}

          {/* Next button */}
          <button
            type="button"
            onClick={() => handleShift(1)}
            className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-xs cursor-pointer shadow-2xs"
            title="다음 기간"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Period Radios (일간, 주간, 월간, 분기, 반기, 연간) - only if date range */}
        {!isSingleDate && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-gray-300 text-[12px] text-gray-700">
            {(
              [
                { id: 'daily', label: '일간' },
                { id: 'weekly', label: '주간' },
                { id: 'monthly', label: '월간' },
                { id: 'quarterly', label: '분기' },
                { id: 'half', label: '반기' },
                { id: 'yearly', label: '연간' },
              ] as const
            ).map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-1 cursor-pointer hover:text-blue-800 font-medium"
              >
                <input
                  type="radio"
                  name="periodRadio"
                  checked={period === item.id}
                  onChange={() => handlePeriodChange(item.id)}
                  className="cursor-pointer text-blue-600"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Screen-Specific Additional Controls (e.g. check, select, radios) */}
        {children && <div className="flex items-center gap-2.5 pl-3 border-l border-gray-300">{children}</div>}
      </div>

      {/* Right Controls: Refresh & Data Count */}
      <div className="flex items-center gap-3">
        {dataCount !== undefined && (
          <div className="text-[12px] font-semibold text-gray-700 bg-white px-2.5 py-1 border border-gray-300 rounded-xs shadow-2xs">
            데이터수: <span className="text-blue-700 font-bold">{dataCount.toLocaleString()}</span>
          </div>
        )}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 active:bg-gray-200 text-gray-700 rounded-xs cursor-pointer shadow-2xs"
            title="새로고침"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

