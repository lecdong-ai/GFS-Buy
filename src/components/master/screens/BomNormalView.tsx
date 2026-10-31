'use client';

import React, { useState, useEffect } from 'react';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import { Plus } from 'lucide-react';
import { exportGridToExcel } from '@/lib/excelExport';

interface BomParentProduct {
  id: number;
  used: boolean;
  itemCode: string;
  category: string;
  variety: string;
  itemName: string;
  spec: string;
  unit: string;
  baseProdQty: number; // 생산기준량
  recipeYield: number; // 레시피수율(%)
  prodCost: number; // (생산)투입원가
  unitCost: number; // (단위)투입원가
  bomCount: number; // bom수량
  gyeName: string;
  remark: string;
}

interface BomChildMaterial {
  id: number;
  childProductId?: number;
  used: boolean;
  partId: string;
  category: string;
  partName: string;
  partSpec: string;
  partUnit: string;
  recipeYield: number;
  prodInputQty: number; // (생산)투입량
  prodActualQty: number; // (생산)실투입량
  prodCost: number; // (생산)투입원가
  unitInputQty: number; // (단위)투입량
  unitActualQty: number; // (단위)실투입량
  unitCost: number; // (단위)투입원가
  gyeName: string;
  remark: string;
}

const SAMPLE_BOM_PARENTS: BomParentProduct[] = [
  { id: 1, used: true, itemCode: '10001021', category: '완성품', variety: '김밥', itemName: '참치마요김밥(밥김)', spec: '230g*1줄', unit: 'ea', baseProdQty: 100, recipeYield: 98.5, prodCost: 85000, unitCost: 850, bomCount: 6, gyeName: '성형장(김밥)', remark: '정규 레시피' },
  { id: 2, used: true, itemCode: '10002015', category: '완성품', variety: '주먹밥', itemName: '참치마요삼각김밥', spec: '110g*1개', unit: 'ea', baseProdQty: 200, recipeYield: 99.0, prodCost: 72000, unitCost: 360, bomCount: 5, gyeName: '성형장(삼각김밥)', remark: '표준 BOM' },
  { id: 3, used: true, itemCode: '10003050', category: '완성품', variety: '도시락', itemName: '11가지찬많은도시락', spec: '460g*1팩', unit: 'ea', baseProdQty: 50, recipeYield: 97.0, prodCost: 75000, unitCost: 1500, bomCount: 14, gyeName: '성형장(도시락)', remark: '찬 11종' },
];

