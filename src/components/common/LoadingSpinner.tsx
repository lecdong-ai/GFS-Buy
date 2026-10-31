'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = '데이터를 불러오는 중입니다...',
  size = 'md',
  fullHeight = false,
}) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 gap-2 text-slate-500 select-none ${
        fullHeight ? 'h-full w-full flex-1 min-h-[200px]' : ''
      }`}
    >
      <Loader2 className={`${iconSize} animate-spin text-blue-600`} />
      {message && <span className="text-[11px] font-medium text-slate-600">{message}</span>}
    </div>
  );
};

