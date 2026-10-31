'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useColumnResize – 테이블 컬럼 너비를 마우스 드래그로 자유롭게 조절하는 공용 훅
 * 
 * - 최소 너비(기본 40px) 보장
 * - 마우스 드래그 시 부드러운 실시간 리사이징
 * - 마우스 커서 및 텍스트 선택 방지 처리
 */
export function useColumnResize(initialWidths?: Record<string, number>) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(initialWidths || {});
  const resizingRef = useRef<{
    colKey: string;
    startX: number;
    startWidth: number;
    minWidth: number;
  } | null>(null);

  const startResizing = useCallback(
    (colKey: string, e: React.MouseEvent, currentWidthPx?: number, minWidthPx = 40) => {
      e.preventDefault();
      e.stopPropagation();

      // Find the parent <th> element to measure accurate current width
      const th = (e.currentTarget as HTMLElement).closest('th');
      const startWidth = currentWidthPx || (th ? th.offsetWidth : 100);

      resizingRef.current = {
        colKey,
        startX: e.clientX,
        startWidth,
        minWidth: minWidthPx,
      };

      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';

      const handleMouseMove = (me: MouseEvent) => {
        if (!resizingRef.current) return;
        const { colKey: key, startX, startWidth: sWidth, minWidth: mWidth } = resizingRef.current;
        const diff = me.clientX - startX;
        const newWidth = Math.max(mWidth, sWidth + diff);

        setColumnWidths((prev) => ({
          ...prev,
          [key]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        resizingRef.current = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    []
  );

  const getColWidth = useCallback(
    (key: string, defaultWidth?: string | number, defaultMinWidth?: string | number) => {
      if (columnWidths[key] !== undefined) {
        return `${columnWidths[key]}px`;
      }
      if (defaultWidth !== undefined) {
        return typeof defaultWidth === 'number' ? `${defaultWidth}px` : defaultWidth;
      }
      if (defaultMinWidth !== undefined) {
        return typeof defaultMinWidth === 'number' ? `${defaultMinWidth}px` : defaultMinWidth;
      }
      return undefined;
    },
    [columnWidths]
  );

  return { columnWidths, setColumnWidths, startResizing, getColWidth };
}

/**
 * ResizeHandle – 각 <th> 헤더 우측에 들어가는 드래그 핸들 UI 컴포넌트
 */
export const ResizeHandle: React.FC<{
  onMouseDown: (e: React.MouseEvent) => void;
  className?: string;
}> = ({ onMouseDown, className = '' }) => {
  return (
    <div
      onMouseDown={onMouseDown}
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-0 right-0 bottom-0 w-2 cursor-col-resize group hover:bg-blue-500/40 active:bg-blue-600 select-none z-30 flex items-center justify-center ${className}`}
      title="마우스 드래그로 열 너비 조절"
    >
      <div className="w-[1.5px] h-3.5 bg-gray-400 group-hover:bg-blue-600 transition-colors" />
    </div>
  );
};