const SAMPLE_BOM_CHILDREN: Record<number, BomChildMaterial[]> = {
  1: [
    { id: 101, used: true, partId: '20000010', category: '반제품', partName: '초밥미반(김밥용)', partSpec: '50kg*1통', partUnit: 'kg', recipeYield: 99.0, prodInputQty: 14.0, prodActualQty: 14.1, prodCost: 37800, unitInputQty: 0.14, unitActualQty: 0.141, unitCost: 378, gyeName: '취반(미반류)', remark: '' },
    { id: 102, used: true, partId: '20194455', category: '원재료', partName: '가공 참치플레이크(오일)', partSpec: '1.8kg*6캔', partUnit: 'kg', recipeYield: 98.0, prodInputQty: 4.0, prodActualQty: 4.1, prodCost: 25200, unitInputQty: 0.04, unitActualQty: 0.041, unitCost: 252, gyeName: '계량실(계량)', remark: '' },
    { id: 103, used: true, partId: '20194470', category: '원재료', partName: '골드마요네즈 3.2kg', partSpec: '3.2kg*4통', partUnit: 'kg', recipeYield: 99.0, prodInputQty: 2.0, prodActualQty: 2.02, prodCost: 7600, unitInputQty: 0.02, unitActualQty: 0.02, unitCost: 76, gyeName: '계량실(소스류)', remark: '' },
    { id: 104, used: true, partId: '30000020', category: '원재료', partName: '구운김밥김(완도특급)', partSpec: '100장/속', partUnit: '장', recipeYield: 97.0, prodInputQty: 100, prodActualQty: 103, prodCost: 11000, unitInputQty: 1.0, unitActualQty: 1.03, unitCost: 110, gyeName: '성형장(김밥)', remark: '' },
    { id: 105, used: true, partId: '30000080', category: '부재료', partName: '김밥 포장필름(GS)', partSpec: '2000매/롤', partUnit: '매', recipeYield: 98.0, prodInputQty: 100, prodActualQty: 102, prodCost: 2400, unitInputQty: 1.0, unitActualQty: 1.02, unitCost: 24, gyeName: '성형장(김밥)', remark: '' },
    { id: 106, used: true, partId: '30000090', category: '부재료', partName: '바코드 라벨 스티커', partSpec: '1000매/롤', partUnit: '매', recipeYield: 99.5, prodInputQty: 100, prodActualQty: 100.5, prodCost: 1000, unitInputQty: 1.0, unitActualQty: 1.005, unitCost: 10, gyeName: '성형장(김밥)', remark: '' },
  ],
  2: [
    { id: 201, used: true, partId: '20000010', category: '반제품', partName: '초밥미반(삼각용)', partSpec: '50kg*1통', partUnit: 'kg', recipeYield: 99.0, prodInputQty: 17.0, prodActualQty: 17.2, prodCost: 45900, unitInputQty: 0.085, unitActualQty: 0.086, unitCost: 229, gyeName: '취반(미반류)', remark: '' },
    { id: 202, used: true, partId: '20194455', category: '원재료', partName: '가공 참치플레이크(오일)', partSpec: '1.8kg*6캔', partUnit: 'kg', recipeYield: 98.0, prodInputQty: 3.0, prodActualQty: 3.1, prodCost: 18900, unitInputQty: 0.015, unitActualQty: 0.0155, unitCost: 95, gyeName: '계량실(계량)', remark: '' },
    { id: 203, used: true, partId: '30000015', category: '부재료', partName: '삼각김밥 김필름세트', partSpec: '1000매/롤', partUnit: '매', recipeYield: 98.5, prodInputQty: 200, prodActualQty: 203, prodCost: 7200, unitInputQty: 1.0, unitActualQty: 1.015, unitCost: 36, gyeName: '성형장(삼각김밥)', remark: '' },
  ],
};

