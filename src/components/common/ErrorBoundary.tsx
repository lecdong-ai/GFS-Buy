'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in screen:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-full w-full bg-[#f8fafc] text-slate-700 select-none">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-3">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <h2 className="text-[14px] font-bold text-slate-900 mb-1">
            {this.props.fallbackTitle || '화면을 표시하는 중 오류가 발생했습니다.'}
          </h2>
          <p className="text-[11px] text-slate-500 max-w-md text-center mb-4 leading-relaxed font-mono bg-slate-100 p-2 rounded border border-slate-200">
            {this.state.error?.message || '알 수 없는 런타임 오류가 발생했습니다.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>화면 다시 불러오기</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

