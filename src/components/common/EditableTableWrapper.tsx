'use client';

import React, { useCallback, useRef, useEffect } from 'react';

/**
 * EditableTableWrapper – 테이블을 감싸서:
 * 1. 모든 <td> 셀을 클릭하면 인라인 편집 가능하도록 함 (Event Delegation)
 * 2. 모든 <th> 헤더 우측 경계선을 마우스로 드래그하여 셀의 좌우 간격(너비)을 자유롭게 늘였다 줄였다 할 수 있도록 함 (Column Resizing)
 * 
 * 이미 <input>, <select>, <button>, <a> 등이 있는 셀은 자동으로 건너뜁니다.
 */
interface EditableTableWrapperProps {
  children: React.ReactNode;
  onCellChange?: (rowIndex: number, cellIndex: number, oldValue: string, newValue: string, rowElement: HTMLTableRowElement) => void;
  className?: string;
  readOnly?: boolean;
  enableColumnResize?: boolean;
}

export function EditableTableWrapper({
  children,
  onCellChange,
  className = '',
  readOnly = false,
  enableColumnResize = true,
}: EditableTableWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeInputRef = useRef<HTMLInputElement | null>(null);
  const originalValueRef = useRef<string>('');

  // ── 1. Column Resizing Handler (헤더 우측 경계 드래그) ──
  useEffect(() => {
    if (!enableColumnResize) return;
    const container = containerRef.current;
    if (!container) return;

    const setupResizers = () => {
      const thList = container.querySelectorAll<HTMLTableCellElement>('thead th');
      thList.forEach((th) => {
        // 이미 리사이저가 붙어있으면 건너뜀
        if (th.querySelector('.erp-col-resizer')) return;

        th.style.position = 'relative';

        const resizer = document.createElement('div');
        resizer.className = 'erp-col-resizer';
        resizer.style.position = 'absolute';
        resizer.style.top = '0';
        resizer.style.right = '0';
        resizer.style.bottom = '0';
        resizer.style.width = '7px';
        resizer.style.cursor = 'col-resize';
        resizer.style.userSelect = 'none';
        resizer.style.zIndex = '35';
        resizer.title = '마우스 드래그로 열 너비 조절';

        // Hover 시 파란색 경계선 가이드 표시
        resizer.addEventListener('mouseenter', () => {
          resizer.style.backgroundColor = 'rgba(59, 130, 246, 0.4)';
        });
        resizer.addEventListener('mouseleave', () => {
          if (!document.body.classList.contains('erp-resizing-active')) {
            resizer.style.backgroundColor = 'transparent';
          }
        });

        const handleMouseDown = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();

          const startX = e.clientX;
          const startWidth = th.offsetWidth;
          const table = th.closest('table');
          const thIndex = Array.from(th.parentElement?.children || []).indexOf(th);

          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'col-resize';
          document.body.classList.add('erp-resizing-active');
          resizer.style.backgroundColor = '#2563eb';

          const handleMouseMove = (me: MouseEvent) => {
            const diff = me.clientX - startX;
            const newWidth = Math.max(40, startWidth + diff);

            th.style.width = `${newWidth}px`;
            th.style.minWidth = `${newWidth}px`;

            // 동일 열의 모든 td에도 너비 적용
            if (table) {
              const rows = table.querySelectorAll('tbody tr');
              rows.forEach((tr) => {
                const td = tr.children[thIndex] as HTMLTableCellElement | undefined;
                if (td) {
                  td.style.width = `${newWidth}px`;
                  td.style.minWidth = `${newWidth}px`;
                }
              });
            }
          };

          const handleMouseUp = () => {
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            document.body.classList.remove('erp-resizing-active');
            resizer.style.backgroundColor = 'transparent';

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        };

        resizer.addEventListener('mousedown', handleMouseDown);
        th.appendChild(resizer);
      });
    };

    // 초기 마운트 및 DOM 변화 감지하여 리사이저 부착
    setupResizers();
    const observer = new MutationObserver(setupResizers);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [enableColumnResize]);

  // ── 2. Inline Editing Handler (셀 클릭 직접 입력) ──
  const cleanupActiveInput = useCallback(() => {
    if (activeInputRef.current) {
      const input = activeInputRef.current;
      const td = input.parentElement as HTMLTableCellElement;
      if (td) {
        const newVal = input.value;
        const oldVal = originalValueRef.current;

        // Restore the td content
        td.textContent = newVal;
        td.style.padding = '';

        // Notify about change
        if (newVal !== oldVal && onCellChange) {
          const tr = td.closest('tr');
          const tbody = td.closest('tbody');
          if (tr && tbody) {
            const rowIndex = Array.from(tbody.rows).indexOf(tr as HTMLTableRowElement);
            const cellIndex = Array.from(tr.cells).indexOf(td);
            onCellChange(rowIndex, cellIndex, oldVal, newVal, tr as HTMLTableRowElement);
          }
        }
      }
      activeInputRef.current = null;
    }
  }, [onCellChange]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;

    const target = e.target as HTMLElement;
    
    // Don't activate if clicking on existing interactive elements or resizer
    if (target.closest('input, select, button, a, textarea, [contenteditable], .erp-col-resizer')) {
      return;
    }

    // Find the <td> cell
    const td = target.closest('td') as HTMLTableCellElement | null;
    if (!td) return;

    // Skip if it's in thead or tfoot
    if (td.closest('thead') || td.closest('tfoot')) return;

    // Skip if the td contains interactive elements
    if (td.querySelector('input, select, button, textarea, [contenteditable]')) return;

    // Skip if td is empty or is an index/checkbox cell
    const text = td.textContent?.trim() ?? '';

    // Cleanup any existing active input first
    cleanupActiveInput();

    // Create an inline input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = text;
    input.className = 'w-full h-full px-1.5 py-0.5 text-[12.5px] border-none outline-none ring-2 ring-blue-500 bg-blue-50';
    
    // Match the text alignment of the td
    const computedStyle = window.getComputedStyle(td);
    input.style.textAlign = computedStyle.textAlign || 'left';
    input.style.fontFamily = computedStyle.fontFamily;
    input.style.fontWeight = computedStyle.fontWeight;
    input.style.fontSize = computedStyle.fontSize || '12.5px';
    input.style.color = computedStyle.color;
    input.style.width = '100%';
    input.style.height = '100%';
    input.style.boxSizing = 'border-box';

    // Store original value
    originalValueRef.current = text;
    activeInputRef.current = input;

    // Replace td content with input
    td.textContent = '';
    td.style.padding = '0';
    td.appendChild(input);
    input.focus();
    input.select();

    // Handle blur (save)
    input.addEventListener('blur', () => {
      cleanupActiveInput();
    });

    // Handle keyboard
    input.addEventListener('keydown', (ke) => {
      if (ke.key === 'Enter') {
        input.blur();
      } else if (ke.key === 'Escape') {
        input.value = originalValueRef.current;
        input.blur();
      } else if (ke.key === 'Tab') {
        ke.preventDefault();
        input.blur();
        // Move to next/prev cell
        const tr = td.closest('tr');
        if (tr) {
          const cells = Array.from(tr.cells);
          const idx = cells.indexOf(td);
          const nextIdx = ke.shiftKey ? idx - 1 : idx + 1;
          if (nextIdx >= 0 && nextIdx < cells.length) {
            cells[nextIdx].click();
          }
        }
      }
    });
  }, [readOnly, cleanupActiveInput]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupActiveInput();
    };
  }, [cleanupActiveInput]);

  return (
    <div ref={containerRef} onClick={handleClick} className={className}>
      {children}
    </div>
  );
}

export default EditableTableWrapper;

