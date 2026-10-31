'use client';

import React from 'react';
import { useColumnResize, ResizeHandle } from '@/components/common/useColumnResize';

export interface ProductionColumnGroup {
  groupLabel: string;
  subColumns: ProductionGridColumnDef[];
}

export interface ProductionGridColumnDef {
  key: string;
  label: string;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'number' | 'currency' | 'date' | 'checkbox' | 'dropdown' | 'input';
  editable?: boolean;
  options?: string[]; // For dropdown format
  sortable?: boolean;
  filterable?: boolean;
  highlightNegative?: boolean; // Highlight negative values in bold red
  render?: (val: any, row: any, index: number) => React.ReactNode;
}

export type GridColumnItem = ProductionGridColumnDef | ProductionColumnGroup;

export function isColumnGroup(item: GridColumnItem): item is ProductionColumnGroup {
  return 'groupLabel' in item && Array.isArray((item as ProductionColumnGroup).subColumns);
}

interface ProductionDataGridProps {
  columns: GridColumnItem[];
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
}

export const ProductionDataGrid: React.FC<ProductionDataGridProps> = ({
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
  emptyMessage = '조회된 데이터가 없습니다.',
}) => {
  const [gridData, setGridData] = React.useState(data);
  const { columnWidths, startResizing, getColWidth } = useColumnResize();
  React.useEffect(() => {
    setGridData(data);
  }, [data]);

  const [editingCell, setEditingCell] = React.useState<{ rowId: string | number; colKey: string } | null>(null);
  const [editValue, setEditValue] = React.useState<string>('');

  const startEditing = (rowId: string | number, colKey: string, currentVal: any, col: ProductionGridColumnDef) => {
    if (col.format === 'checkbox' || col.editable === false) return;
    setEditingCell({ rowId, colKey });
    setEditValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : '');
  };

  const saveEdit = (rowId: string | number, colKey: string) => {
    const col = flatColumns.find((c) => c.key === colKey);
    const parsedVal =
      col?.format === 'number' || col?.format === 'currency'
        ? editValue === '' ? 0 : Number(editValue.replace(/,/g, '')) || 0
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
  // Check if 2-tier grouping exists
  const hasGroups = columns.some(isColumnGroup);

  // Flattened column list for data rendering
  const flatColumns: ProductionGridColumnDef[] = React.useMemo(() => {
    const list: ProductionGridColumnDef[] = [];
    columns.forEach((col) => {
      if (isColumnGroup(col)) {
        list.push(...col.subColumns);
      } else {
        list.push(col);
      }
    });
    return list;
  }, [columns]);

  // Calculate default auto-sums if not explicitly provided
  const computedSums = React.useMemo(() => {
    const sums: Record<string, number> = {};
    flatColumns.forEach((col) => {
      if (col.format === 'number' || col.format === 'currency') {
        const total = gridData.reduce((acc, row) => {
          const val = Number(row[col.key]);
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
        sums[col.key] = total;
      }
    });
    return sums;
  }, [flatColumns, data]);

  const renderCellValue = (col: ProductionGridColumnDef, row: any, rowIndex: number) => {
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
            if (e.key === 'Enter') saveEdit(rowId, col.key);
            else if (e.key === 'Escape') setEditingCell(null);
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
          type={col.format === 'number' ? 'number' : 'text'}
          value={rawVal !== undefined && rawVal !== null ? rawVal : ''}
          onChange={(e) => {
            const val = col.format === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
            onCellChange?.(row.id ?? rowIndex, col.key, val);
          }}
          className="w-full bg-white text-right font-mono border border-blue-400 rounded-2xs px-1.5 py-0.5 text-[12px] focus:outline-blue-600 focus:ring-1 focus:ring-blue-600"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    // Check negative number
    const num = Number(rawVal);
    const isNegative = !isNaN(num) && num < 0;

    if (col.format === 'number') {
      const formatted = isNaN(num) ? rawVal : num.toLocaleString();
      return (
        <span className={isNegative || col.highlightNegative && isNegative ? 'text-red-600 font-semibold' : ''}>
          {formatted}
        </span>
      );
    }

    if (col.format === 'currency') {
      const formatted = isNaN(num) ? rawVal : num.toLocaleString();
      return (
        <span className={isNegative || col.highlightNegative && isNegative ? 'text-red-600 font-semibold' : ''}>
          {formatted}
        </span>
      );
    }

    return (
      <span className={col.highlightNegative && isNegative ? 'text-red-600 font-semibold' : ''}>
        {rawVal !== undefined && rawVal !== null ? String(rawVal) : ''}
      </span>
    );
  };

  return (
    <div
      className="w-full h-full flex flex-col overflow-auto bg-white border border-[#a0a0a0] text-[12.5px] select-none"
      style={{ maxHeight }}
    >
      <table className="w-full min-w-full border-collapse table-fixed text-gray-800">
        {/* Table Header */}
        <thead className="sticky top-0 z-20 bg-[#c0c7ea] border-b border-[#9ca3af] shadow-xs">
          {hasGroups ? (
            <>
              {/* Row 1: Groups & Spanning Single Columns */}
              <tr className="h-[28px]">
                {showRowIndex && (
                  <th
                    rowSpan={2}
                    className="w-[42px] bg-[#b5bde6] border-r border-b border-[#a0a0a0] text-center font-bold text-gray-700 text-[11px]"
                  >
                    순번
                  </th>
                )}
                {columns.map((col, idx) => {
                  if (isColumnGroup(col)) {
                    return (
                      <th
                        key={idx}
                        colSpan={col.subColumns.length}
                        className="bg-[#bcc4eb] border-r border-b border-[#a0a0a0] text-center font-bold text-gray-800 px-2 py-1 text-[12px]"
                      >
                        {col.groupLabel}
                      </th>
                    );
                  }
                  const colWidth = getColWidth(col.key, col.width, col.minWidth);
                  return (
                    <th
                      key={idx}
                      rowSpan={2}
                      style={{
                        width: colWidth,
                        minWidth: columnWidths[col.key] ? `${columnWidths[col.key]}px` : col.minWidth,
                      }}
                      className="relative bg-[#c2c9ee] border-r border-b border-[#a0a0a0] text-center font-bold text-gray-800 px-2 text-[12.5px] select-none whitespace-nowrap"
                    >
                      <div className="flex items-center justify-center">
                        <span>{col.label}</span>
                      </div>
                      <ResizeHandle onMouseDown={(e) => startResizing(col.key, e)} />
                    </th>
                  );
                })}
              </tr>

              {/* Row 2: Sub-columns of Groups */}
              <tr className="h-[26px]">
                {columns.map((col) => {
                  if (isColumnGroup(col)) {
                    return col.subColumns.map((sub, sIdx) => {
                      const subWidth = getColWidth(sub.key, sub.width, sub.minWidth);
                      return (
                        <th
                          key={`${col.groupLabel}-${sIdx}`}
                          style={{
                            width: subWidth,
                            minWidth: columnWidths[sub.key] ? `${columnWidths[sub.key]}px` : sub.minWidth,
                          }}
                          className="relative bg-[#c7ceff] border-r border-b border-[#a0a0a0] text-center font-bold text-gray-800 px-1.5 py-0.5 text-[11.5px] select-none whitespace-nowrap"
                        >
                          <div className="flex items-center justify-center gap-0.5">
                            <span>{sub.label}</span>
                          </div>
                          <ResizeHandle onMouseDown={(e) => startResizing(sub.key, e)} />
                        </th>
                      );
                    });
                  }
                  return null;
                })}
              </tr>
            </>
          ) : (
            /* Single Row Header */
            <tr className="h-[32px]">
              {showRowIndex && (
                <th className="w-[42px] bg-[#b5bde6] border-r border-b border-[#a0a0a0] text-center font-bold text-gray-700 text-[11px]">
                  순번
                </th>
              )}
              {flatColumns.map((col, idx) => {
                const colWidth = getColWidth(col.key, col.width, col.minWidth);
                return (
                  <th
                    key={idx}
                    style={{
                      width: colWidth,
                      minWidth: columnWidths[col.key] ? `${columnWidths[col.key]}px` : col.minWidth,
                    }}
                    className="relative bg-[#c2c9ee] border-r border-b border-[#a0a0a0] text-center font-bold text-gray-800 px-2 py-1.5 text-[12.5px] select-none whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center">
                      <span>{col.label}</span>
                    </div>
                    <ResizeHandle onMouseDown={(e) => startResizing(col.key, e)} />
                  </th>
                );
              })}
            </tr>
          )}
        </thead>

        {/* Table Body */}
        <tbody>
          {gridData.length === 0 ? (
            <tr>
              <td
                colSpan={flatColumns.length + (showRowIndex ? 1 : 0)}
                className="py-12 text-center text-gray-400 bg-gray-50 italic text-[12px]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            gridData.map((row, rIdx) => {
              const isSelected = selectedRowId !== undefined && (row.id === selectedRowId || row.no === selectedRowId);
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
                      {row.no !== undefined ? row.no : rIdx + 1}
                    </td>
                  )}
                  {flatColumns.map((col, cIdx) => {
                    const isReadOnly = col.editable === false || col.format === 'checkbox';
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
                        } text-[12.5px] truncate whitespace-nowrap ${
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

        {/* Table Footer: Summary Row (연노란색 `#ffffcc`) */}
        {summaryRow && (
          <tfoot className="sticky bottom-0 z-10 bg-[#ffffcc] border-t-2 border-[#b0b080] text-gray-900 font-bold shadow-xs">
            <tr className="h-[30px]">
              {showRowIndex && (
                <td className="border-r border-[#d4d4aa] text-center text-[11.5px] bg-[#f5f5be]">
                  계
                </td>
              )}
              {flatColumns.map((col, cIdx) => {
                // If summaryValues provided explicitly
                if (summaryValues && col.key in summaryValues) {
                  const val = summaryValues[col.key];
                  return (
                    <td
                      key={cIdx}
                      className="border-r border-[#d4d4aa] px-2 text-right font-mono text-[12px] text-gray-900"
                    >
                      {typeof val === 'number' ? val.toLocaleString() : val}
                    </td>
                  );
                }

                // If first non-index column, show summary title
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

                // Auto-computed sum
                if (computedSums[col.key] !== undefined) {
                  return (
                    <td
                      key={cIdx}
                      className="border-r border-[#d4d4aa] px-2 text-right font-mono text-[12px] text-gray-900"
                    >
                      {computedSums[col.key].toLocaleString()}
                    </td>
                  );
                }

                return (
                  <td key={cIdx} className="border-r border-[#d4d4aa] px-1.5">
                    {/* Empty cell */}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

