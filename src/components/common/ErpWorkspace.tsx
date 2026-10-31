'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Save,
  Trash2,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { TabItem } from '@/types/erp';
import { getGridConfigForMenu } from './mockDataGenerator';
import { ErpGrid } from './ErpGrid';

interface ErpWorkspaceProps {
  tab: TabItem;
}

export const ErpWorkspace: React.FC<ErpWorkspaceProps> = ({ tab }) => {
  // Search conditions
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [partnerType, setPartnerType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load grid configuration according to current menu
  const baseConfig = useMemo(
    () => getGridConfigForMenu(tab.categoryId, tab.title),
    [tab.categoryId, tab.title]
  );

  const [gridData, setGridData] = useState(baseConfig.sampleData);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Button handlers
  const handleSearch = () => {
    showToast(`'${tab.title}' 데이터를 최신 상태로 조회했습니다.`);
  };

  const handleNew = () => {
    const newId = gridData.length + 1;
    const newRow = {
      ...gridData[0],
      id: newId,
      no: newId,
      date: '2026-10-30',
      status: '신규등록',
      orderNo: `NEW-${newId.toString().padStart(3, '0')}`,
      title: `[신규] ${tab.title} 항목`,
    };
    setGridData([newRow, ...gridData]);
    showToast(`신규 행이 추가되었습니다. (행 #${newId})`);
  };

  const handleSave = () => {
    showToast('변경사항이 정상적으로 데이터베이스에 저장되었습니다.');
  };

  const handleDelete = () => {
    if (gridData.length > 0) {
      setGridData(gridData.slice(1));
      showToast('선택한 데이터 1건이 삭제 처리되었습니다.');
    }
  };

  const handleExcelExport = () => {
    // Generate CSV export
    try {
      const headers = baseConfig.columns.map((c) => c.label).join(',');
      const rows = gridData
        .map((row) =>
          baseConfig.columns
            .map((c) => {
              const val = row[c.key];
              return typeof val === 'string' && val.includes(',') ? `"${val}"` : val ?? '';
            })
            .join(',')
        )
        .join('\n');
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + headers + '\n' + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${tab.title}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('엑셀(CSV) 파일 다운로드가 시작되었습니다.');
    } catch {
      showToast('엑셀 파일 생성 중 오류가 발생했습니다.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const setDateRange = (type: 'today' | 'week' | 'month' | 'prevMonth') => {
    if (type === 'today') {
      setStartDate('2026-10-30');
      setEndDate('2026-10-30');
    } else if (type === 'week') {
      setStartDate('2026-10-26');
      setEndDate('2026-10-30');
    } else if (type === 'month') {
      setStartDate('2026-10-01');
      setEndDate('2026-10-30');
    } else if (type === 'prevMonth') {
      setStartDate('2026-09-01');
      setEndDate('2026-09-30');
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#f4f6f9] p-2 space-y-2 overflow-hidden text-xs">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-12 right-6 z-50 flex items-center gap-2 px-3.5 py-2 bg-blue-900 text-white shadow-lg text-xs border border-blue-400 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1) 상단 툴바: 현재 메뉴명 + 우측 버튼군 */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-300 shadow-xs">
        {/* Menu Title and Breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#2b7de9]" />
          <span className="text-gray-500 font-medium text-[11px]">{tab.categoryName}</span>
          <span className="text-gray-400">&gt;</span>
          <h2 className="text-[14px] font-bold text-gray-900 tracking-tight">{tab.title}</h2>
          <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-300">
            화면코드: {tab.menuId.toUpperCase()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#2b7de9] hover:bg-[#1b5cb8] text-white border border-[#1b5cb8] font-bold shadow-xs active:translate-y-px"
          >
            <Search className="w-3.5 h-3.5" />
            <span>조회</span>
          </button>
          <button
            type="button"
            onClick={handleNew}
            className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-400 font-medium active:translate-y-px"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>신규</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-400 font-medium active:translate-y-px"
          >
            <Save className="w-3.5 h-3.5 text-emerald-600" />
            <span>저장</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-400 font-medium active:translate-y-px"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>삭제</span>
          </button>
          <button
            type="button"
            onClick={handleExcelExport}
            className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-400 font-medium active:translate-y-px"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>엑셀 다운로드</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-400 font-medium active:translate-y-px"
          >
            <Printer className="w-3.5 h-3.5 text-gray-700" />
            <span>출력</span>
          </button>
        </div>
      </div>

      {/* 2) 검색 조건 박스 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 bg-[#f8fafc] border border-gray-300 shadow-2xs">
        {/* 기준일자 */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-700 whitespace-nowrap text-[11px] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            기준일자:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 px-1.5 py-0.5 bg-white text-gray-800 text-xs focus:outline-none focus:border-blue-600"
          />
          <span className="text-gray-500">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 px-1.5 py-0.5 bg-white text-gray-800 text-xs focus:outline-none focus:border-blue-600"
          />
          <div className="flex items-center ml-1 border border-gray-300 overflow-hidden bg-white text-[10px]">
            <button
              type="button"
              onClick={() => setDateRange('today')}
              className="px-1.5 py-0.5 hover:bg-gray-100 border-r border-gray-300"
            >
              오늘
            </button>
            <button
              type="button"
              onClick={() => setDateRange('week')}
              className="px-1.5 py-0.5 hover:bg-gray-100 border-r border-gray-300"
            >
              금주
            </button>
            <button
              type="button"
              onClick={() => setDateRange('month')}
              className="px-1.5 py-0.5 hover:bg-gray-100 border-r border-gray-300 font-semibold text-blue-700"
            >
              당월
            </button>
            <button
              type="button"
              onClick={() => setDateRange('prevMonth')}
              className="px-1.5 py-0.5 hover:bg-gray-100"
            >
              전월
            </button>
          </div>
        </div>

        {/* 거래처/구분 선택 */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-700 whitespace-nowrap text-[11px] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            거래처/구분:
          </span>
          <select
            value={partnerType}
            onChange={(e) => setPartnerType(e.target.value)}
            className="border border-gray-300 px-2 py-0.5 bg-white text-gray-800 text-xs focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="all">전체 거래처</option>
            <option value="gs-all">GS리테일(통합)</option>
            <option value="gs-metro">GS리테일(수도권)</option>
            <option value="gs-youngnam">GS리테일(영남권)</option>
            <option value="gs-honam">GS리테일(호남권)</option>
            <option value="gs-direct">GS25 프레시원 직납</option>
            <option value="gs-super">GS더프레시 수퍼</option>
            <option value="bgf">BGF리테일(CU)</option>
            <option value="seven">세븐일레븐</option>
            <option value="emart24">이마트24</option>
          </select>
        </div>

        {/* 검색어 입력창 */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
          <span className="font-semibold text-gray-700 whitespace-nowrap text-[11px]">검색어:</span>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="품목코드, 품목명, 전표번호 입력 후 엔터"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full border border-gray-300 px-2 py-0.5 pr-7 bg-white text-gray-800 text-xs focus:outline-none focus:border-blue-600"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1.5" />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-800 text-[11px] font-medium"
          >
            검색
          </button>
        </div>
      </div>

      {/* 3) 메인 데이터 그리드 (엑셀 표 & 하단 합계 행) */}
      <ErpGrid
        columns={baseConfig.columns}
        data={gridData}
        summary={baseConfig.summaryLabels}
      />
    </div>
  );
};