export const BomNormalView: React.FC = () => {
  const [varietyFilter, setVarietyFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [parents, setParents] = useState<BomParentProduct[]>(SAMPLE_BOM_PARENTS);
  const [selectedParentId, setSelectedParentId] = useState<number>(1);
  const [childrenMap, setChildrenMap] = useState<Record<number, BomChildMaterial[]>>(SAMPLE_BOM_CHILDREN);
  const [bomHeaders, setBomHeaders] = useState<any[]>([]);
  const [versionsMap, setVersionsMap] = useState<Record<number, string[]>>({});
  const [version, setVersion] = useState<string>('1.0');
  const [copySourceId, setCopySourceId] = useState<string>('');

  useEffect(() => {
    fetch('/api/master/bom')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loadedParents: BomParentProduct[] = json.data.map((b: any, idx: number) => ({
            id: b.parentProduct?.id || idx + 1,
            used: b.isUsed !== false,
            itemCode: b.parentProduct?.productCode || '',
            category: b.parentProduct?.category || '완성품',
            variety: b.parentProduct?.kind || '기타',
            itemName: b.parentProduct?.name || '제품',
            spec: b.parentProduct?.spec || '',
            unit: b.parentProduct?.unit || 'ea',
            baseProdQty: 100,
            recipeYield: 99.0,
            prodCost: 80000,
            unitCost: 800,
            bomCount: b.details?.length || 0,
            gyeName: b.parentProduct?.gye?.name || '성형장',
            remark: b.remark || '',
          }));
          setParents(loadedParents);
          setBomHeaders(json.data);

          // 버전 목록 (부모별)
          const vMap: Record<number, string[]> = {};
          json.data.forEach((b: any) => {
            const pId = b.parentProduct?.id;
            if (pId) {
              if (!vMap[pId]) vMap[pId] = [];
              if (b.version && !vMap[pId].includes(b.version)) vMap[pId].push(b.version);
            }
          });
          setVersionsMap((prev) => ({ ...prev, ...vMap }));

          const loadedChildren: Record<number, BomChildMaterial[]> = {};
          json.data.forEach((b: any, idx: number) => {
            const pId = b.parentProduct?.id || idx + 1;
            if (b.details && b.details.length > 0 && !loadedChildren[pId]) {
              loadedChildren[pId] = b.details.map((d: any) => ({
                id: d.id,
                childProductId: d.childProductId,
                used: true,
                partId: d.childProduct?.productCode || '',
                category: d.childProduct?.category || '원재료',
                partName: d.childProduct?.name || '',
                partSpec: d.childProduct?.spec || '',
                partUnit: d.unit || d.childProduct?.unit || 'kg',
                recipeYield: d.yieldRate || 100,
                prodInputQty: d.unitQty * 100,
                prodActualQty: d.unitQty * 100,
                prodCost: d.unitQty * 100 * 2000,
                unitInputQty: d.unitQty,
                unitActualQty: d.unitQty,
                unitCost: d.unitQty * 2000,
                gyeName: d.gye?.name || '',
                remark: d.remark || '',
              }));
            }
          });
          if (Object.keys(loadedChildren).length > 0) {
            setChildrenMap((prev) => ({ ...prev, ...loadedChildren }));
          }
        }
      })
      .catch((err) => console.error('Failed to load BOM', err));
  }, []);

  const toApiDetails = (children: BomChildMaterial[]) =>
    children.map((c) => ({
      childProductId: c.childProductId || c.id,
      unitQty: c.unitInputQty,
      unit: c.partUnit,
      yieldRate: c.recipeYield,
      remark: c.remark,
    }));

  const handleSave = async () => {
    try {
      const children = childrenMap[selectedParentId] || [];
      const res = await fetch('/api/master/bom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentProductId: selectedParentId,
          version,
          effectiveDate: new Date().toISOString().slice(0, 10),
          details: toApiDetails(children),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setVersionsMap((prev) => {
          const cur = prev[selectedParentId] || [];
          return cur.includes(version) ? prev : { ...prev, [selectedParentId]: [...cur, version] };
        });
        alert(`BOM이 데이터베이스에 안전하게 저장되었습니다. (v${version})`);
      } else {
        alert('저장 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('저장 중 오류: ' + err.message);
    }
  };

  // 버전 전환: 해당 버전 상세로 하단 그리드 교체
  const handleVersionChange = (v: string) => {
    setVersion(v);
    const header = bomHeaders.find(
      (b: any) => (b.parentProduct?.id === selectedParentId) && b.version === v
    );
    if (header?.details) {
      const mapped: BomChildMaterial[] = header.details.map((d: any) => ({
        id: d.id,
        childProductId: d.childProductId,
        used: true,
        partId: d.childProduct?.productCode || '',
        category: d.childProduct?.category || '원재료',
        partName: d.childProduct?.name || '',
        partSpec: d.childProduct?.spec || '',
        partUnit: d.unit || d.childProduct?.unit || 'kg',
        recipeYield: d.yieldRate || 100,
        prodInputQty: d.unitQty * 100,
        prodActualQty: d.unitQty * 100,
        prodCost: d.unitQty * 100 * 2000,
        unitInputQty: d.unitQty,
        unitActualQty: d.unitQty,
        unitCost: d.unitQty * 2000,
        gyeName: d.gye?.name || '',
        remark: d.remark || '',
      }));
      setChildrenMap((prev) => ({ ...prev, [selectedParentId]: mapped }));
    } else if (v !== '1.0') {
      setChildrenMap((prev) => ({ ...prev, [selectedParentId]: [] }));
    }
  };

  // 새 버전 생성: 현재 구성을 다음 마이너 버전으로 복제 저장
  const handleNewVersion = async () => {
    const cur = versionsMap[selectedParentId] || ['1.0'];
    const nums = cur.map((s) => parseFloat(s)).filter((n) => !isNaN(n));
    const nextMinor = (Math.max(...nums, 1.0) + 0.1).toFixed(1);
    const children = childrenMap[selectedParentId] || [];
    if (children.length === 0) {
      alert('복제할 구성품이 없습니다. 먼저 소요 원부자재를 등록하세요.');
      return;
    }
    if (!children.every((c) => c.childProductId)) {
      alert('DB 미등록 행(임시 추가분)이 있어 버전을 만들 수 없습니다. 먼저 [저장]으로 확정한 뒤 다시 시도하세요.');
      return;
    }
    try {
      const res = await fetch('/api/master/bom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentProductId: selectedParentId,
          version: nextMinor,
          effectiveDate: new Date().toISOString().slice(0, 10),
          details: toApiDetails(children),
        }),
      });
      const json = await res.json();
      if (json.success) {
        // 방금 저장한 버전을 로컬 헤더 목록에도 반영
        setBomHeaders((prev) => [
          ...prev,
          {
            version: nextMinor,
            parentProduct: { id: selectedParentId },
            details: children.map((c, i) => ({
              id: Date.now() + i,
              childProductId: c.childProductId || c.id,
              unitQty: c.unitInputQty,
              unit: c.partUnit,
              yieldRate: c.recipeYield,
              remark: c.remark,
              childProduct: { productCode: c.partId, name: c.partName, spec: c.partSpec, unit: c.partUnit, category: c.category },
              gye: { name: c.gyeName },
            })),
          },
        ]);
        setVersionsMap((prev) => ({
          ...prev,
          [selectedParentId]: [...(prev[selectedParentId] || ['1.0']), nextMinor],
        }));
        setVersion(nextMinor);
        alert(`새 BOM 버전 v${nextMinor}이(가) 생성되었습니다.`);
      } else {
        alert('버전 생성 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('버전 생성 중 오류: ' + err.message);
    }
  };

  // 유사메뉴 복사: 원본 제품의 구성품을 현재 제품에 복제 (저장은 [저장] 버튼으로 확정)
  const handleCopyFrom = async () => {
    const srcId = Number(copySourceId);
    if (!srcId) {
      alert('복사해올 원본 제품을 선택하세요.');
      return;
    }
    if (srcId === selectedParentId) {
      alert('자기 자신은 복사 원본이 될 수 없습니다.');
      return;
    }
    let srcChildren = childrenMap[srcId];
    if (!srcChildren) {
      // DB에서 원본 BOM 조회
      try {
        const res = await fetch(`/api/master/bom?productId=${srcId}`);
        const json = await res.json();
        if (json.success && json.data?.[0]?.details) {
          srcChildren = json.data[0].details.map((d: any) => ({
            id: d.id,
            childProductId: d.childProductId,
            used: true,
            partId: d.childProduct?.productCode || '',
            category: d.childProduct?.category || '원재료',
            partName: d.childProduct?.name || '',
            partSpec: d.childProduct?.spec || '',
            partUnit: d.unit || d.childProduct?.unit || 'kg',
            recipeYield: d.yieldRate || 100,
            prodInputQty: d.unitQty * 100,
            prodActualQty: d.unitQty * 100,
            prodCost: d.unitQty * 100 * 2000,
            unitInputQty: d.unitQty,
            unitActualQty: d.unitQty,
            unitCost: d.unitQty * 2000,
            gyeName: d.gye?.name || '',
            remark: d.remark || '',
          }));
        }
      } catch (err: any) {
        alert('원본 BOM 조회 실패: ' + err.message);
        return;
      }
    }
    if (!srcChildren || srcChildren.length === 0) {
      alert('원본 제품에 등록된 구성품이 없습니다.');
      return;
    }
    const cloned = srcChildren.map((c, i) => ({ ...c, id: Date.now() + i }));
    setChildrenMap((prev) => ({ ...prev, [selectedParentId]: cloned }));
    alert(`원본 ${srcChildren.length}종을 가져왔습니다. [저장]을 눌러 확정하세요.`);
  };

  const selectedParent = parents.find((p) => p.id === selectedParentId) || parents[0] || SAMPLE_BOM_PARENTS[0];
  const currentChildren = childrenMap[selectedParentId] || [];

  const handleAddChild = () => {
    const newChild: BomChildMaterial = {
      id: Date.now(),
      used: true,
      partId: '20199999',
      category: '원재료',
      partName: '추가 배합 원부자재',
      partSpec: '1kg/팩',
      partUnit: 'kg',
      recipeYield: 99.0,
      prodInputQty: 1.0,
      prodActualQty: 1.01,
      prodCost: 5000,
      unitInputQty: 0.01,
      unitActualQty: 0.01,
      unitCost: 50,
      gyeName: '계량실(계량)',
      remark: '',
    };
    setChildrenMap((prev) => ({
      ...prev,
      [selectedParentId]: [...(prev[selectedParentId] || []), newChild],
    }));
  };

  const UPPER_COLUMNS: MasterGridColumnDef[] = [
    { key: 'used', label: '사용', width: '45px', align: 'center', format: 'checkbox' },
    { key: 'itemCode', label: '품번', width: '90px', align: 'center' },
    { key: 'category', label: '구분', width: '65px', align: 'center' },
    { key: 'variety', label: '품종', width: '75px', align: 'center' },
    { key: 'itemName', minWidth: '260px', label: '품명', align: 'left' },
    { key: 'spec', label: '규격', width: '95px', align: 'center' },
    { key: 'unit', label: '단위', width: '50px', align: 'center' },
    { key: 'baseProdQty', label: '생산기준량', width: '80px', align: 'right', format: 'number' },
    { key: 'recipeYield', label: '레시피수율(%)', width: '85px', align: 'right' },
    { key: 'prodCost', label: '(생산)투입원가', width: '95px', align: 'right', format: 'currency' },
    { key: 'unitCost', label: '(단위)투입원가', width: '95px', align: 'right', format: 'currency' },
    { key: 'bomCount', label: 'bom수량', width: '70px', align: 'right', format: 'number' },
    { key: 'gyeName', label: '계명칭', width: '110px', align: 'left' },
    { key: 'remark', label: '비고', width: '130px', align: 'left' },
  ];

  const LOWER_COLUMNS: MasterGridColumnDef[] = [
    { key: 'used', label: '사용', width: '45px', align: 'center', format: 'checkbox' },
    { key: 'partId', label: '파트id', width: '85px', align: 'center' },
    { key: 'category', label: '구분', width: '65px', align: 'center' },
    { key: 'partName', minWidth: '260px', label: '파트명', align: 'left' },
    { key: 'partSpec', label: '파트규격', width: '95px', align: 'center' },
    { key: 'partUnit', label: '파트단위', width: '60px', align: 'center' },
    { key: 'recipeYield', label: '레시피수율(%)', width: '85px', align: 'right' },
    { key: 'prodInputQty', label: '(생산)투입량', width: '85px', align: 'right', format: 'number' },
    { key: 'prodActualQty', label: '(생산)실투입량', width: '85px', align: 'right', format: 'number' },
    { key: 'prodCost', label: '(생산)투입원가', width: '95px', align: 'right', format: 'currency' },
    { key: 'unitInputQty', label: '(단위)투입량', width: '85px', align: 'right' },
    { key: 'unitActualQty', label: '(단위)실투입량', width: '85px', align: 'right' },
    { key: 'unitCost', label: '(단위)투입원가', width: '95px', align: 'right', format: 'currency' },
    { key: 'gyeName', label: '계명칭', width: '110px', align: 'left' },
    { key: 'remark', label: '비고', width: '130px', align: 'left' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      <MasterActionBar
        title="BOM(일반)"
        titleExtraButton={{
          label: '[test]',
          onClick: () => alert('BOM 수율 및 투입원가 검증 테스트 통과!'),
        }}
        buttons={[
          { key: 'new', label: '신규', icon: 'new', onClick: () => alert('신규 BOM 작성') },
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('BOM 조회 완료') },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => alert('초기화 완료') },
          { key: 'upload', label: '엑셀업로드', icon: 'upload', onClick: () => alert('BOM 엑셀 업로드 양식을 선택하세요.') },
          {
            key: 'download',
            label: '엑셀다운로드',
            icon: 'download',
            onClick: () =>
              exportGridToExcel({
                filename: 'BOM_기준정보_마스터',
                sheetName: 'BOM목록',
                columns: UPPER_COLUMNS,
                data: parents,
              }),
          },
          { key: 'copyImport', label: '복사가져오기', icon: 'importCopy', onClick: handleCopyFrom },
        ]}
        helpContent="제품 생산을 위한 표준 BOM 배합비(소요 원부자재, 생산기준량 대비 투입량, 레시피수율, 단위투입원가)를 등록하고 계산합니다."
      />

      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">품종:</span>
            <select
              value={varietyFilter}
              onChange={(e) => setVarietyFilter(e.target.value)}
              className="bg-white border border-gray-400 px-1.5 py-0.5 text-[12px] rounded-xs shadow-2xs focus:outline-blue-500"
            >
              <option value="ALL">ALL (전체)</option>
              <option value="김밥">김밥</option>
              <option value="주먹밥">주먹밥</option>
              <option value="도시락">도시락</option>
            </select>
          </div>

          <div className="flex items-center gap-1 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">검색어:</span>
            <input
              type="text"
              placeholder="품번 또는 품명 입력"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="bg-white border border-gray-400 px-2 py-0.5 text-[12px] rounded-xs shadow-2xs w-44"
            />
          </div>
        </div>

        <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
          데이터수: <span className="text-blue-700 font-bold">1047</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col min-h-0 p-2 gap-2">
        {/* Upper Grid (55%): Parents */}
        <div className="flex-[11] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <span className="font-bold text-gray-800">제품</span>
            <span className="text-[11px] text-gray-600">
              선택: <span className="font-bold text-blue-700">{selectedParent.itemName}</span> (BOM 항목: {currentChildren.length}종)
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={UPPER_COLUMNS}
              data={parents}
              selectedRowId={selectedParentId}
              onRowClick={(row) => {
                setSelectedParentId(row.id);
                const vs = versionsMap[row.id] || ['1.0'];
                setVersion(vs[vs.length - 1]);
              }}
              summaryRow={false}
            />
          </div>
        </div>

        {/* Lower Grid (45%): Children */}
        <div className="flex-[9] flex flex-col min-h-0 bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="bg-[#dfe3ec] px-2.5 py-1 flex items-center justify-between border-b border-[#b0b8c8]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">소요원부자재 ▶</span>
              <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.2 rounded border border-blue-300 font-semibold">
                {selectedParent.itemName} (총 단위투입원가: {selectedParent.unitCost.toLocaleString()}원)
              </span>
              <select
                value={version}
                onChange={(e) => handleVersionChange(e.target.value)}
                className="bg-white border border-gray-400 px-1.5 py-0.5 text-[11px] rounded-xs"
                title="BOM 버전"
              >
                {(versionsMap[selectedParentId] || ['1.0']).map((v) => (
                  <option key={v} value={v}>v{v}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleNewVersion}
                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded text-[11px] shadow-2xs"
                title="현재 구성을 다음 버전으로 복제 저장"
              >
                새버전
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <select
                value={copySourceId}
                onChange={(e) => setCopySourceId(e.target.value)}
                className="bg-white border border-gray-400 px-1.5 py-0.5 text-[11px] rounded-xs max-w-[200px]"
                title="복사해올 원본 제품"
              >
                <option value="">원본 선택...</option>
                {parents.filter((p) => p.id !== selectedParentId).map((p) => (
                  <option key={p.id} value={p.id}>{p.itemName}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCopyFrom}
                className="px-2 py-0.5 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded text-[11px] shadow-2xs"
              >
                복사해오기
              </button>
              <button
                type="button"
                onClick={handleAddChild}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-[11px] flex items-center gap-0.5 shadow-2xs"
              >
                <Plus size={11} /> 추가
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={LOWER_COLUMNS}
              data={currentChildren}
              summaryRowTitle="합계"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

