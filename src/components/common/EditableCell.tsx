'use client';

import React from 'react';

/* ───────────────────────────────────────────────────────────────
 * useInlineEdit – 범용 인라인 편집 훅
 * ─────────────────────────────────────────────────────────────── */
export interface EditingState {
  rowId: string | number;
  colKey: string;
}

export function useInlineEdit() {
  const [editingCell, setEditingCell] = React.useState<EditingState | null>(null);
  const [editValue, setEditValue] = React.useState('');

  const startEditing = (rowId: string | number, colKey: string, currentValue: unknown) => {
    setEditingCell({ rowId, colKey });
    setEditValue(currentValue != null ? String(currentValue) : '');
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const isEditing = (rowId: string | number, colKey: string) =>
    editingCell?.rowId === rowId && editingCell?.colKey === colKey;

  return { editingCell, editValue, setEditValue, startEditing, cancelEditing, isEditing };
}

/* ───────────────────────────────────────────────────────────────
 * EditableCell – 범용 편집 가능 셀 컴포넌트
 * ─────────────────────────────────────────────────────────────── */
interface EditableCellProps {
  rowId: string | number;
  colKey: string;
  value: unknown;
  isEditing: boolean;
  editValue: string;
  onStartEdit: (rowId: string | number, colKey: string, value: unknown) => void;
  onEditValueChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  align?: 'left' | 'center' | 'right';
  isNumeric?: boolean;
  className?: string;
  tdClassName?: string;
  readOnly?: boolean;
}

export function EditableCell({
  rowId,
  colKey,
  value,
  isEditing,
  editValue,
  onStartEdit,
  onEditValueChange,
  onSave,
  onCancel,
  align = 'left',
  isNumeric = false,
  className = '',
  tdClassName = '',
  readOnly = false,
}: EditableCellProps) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  if (isEditing) {
    return (
      <td className={`border border-gray-300 p-0 ${tdClassName}`}>
        <input
          autoFocus
          type={isNumeric ? 'number' : 'text'}
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave();
            if (e.key === 'Escape') onCancel();
          }}
          className={`w-full h-full px-1.5 py-0.5 text-[12.5px] border-none outline-none ring-2 ring-blue-500 bg-blue-50 ${alignClass} ${className}`}
        />
      </td>
    );
  }

  const displayValue = isNumeric && typeof value === 'number' ? value.toLocaleString() : (value ?? '');

  return (
    <td
      className={`border border-gray-300 whitespace-nowrap px-1.5 py-0.5 text-[12.5px] cursor-pointer hover:bg-blue-50/80 hover:outline hover:outline-1 hover:outline-blue-400 ${alignClass} ${tdClassName} ${className}`}
      onClick={() => !readOnly && onStartEdit(rowId, colKey, value)}
    >
      {String(displayValue)}
    </td>
  );
}

export default EditableCell;

