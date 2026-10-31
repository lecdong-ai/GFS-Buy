'use client';

import React from 'react';
import { useTabs, DASHBOARD_TAB_ID } from '@/context/TabContext';
import { Activity, Database, CheckCircle2 } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { activeTab } = useTabs();
  const isDashboard = activeTab.id === DASHBOARD_TAB_ID;

  return (
    <footer className="h-[28px] bg-[#f1f3f5] border-t border-gray-300 px-3 flex items-center justify-between text-[12px] text-gray-700 select-none font-sans shrink-0">
      {/* Left status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-900">상태:</span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            정상
          </span>
        </div>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>Oracle DB (gfs_erp_prod) 연결됨</span>
        </div>
      </div>

      {/* Center active screen info */}
      <div className="hidden md:flex items-center gap-2 text-gray-600 font-medium">
        <span className="text-gray-400">화면:</span>
        <span className="text-blue-900 font-bold">
          {isDashboard ? '통합 대시보드' : `${activeTab.categoryName} > ${activeTab.title}`}
        </span>
      </div>

      {/* Right system flags */}
      <div className="flex items-center gap-2.5 font-mono text-[11px] text-gray-600">
        <span className="hidden sm:inline-block text-gray-700 font-sans">사업장: (주)GFS 음성식품공장</span>
        <span className="text-gray-300">|</span>
        <span className="px-1.5 py-0.2 bg-gray-200 border border-gray-300 text-gray-700 rounded-2xs">CAPS</span>
        <span className="px-1.5 py-0.2 bg-blue-100 border border-blue-300 text-blue-800 font-bold rounded-2xs">NUM</span>
        <span className="px-1.5 py-0.2 bg-gray-200 border border-gray-300 text-gray-700 rounded-2xs">SCRL</span>
      </div>
    </footer>
  );
};

