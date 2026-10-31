'use client';

import React, { useState, useEffect } from 'react';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import {
  MASTER_CODE_CLASSES,
  SAMPLE_DETAIL_CODES,
  CodeClassItem,
  DetailCodeItem,
} from '../data/masterCodeData';
import { Plus, RotateCw } from 'lucide-react';

export const BaseCodeView: React.FC = () => {
  const [classes, setClasses] = useState<CodeClassItem[]>(MASTER_CODE_CLASSES);
  const [selectedClassId, setSelectedClassId] = useState<string>('STR');
  const [detailCodesMap, setDetailCodesMap] = useState<Record<string, DetailCodeItem[]>>(SAMPLE_DETAIL_CODES);

  useEffect(() => {
    fetch('/api/master/base-code')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loadedClasses: CodeClassItem[] = json.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            order: c.sortOrder || 0,
            remark: c.remark || '',
            used: c.isUsed,
          }));
          setClasses(loadedClasses);

          const loadedMap: Record<string, DetailCodeItem[]> = {};
          json.data.forEach((c: any) => {
            if (c.details && c.details.length > 0) {
              loadedMap[c.id] = c.details.map((d: any) => ({
                id: d.id,
                classId: d.classId,
                code: d.code,
                name: d.name,
                order: d.sortOrder || 0,
                val1: d.val1 || '',
                val2: d.val2 || '',
                val3: d.val3 || '',
                val4: d.val4 || '',
                val5: d.val5 || '',
                remark: d.remark || '',
                used: d.isUsed,
              }));
            }
          });
          if (Object.keys(loadedMap).length > 0) {
            setDetailCodesMap((prev) => ({ ...prev, ...loadedMap }));
          }
        }
      })
      .catch((err) => console.error('Failed to load base codes', err));
  }, []);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const currentDetails = detailCodesMap[selectedClassId] || [
    { id: 101, classId: selectedClassId, code: '01', name: `${selectedClass.name} 표준코드`, order: 1, val1: '', val2: '', val3: '', val4: '', val5: '', remark: '기본 코드', used: true },
  ];

  const handleClassCheck = (classId: string, val: boolean) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, used: val } : c))
    );
  };

  const handleDetailCheck = (id: number, val: boolean) => {
    setDetailCodesMap((prev) => ({
      ...prev,
      [selectedClassId]: (prev[selectedClassId] || []).map((d) =>
        d.id === id ? { ...d, used: val } : d
      ),
    }));
  };

  const handleAddClass = () => {
    const newClass: CodeClassItem = {
      id: `USR${String(classes.length + 1).padStart(2, '0')}`,
      name: '신규코드클래스',
      order: (classes.length + 1) * 10,
      remark: '사용자 정의',
      used: true,
    };
    setClasses((prev) => [...prev, newClass]);
  };

  const handleAddDetail = () => {
    const newDetail: DetailCodeItem = {
      id: Date.now(),
      classId: selectedClassId,
      code: `C${String(currentDetails.length + 1).padStart(2, '0')}`,
      name: '신규기초코드',
      order: currentDetails.length + 1,
      val1: '',
      val2: '',
      val3: '',
      val4: '',
      val5: '',
      remark: '',
      used: true,
    };
    setDetailCodesMap((prev) => ({
      ...prev,
      [selectedClassId]: [...(prev[selectedClassId] || []), newDetail],
    }));
  };

  const handleSave = async () => {
    try {
      const details = detailCodesMap[selectedClassId] || [];
      const res = await fetch('/api/master/base-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass.id,
          className: selectedClass.name,
          details: details.map((d) => ({
            code: d.code,
            name: d.name,
            sortOrder: d.order,
            val1: d.val1,
            val2: d.val2,
            val3: d.val3,
            val4: d.val4,
            val5: d.val5,
            remark: d.remark,
            isUsed: d.used,
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('기초코드 설정이 데이터베이스에 안전하게 저장되었습니다.');
      } else {
        alert('저장 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('저장 중 오류가 발생했습니다: ' + err.message);
    }
  };

  const LEFT_COLUMNS: MasterGridColumnDef[] = [
    { key: 'used', label: '사용', width: '45px', align: 'center', format: 'checkbox', sortable: false, filterable: false },
    { key: 'id', label: '코드클래스', width: '85px', align: 'center' },
    { key: 'name', label: '코드클래스명', width: '140px', align: 'left' },
    { key: 'remark', label: '비고', width: '130px', align: 'left' },
    { key: 'order', label: '순서', width: '50px', align: 'right', format: 'number' },
  ];

  const RIGHT_COLUMNS: MasterGridColumnDef[] = [
    { key: 'used', label: '사용', width: '45px', align: 'center', format: 'checkbox' },
    { key: 'code', label: '코드', width: '80px', align: 'center' },
    { key: 'name', label: '코드명', width: '140px', align: 'left' },
    { key: 'order', label: '순서', width: '50px', align: 'right', format: 'number' },
    { key: 'val1', label: '값1', width: '80px', align: 'left' },
    { key: 'val2', label: '값2', width: '80px', align: 'left' },
    { key: 'val3', label: '값3', width: '80px', align: 'left' },
    { key: 'val4', label: '값4', width: '70px', align: 'left' },
    { key: 'val5', label: '값5', width: '70px', align: 'left' },
    { key: 'remark', label: '비고', width: '140px', align: 'left' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      <MasterActionBar
        title="기초코드"
        buttons={[
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('기초코드가 조회되었습니다.') },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
        ]}
        helpContent="전체 ERP 시스템에서 공통 참조되는 56개 마스터 코드클래스와 세부 기초코드 속성값을 관리합니다."
      />

      <div className="flex-1 flex min-h-0 p-2 gap-2">
        {/* Left: Code Classes */}
        <div className="w-[440px] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs shrink-0">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <span className="font-bold text-gray-800">코드클래스</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-gray-600 bg-white px-1.5 py-0.2 rounded border border-gray-300 font-bold">
                {classes.length}개
              </span>
              <button
                type="button"
                onClick={handleAddClass}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-[11px] flex items-center gap-0.5 shadow-2xs"
              >
                <Plus size={11} /> 추가
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={LEFT_COLUMNS}
              data={classes}
              selectedRowId={selectedClass.id}
              onRowClick={(row) => setSelectedClassId(row.id)}
              onCellChange={(rowId, colKey, val) => {
                if (colKey === 'used') handleClassCheck(rowId, val);
              }}
              summaryRow={false}
            />
          </div>
        </div>

        {/* Right: Detail Codes */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">기초코드 ▶</span>
              <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.2 rounded border border-blue-300 font-semibold">
                {selectedClass.id} - {selectedClass.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-600">
                코드수: <span className="font-bold text-blue-700">{currentDetails.length}</span>
              </span>
              <button
                type="button"
                onClick={handleAddDetail}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-[11px] flex items-center gap-0.5 shadow-2xs"
              >
                <Plus size={11} /> 추가
              </button>
              <button
                type="button"
                onClick={() => alert('새로고침')}
                className="p-1 bg-white hover:bg-gray-100 text-gray-600 rounded border border-gray-300 shadow-2xs"
                title="새로고침"
              >
                <RotateCw size={12} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={RIGHT_COLUMNS}
              data={currentDetails}
              onCellChange={(rowId, colKey, val) => {
                if (colKey === 'used') handleDetailCheck(rowId, val);
              }}
              summaryRow={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

