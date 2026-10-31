'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useColumnResize, ResizeHandle } from '@/components/common/useColumnResize';

export interface MasterGridColumnDef {
  key: string;
  label: string;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'number' | 'currency' | 'date' | 'checkbox' | 'dropdown' | 'button';
  editable?: boolean;
  options?: string[]; // For dropdown format
  buttonLabel?: string;
  onButtonClick?: (row: any) => void;
  sortable?: boolean;
  filterable?: boolean;
  highlightNegative?: boolean;
  isDangerText?: (val: any, row: any) => boolean; // Render text in red if true
  render?: (val: any, row: any, index: number) => React.ReactNode;
}

interface MasterDataGridProps {
  columns: MasterGridColumnDef[];
  data: any[];
  selectedRowId?: string | number | null;
  onRowClick?: (row: any, index: number) => void;
  onCellChange?: (rowId: any, columnKey: string, newValue: any) => void;
  showRowIndex?: boolean;
  summaryRow?: boolean;
  summaryRowTitle?: string;
  summaryValues?: Record<string, number | string>;
  maxHeight?: string;
  emptyMessage?: string;
  enablePagination?: boolean;
  pageSize?: number;
}

export const MasterDataGrid: React.FC<MasterDataGridProps> = ({
  columns,
  data,
  selectedRowId,
  onRowClick,
  onCellChange,
  showRowIndex = true,
  summaryRow = true,
  summaryRowTitle = '합계',
  summaryValues,
  maxHeight,
  emptyMessage = '조회된 내역이 없습니다.',
  enablePagination = false,
  pageSize = 100,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [gridData, setGridData] = useState(data);
  const { columnWidths, startResizing, getColWidth } = useColumnResize();

  useEffect(() => {
    setGridData(data);
  }, [data]);

  const [editingCell, setEditingCell] = useState<{ rowId: string | number; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEditing = (rowId: string | number, colKey: string, currentVal: any, col: MasterGridColumnDef) => {
    if (col.format === 'checkbox' || col.format === 'button' || col.editable === false) return;
    setEditingCell({ rowId, colKey });
    setEditValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : '');
  };

  const saveEdit = (rowId: string | number, colKey: string) => {
    const col = columns.find((c) => c.key === colKey);
    const parsedVal =
      col?.format === 'number' || col?.format === 'currency'
        ? editValue === ''
          ? 0
          : Number(editValue.replace(/,/g, '')) || 0
        : editValue;

    setGridData((prev) =>
      prev.map((r, idx) => {
        const match = (r.id !== undefined && r.id === rowId) || idx === rowId;
        return match ? { ...r, [colKey]: parsedVal } : r;
      })
    );

    onCellChange?.(rowId, colKey, parsedVal);
    setEditingCell(null);
  };

  // Pagination if total rows > 200 and enablePagination is true
  const displayData = useMemo(() => {
    if (!enablePagination) return gridData;
    const start = (currentPage - 1) * pageSize;
    return gridData.slice(start, start + pageSize);
  }, [gridData, enablePagination, currentPage, pageSize]);

  // Compute sums
  const computedSums = useMemo(() => {
    const sums: Record<string, number> = {};
    columns.forEach((col) => {
      if (col.format === 'number' || col.format === 'currency') {
        const total = gridData.reduce((acc, row) => {
          const val = Number(row[col.key]);
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
        sums[col.key] = total;
      }
    });
    return sums;
  }, [columns, gridData]);

  const renderCellValue = (col: MasterGridColumnDef, row: any, rowIndex: number) => {
    const rowId = row.id !== undefined ? row.id : rowIndex;
    const rawVal = row[col.key];
    const isEditing =
      editingCell !== null &&
      String(editingCell.rowId) === String(rowId) &&
      editingCell.colKey === col.key;

    if (isEditing) {
      return (
        <input
          autoFocus
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => saveEdit(rowId, col.key)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveEdit(rowId, col.key);
            } else if (e.key === 'Escape') {
              setEditingCell(null);
            }
          }}
          className="w-full h-full min-h-[26px] bg-white text-gray-900 border-2 border-blue-600 rounded-none px-1.5 py-0.5 text-[12.5px] outline-none shadow-inner"
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.target.select()}
        />
      );
    }

    if (col.render) {
      return col.render(rawVal, row, rowIndex);
    }

    if (col.format === 'button') {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            col.onButtonClick?.(row);
          }}
          className="px-1.5 py-0.2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 font-mono text-[10px] rounded border border-gray-400"
        >
          {col.buttonLabel || '...'}
        </button>
      );
    }

    if (col.format === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={Boolean(rawVal)}
          onChange={(e) => onCellChange?.(row.id ?? rowIndex, col.key, e.target.checked)}
          className="rounded cursor-pointer accent-blue-600"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    if (col.format === 'dropdown' && col.options) {
      return (
        <select
          value={rawVal || col.options[0]}
          onChange={(e) => onCellChange?.(row.id ?? rowIndex, col.key, e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-2xs text-[12px] py-0.5 px-1.5 focus:outline-blue-500"
          onClick={(e) => e.stopPropagation()}
        >
          {col.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (col.editable) {
      return (
        <input
          type={col.format === 'number' || col.format === 'currency' ? 'number' : 'text'}
          value={rawVal !== undefined && rawVal !== null ? rawVal : ''}
          onChange={(e) => {
            const val =
              col.format === 'number' || col.format === 'currency'
                ? e.target.value === ''
                  ? ''
                  : Number(e.target.value)
                : e.target.value;
            onCellChange?.(row.id ?? rowIndex, col.key, val);
          }}
          className="w-full bg-white text-right font-mono border border-blue-400 rounded-2xs px-1.5 py-0.5 text-[12px] focus:outline-blue-600"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    const num = Number(rawVal);
    const isNegative = !isNaN(num) && num < 0;
    const isDanger = col.isDangerText?.(rawVal, row) || isNegative;

    if (col.format === 'number' || col.format === 'currency') {
      const formatted = isNaN(num) ? rawVal : num.toLocaleString();
      return (
        <span className={isDanger ? 'text-red-600 font-bold' : ''}>
          {formatted}
        </span>
      );
    }

    return (
      <span className={isDanger ? 'text-red-600 font-medium' : ''}>
        {rawVal !== undefined && rawVal !== null ? String(rawVal) : ''}
      </span>
    );
  };

  return (
    <div
      className="w-full h-full flex flex-col overflow-auto bg-white border border-[#a0a0a0] text-[12.5px] select-none"
      style={{ maxHeight }}
    >
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-full border-collapse table-fixed text-gray-800">
          {/* Table Header */}
          <thead className="sticky top-0 z-20 bg-[#c0c7ea] border-b border-[#9ca3af] shadow-xs">
            <tr className="h-[32px]">
              {showRowIndex && (
                <th className="w-[42px] bg-[#b5bde6] border-r border-b border-[#a0a0a0] text-center font-bold text-gray-700 text-[11px]">
                  순번
                </th>
              )}
              {columns.map((col, idx) => {
                const colWidth = getColWidth(col.key, col.width, col.minWidth);
                return (
                  <th
                    key={idx}
                    style={{
                      width: colWidth,
                      minWidth: columnWidths[col.key] ? `${columnWidths[col.key]}px` : col.minWidth,
                    }}
                    className="relative bg-[#c2c9ee] border-r border-b border-[#a0a0a0] text-center font-bold text-gray-800 px-2 py-1.5 text-[12.5px] whitespace-nowrap select-none"
                  >
                    <div className="flex items-center justify-center">
                      <span>{col.label}</span>
                    </div>
                    <ResizeHandle onMouseDown={(e) => startResizing(col.key, e)} />
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showRowIndex ? 1 : 0)}
                  className="py-12 text-center text-gray-400 bg-gray-50 italic text-[13px]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayData.map((row, rIdx) => {
                const isSelected = selectedRowId !== undefined && (row.id === selectedRowId || row.no === selectedRowId);
                const actualIndex = enablePagination ? (currentPage - 1) * pageSize + rIdx + 1 : rIdx + 1;

                return (
                  <tr
                    key={row.id ?? rIdx}
                    onClick={() => onRowClick?.(row, rIdx)}
                    className={`h-[28px] cursor-pointer border-b border-[#d1d5db] transition-colors ${
                      isSelected
                        ? 'bg-[#dbeafe] font-semibold text-blue-900 border-l-2 border-l-blue-600 outline-1 outline-blue-500'
                        : rIdx % 2 === 1
                        ? 'bg-[#fcfdff] hover:bg-[#f1f5f9]'
                        : 'bg-white hover:bg-[#f1f5f9]'
                    }`}
                  >
                    {showRowIndex && (
                      <td className="border-r border-[#e5e7eb] text-center text-gray-500 bg-[#f8fafc] text-[11px] font-mono">
                        {row.no !== undefined ? row.no : actualIndex}
                      </td>
                    )}
                    {columns.map((col, cIdx) => {
                      const isReadOnly = col.editable === false || col.format === 'button' || col.format === 'checkbox';
                      const rowId = row.id !== undefined ? row.id : rIdx;
                      const isEditing =
                        editingCell !== null &&
                        String(editingCell.rowId) === String(rowId) &&
                        editingCell.colKey === col.key;

                      const colWidth = getColWidth(col.key, col.width, col.minWidth);

                      return (
                        <td
                          key={cIdx}
                          style={{
                            width: colWidth,
                            minWidth: columnWidths[col.key] ? `${columnWidths[col.key]}px` : col.minWidth,
                          }}
                          onClick={(e) => {
                            if (!isReadOnly) {
                              e.stopPropagation();
                              startEditing(rowId, col.key, row[col.key], col);
                            }
                          }}
                          className={`border-r border-[#e5e7eb] ${
                            isEditing ? 'p-0' : 'px-2 py-1'
                          } truncate whitespace-nowrap ${
                            !isReadOnly
                              ? 'cursor-text hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 transition-colors'
                              : ''
                          } ${
                            col.align === 'center'
                              ? 'text-center'
                              : col.align === 'right'
                              ? 'text-right font-mono'
                              : 'text-left'
                          } ${isReadOnly ? 'bg-[#f6f7f9]' : ''}`}
                        >
                          {renderCellValue(col, row, rIdx)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Summary Row */}
          {summaryRow && (
            <tfoot className="sticky bottom-0 z-10 bg-[#ffffcc] border-t-2 border-[#b0b080] text-gray-900 font-bold shadow-xs">
              <tr className="h-[30px]">
                {showRowIndex && (
                  <td className="border-r border-[#d4d4aa] text-center text-[11px] bg-[#f5f5be]">
                    계
                  </td>
                )}
                {columns.map((col, cIdx) => {
                  if (summaryValues && col.key in summaryValues) {
                    const val = summaryValues[col.key];
                    const numVal = Number(val);
                    const isNeg = !isNaN(numVal) && numVal < 0;
                    return (
                      <td
                        key={cIdx}
                        className={`border-r border-[#d4d4aa] px-2 text-right font-mono text-[12px] ${
                          isNeg ? 'text-red-600 font-bold' : 'text-gray-900'
                        }`}
                      >
                        {typeof val === 'number' ? val.toLocaleString() : val}
                      </td>
                    );
                  }

                  if (cIdx === 0 && !summaryValues) {
                    return (
                      <td
                        key={cIdx}
                        className="border-r border-[#d4d4aa] px-2 text-center text-[12px] text-gray-800"
                      >
                        {summaryRowTitle}
                      </td>
                    );
                  }

                  if (computedSums[col.key] !== undefined) {
                    const sumVal = computedSums[col.key];
                    const isNeg = sumVal < 0;
                    return (
                      <td
                        key={cIdx}
                        className={`border-r border-[#d4d4aa] px-2 text-right font-mono text-[12px] ${
                          isNeg ? 'text-red-600 font-bold' : 'text-gray-900'
                        }`}
                      >
                        {sumVal.toLocaleString()}
                      </td>
                    );
                  }

                  return <td key={cIdx} className="border-r border-[#d4d4aa] px-2" />;
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination Footer Bar for large tables */}
      {enablePagination && data.length > pageSize && (
        <div className="bg-[#f1f5f9] border-t border-[#cbd5e1] px-3.5 py-1.5 flex items-center justify-between text-[12px] text-gray-600 shrink-0">
          <span>
            총 <span className="font-bold text-blue-700">{data.length.toLocaleString()}</span> 건 중{' '}
            {((currentPage - 1) * pageSize + 1).toLocaleString()} ~{' '}
            {Math.min(currentPage * pageSize, data.length).toLocaleString()} 건 표시
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 bg-white border border-gray-300 rounded text-[11px] disabled:opacity-40"
            >
              이전
            </button>
            <span className="px-2 font-mono font-bold">
              {currentPage} / {Math.ceil(data.length / pageSize)}
            </span>
            <button
              disabled={currentPage >= Math.ceil(data.length / pageSize)}
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(data.length / pageSize), p + 1))}
              className="px-2.5 py-1 bg-white border border-gray-300 rounded text-[11px] disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

