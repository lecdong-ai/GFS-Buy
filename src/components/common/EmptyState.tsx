'use client';

import React from 'react';
import { FolderOpen, Search, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  icon?: 'folder' | 'search';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '조회된 데이터가 없습니다.',
  description = '검색 조건을 변경하거나 신규 데이터를 등록해 주세요.',
  onAction,
  actionLabel,
  icon = 'folder',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-2 text-slate-400 select-none h-full w-full flex-1 min-h-[220px]">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
        {icon === 'search' ? <Search className="w-6 h-6" /> : <FolderOpen className="w-6 h-6" />}
      </div>
      <div className="text-[13px] font-bold text-slate-700 mt-1">{title}</div>
      <p className="text-[11px] text-slate-500 max-w-sm text-center leading-relaxed">
        {description}
      </p>
      {onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-none shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

