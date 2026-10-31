'use client';

import React, { useState, useEffect } from 'react';
import { GridColumn } from '@/types/erp';
import { useColumnResize, ResizeHandle } from '@/components/common/useColumnResize';

interface ErpGridProps {
  columns: GridColumn[];
  data: Record<string, any>[];
  summary: Record<string, string | number>;
}

export const ErpGrid: React.FC<ErpGridProps> = ({ columns, data, summary }) => {
  const [gridData, setGridData] = useState(data);
  const { columnWidths, startResizing, getColWidth } = useColumnResize();
  useEffect(() => {
    setGridData(data);
  }, [data]);

  const [editingCell, setEditingCell] = useState<{ rowId: string | number; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEditing = (rowId: string | number, colKey: string, currentVal: any) => {
    setEditingCell({ rowId, colKey });
    setEditValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : '');
  };

  const saveEdit = (rowId: string | number, colKey: string) => {
    const col = columns.find((c) => c.key === colKey);
    const parsedVal =
      col?.align === 'right'
        ? editValue === '' ? 0 : Number(editValue.replace(/,/g, '')) || 0
        : editValue;

    setGridData((prev) =>
      prev.map((r: any, idx: number) => {
        const match = (r.id !== undefined && r.id === rowId) || idx === rowId;
        return match ? { ...r, [colKey]: parsedVal } : r;
      })
    );
    setEditingCell(null);
  };
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeRowId, setActiveRowId] = useState<number | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((d) => d.id));
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatCellValue = (val: any, col: GridColumn) => {
    if (val === undefined || val === null) return '-';

    if (col.format === 'currency') {
      return typeof val === 'number' ? `₩${val.toLocaleString()}` : val;
    }
    if (col.format === 'number') {
      return typeof val === 'number' ? val.toLocaleString() : val;
    }
    if (col.format === 'badge') {
      let badgeColor = 'bg-gray-100 text-gray-700 border-gray-300';
      if (['납품완료', '입고완료', '생산완료', '사용중', '승인완료', '정상'].includes(val)) {
        badgeColor = 'bg-green-50 text-green-700 border-green-300';
      } else if (['배송중', '출하지시', '진행중', '검수완료'].includes(val)) {
        badgeColor = 'bg-blue-50 text-blue-700 border-blue-300';
      } else if (['부분출고', '부분입고', '검토중', '지시대기', '발주접수'].includes(val)) {
        badgeColor = 'bg-amber-50 text-amber-700 border-amber-300';
      } else if (['주의(임박)', '안전미달', '불량'].includes(val)) {
        badgeColor = 'bg-red-50 text-red-700 border-red-300';
      }

      return (
        <span className={`inline-block px-1.5 py-0.2 text-[11px] font-medium border rounded ${badgeColor}`}>
          {val}
        </span>
      );
    }

    return val;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white border border-gray-300 shadow-xs">
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-full border-collapse text-[12.5px] select-text">
          {/* Table Header */}
          <thead className="whitespace-nowrap sticky top-0 z-10 bg-[#e5e9f0] border-b border-gray-300 text-gray-800 shadow-xs font-semibold">
            <tr>
              <th className="w-9 px-1 py-1.5 border-r border-gray-300 text-center bg-[#dfe4ec]">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={toggleSelectAll}
                  className="rounded-none cursor-pointer"
                  title="전체 선택"
                />
              </th>
              {columns.map((col) => {
                const colWidth = getColWidth(col.key, col.width);
                return (
                  <th
                    key={col.key}
                    style={{
                      width: colWidth,
                      minWidth: columnWidths[col.key] ? `${columnWidths[col.key]}px` : col.width,
                    }}
                    className={`relative px-2 py-1.5 border-r border-gray-300 whitespace-nowrap text-[11px] font-bold text-gray-700 tracking-tight select-none ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    <span>{col.label}</span>
                    <ResizeHandle onMouseDown={(e) => startResizing(col.key, e)} />
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {gridData.map((row, rowIdx) => {
              const isSelected = selectedIds.includes(row.id);
              const isActive = activeRowId === row.id;

              return (
                <tr
                  key={row.id}
                  onClick={() => setActiveRowId(row.id)}
                  className={`border-b border-gray-200 transition-colors cursor-pointer text-[12.5px] ${
                    isSelected
                      ? 'bg-[#dbeafe] hover:bg-[#bfdbfe]'
                      : isActive
                      ? 'bg-[#eff6ff] hover:bg-[#dbeafe]'
                      : row.id % 2 === 0
                      ? 'bg-[#fcfdfd] hover:bg-[#f1f5f9]'
                      : 'bg-white hover:bg-[#f1f5f9]'
                  }`}
                >
                  <td
                    className="px-1 py-1 border-r border-gray-200 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(row.id)}
                      className="cursor-pointer"
                    />
                  </td>

                  {columns.map((col) => {
                      const rowId = row.id !== undefined ? row.id : rowIdx;
                      const isEditing = editingCell?.rowId === rowId && editingCell?.colKey === col.key;
                      const colWidth = getColWidth(col.key, col.width);
                      return (
                    <td
                      key={col.key}
                      style={{
                        width: colWidth,
                        minWidth: columnWidths[col.key] ? `${columnWidths[col.key]}px` : col.width,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(rowId, col.key, row[col.key]);
                      }}
                      className={`px-2 py-1 border-r border-gray-200 whitespace-nowrap text-gray-800 cursor-text hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 transition-colors ${
                        col.align === 'right'
                          ? 'text-right font-mono'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {isEditing ? (
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
                          className="w-full h-full min-h-[24px] bg-white text-gray-900 border-2 border-blue-600 rounded-none px-1.5 py-0.5 text-[12.5px] outline-none shadow-inner"
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.target.select()}
                        />
                      ) : (
                        formatCellValue(row[col.key], col)
                      )}
                    </td>
                  );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Table Summary Footer */}
          <tfoot className="sticky bottom-0 z-10 bg-[#f1f4f9] border-t-2 border-gray-400 font-bold text-gray-800">
            <tr>
              <td className="px-1 py-1.5 border-r border-gray-300 text-center bg-[#e2e8f0]">
                Σ
              </td>
              {columns.map((col, idx) => {
                const summaryVal = summary[col.key];
                return (
                  <td
                    key={col.key}
                    className={`px-2 py-1.5 border-r border-gray-300 text-[11px] whitespace-nowrap ${
                      col.align === 'right' ? 'text-right font-mono text-blue-900' : 'text-center'
                    }`}
                  >
                    {idx === 0 || col.key === 'date' || col.key === 'orderNo' || col.key === 'code' ? (
                      <span className="text-gray-600 font-medium">합계 / 평균</span>
                    ) : summaryVal !== undefined ? (
                      col.format === 'currency'
                        ? `₩${Number(summaryVal).toLocaleString()}`
                        : typeof summaryVal === 'number'
                        ? summaryVal.toLocaleString()
                        : summaryVal
                    ) : (
                      ''
                    )}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Grid Status / Info Footer */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#f8fafc] border-t border-gray-300 text-[11px] text-gray-600">
        <div className="flex items-center gap-3">
          <span>
            총 <strong className="text-blue-700">{data.length}</strong>건 표시됨
          </span>
          <span>|</span>
          <span>
            선택: <strong className="text-blue-700">{selectedIds.length}</strong>건
          </span>
          {activeRowId && (
            <>
              <span>|</span>
              <span className="text-gray-500">선택 행 번호: #{activeRowId}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-500 font-mono text-[10px]">
          <span>GRID ENGINE: V2.4-FAST</span>
          <span>|</span>
          <span>LOCK: NONE</span>
        </div>
      </div>
    </div>
  );
};

