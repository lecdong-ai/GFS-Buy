'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import { exportGridToExcel, downloadExcelTemplate } from '@/lib/excelExport';

interface ProductItem {
  id: number;
  used: string;
  autoVendor: boolean;
  itemCode: string;
  category: string;
  variety: string;
  itemName: string;
  spec: string;
  unit: string;
  gyeName: string;
  vendor: string;
  safetyStock: number;
  moq: number;
  connectedCount: number;
  remark: string;
}

const SAMPLE_PRODUCTS: ProductItem[] = [
  { id: 1, used: '사용', autoVendor: true, itemCode: '10001021', category: '완성품', variety: '김밥', itemName: '참치마요김밥(밥김)', spec: '230g*1줄', unit: 'ea', gyeName: '성형장(김밥)', vendor: '지에스리테일', safetyStock: 100, moq: 50, connectedCount: 3, remark: '대표 베스트셀러' },
  { id: 2, used: '사용', autoVendor: true, itemCode: '10001022', category: '완성품', variety: '김밥', itemName: '매콤제육김밥', spec: '240g*1줄', unit: 'ea', gyeName: '성형장(김밥)', vendor: '지에스리테일', safetyStock: 80, moq: 40, connectedCount: 0, remark: '' },
  { id: 3, used: '사용', autoVendor: true, itemCode: '10002015', category: '완성품', variety: '주먹밥', itemName: '참치마요삼각김밥', spec: '110g*1개', unit: 'ea', gyeName: '성형장(삼각김밥)', vendor: '지에스리테일', safetyStock: 300, moq: 100, connectedCount: 4, remark: 'GS리테일 삼각 대표' },
  { id: 4, used: '사용', autoVendor: true, itemCode: '10002018', category: '완성품', variety: '주먹밥', itemName: '전주비빔삼각김밥', spec: '115g*1개', unit: 'ea', gyeName: '성형장(삼각김밥)', vendor: '지에스리테일', safetyStock: 250, moq: 100, connectedCount: 2, remark: '비빔 소스 투입' },
  { id: 5, used: '사용', autoVendor: true, itemCode: '10003050', category: '완성품', variety: '도시락', itemName: '11가지찬많은도시락', spec: '460g*1팩', unit: 'ea', gyeName: '성형장(도시락)', vendor: '지에스리테일', safetyStock: 150, moq: 50, connectedCount: 5, remark: '정식 도시락 1위' },
  { id: 6, used: '사용', autoVendor: true, itemCode: '10004011', category: '완성품', variety: '샌드위치', itemName: '듬뿍에그샐러드샌드', spec: '180g*1개', unit: 'ea', gyeName: '성형장(샌드위치)', vendor: '지에스리테일', safetyStock: 100, moq: 40, connectedCount: 2, remark: '빵류' },
  { id: 7, used: '사용', autoVendor: true, itemCode: '10005008', category: '완성품', variety: '조리면', itemName: '우삼겹김치볶음우동', spec: '350g*1팩', unit: 'ea', gyeName: '성형장(조리면)', vendor: '지에스리테일', safetyStock: 80, moq: 30, connectedCount: 1, remark: '면류 신제품' },
  { id: 8, used: '사용', autoVendor: true, itemCode: '10006004', category: '완성품', variety: '햄버거', itemName: '더블불고기버거', spec: '210g*1개', unit: 'ea', gyeName: '성형장(햄버거)', vendor: '지에스리테일', safetyStock: 120, moq: 50, connectedCount: 2, remark: '' },
];

export const ProductRegView: React.FC = () => {
  const [allChecked, setAllChecked] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('완성품');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [audit, setAudit] = useState<any>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>(SAMPLE_PRODUCTS);
  const [dirtyRowIds, setDirtyRowIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/master/product')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ProductItem[] = res.data.map((p: any, idx: number) => ({
            id: p.id || idx + 1,
            used: '사용',
            autoVendor: true,
            itemCode: p.productCode,
            category: p.category || '완성품',
            variety: p.kind || '김밥',
            itemName: p.name,
            spec: p.spec || '230g*1줄',
            unit: p.unit || 'ea',
            gyeName: p.gyeName || '성형장(김밥)',
            vendor: p.partnerName || '지에스리테일',
            safetyStock: p.safetyStockQty || 100,
            moq: p.minOrderQty || 50,
            connectedCount: p.bomCount ?? 0,
            remark: '',
          }));
          setProducts(mapped);
        }
      })
      .catch((err) => console.error('Failed to load products from API:', err));
  }, []);

  // 구분별 건수 + 이름겹침(완성품/자재 중복) 탐지
  const catCounts = useMemo(() => {
    const m: Record<string, number> = { 완성품: 0, 반제품: 0, 원재료: 0, 부자재: 0 };
    products.forEach((p) => {
      if (m[p.category] !== undefined) m[p.category] += 1;
    });
    return m;
  }, [products]);

  const dupNorms = useMemo(() => {
    const byNorm = new Map<string, Set<string>>();
    products.forEach((p) => {
      const k = p.itemName.replace(/\[.+?\]/g, '').replace(/\(.+?\)/g, '').replace(/[^가-힣a-zA-Z0-9]/g, '').toLowerCase();
      if (!k) return;
      if (!byNorm.has(k)) byNorm.set(k, new Set());
      byNorm.get(k)!.add(p.category);
    });
    const dups = new Set<string>();
    byNorm.forEach((cats, k) => {
      if (cats.size > 1) dups.add(k);
    });
    return dups;
  }, [products]);

  const normOf = (s: string) =>
    s.replace(/\[.+?\]/g, '').replace(/\(.+?\)/g, '').replace(/[^가-힣a-zA-Z0-9]/g, '').toLowerCase();

  // 품명 정본 대조 (엑셀 vs ERP)
  const handleNameAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch('/api/gfs/name-audit');
      const json = await res.json();
      if (json.success) {
        setAudit(json.data);
        setAuditOpen(true);
      } else {
        alert('대조 실패: ' + (json.error || '알 수 없는 오류'));
      }
    } catch (e: any) {
      alert('대조 중 오류: ' + e.message);
    } finally {
      setAuditLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (vendorFilter !== 'ALL' && p.vendor !== vendorFilter) return false;
    if (searchKeyword.trim() && !p.itemName.includes(searchKeyword.trim()) && !p.itemCode.includes(searchKeyword.trim())) {
      return false;
    }
    return true;
  });

  const handleCellChange = (id: any, key: string, val: any) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const numKeys = ['safetyStock', 'moq'];
          const finalVal = numKeys.includes(key) ? Number(val) || 0 : val;
          return { ...p, [key]: finalVal };
        }
        return p;
      })
    );
    setDirtyRowIds((prev) => new Set(prev).add(Number(id)));
  };

  const handleNew = () => {
    const newId = Date.now();
    const newItem: ProductItem = {
      id: newId,
      used: '사용',
      autoVendor: true,
      itemCode: String(10000000 + products.length + 1),
      category: '완성품',
      variety: '도시락',
      itemName: '신규 제품(입력)',
      spec: '규격입력',
      unit: 'ea',
      gyeName: '성형장(도시락)',
      vendor: '지에스리테일',
      safetyStock: 50,
      moq: 20,
      connectedCount: 0,
      remark: '',
    };
    setProducts((prev) => [newItem, ...prev]);
    setDirtyRowIds((prev) => new Set(prev).add(newId));
  };

  const handleSave = async () => {
    if (dirtyRowIds.size === 0) {
      alert('수정된 품목 내역이 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const targetProducts = products.filter((p) => dirtyRowIds.has(p.id));
      let bomEnsured = 0;
      for (const p of targetProducts) {
        const res = await fetch('/api/master/product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productCode: p.itemCode,
            name: p.itemName,
            spec: p.spec,
            unit: p.unit,
            category: p.category,
            kind: p.variety,
            safetyStockQty: p.safetyStock,
            minOrderQty: p.moq,
            remark: p.remark,
          }),
        });
        const json = await res.json().catch(() => null);
        // 신메뉴(완성품/반제품) 등록 시 BOM 헤더 자동생성 (없을 때만, v1.0)
        const savedId = json?.data?.id;
        if (json?.success && savedId && (p.category === '완성품' || p.category === '반제품')) {
          try {
            const chk = await fetch(`/api/master/bom?productId=${savedId}`).then((r) => r.json()).catch(() => null);
            if (chk?.success && Array.isArray(chk.data) && chk.data.length === 0) {
              await fetch('/api/master/bom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  parentProductId: savedId,
                  version: '1.0',
                  effectiveDate: new Date().toISOString().slice(0, 10),
                  details: [],
                  remark: '신메뉴 자동생성',
                }),
              });
              bomEnsured += 1;
            }
          } catch {
            /* BOM 자동생성은 부가 기능이라 실패해도 저장 계속 */
          }
        }
      }
      setDirtyRowIds(new Set());
      alert(
        `총 ${targetProducts.length}건의 품목 마스터 정보가 데이터베이스에 성공적으로 저장되었습니다.` +
          (bomEnsured > 0 ? `\n신메뉴 BOM ${bomEnsured}건 자동생성(v1.0) — BOM(일반)에서 구성품을 등록하세요.` : '')
      );
    } catch (err: any) {
      alert('저장 중 오류 발생: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const COLUMNS: MasterGridColumnDef[] = [
    { key: 'used', label: '사용', width: '55px', align: 'center', format: 'dropdown', options: ['사용', '미사용'] },
    { key: 'autoVendor', label: '자동거래처', width: '70px', align: 'center', format: 'checkbox' },
    { key: 'itemCode', label: '품번', width: '90px', align: 'center', editable: false },
    { key: 'category', label: '구분', width: '65px', align: 'center', format: 'dropdown', options: ['완성품', '반제품', '원재료', '부재료'] },
    { key: 'variety', label: '품종', width: '75px', align: 'center', format: 'dropdown', options: ['조리면', '샌드위치', '도시락', '주먹밥', '김밥', '햄버거'] },
    { key: 'itemName', minWidth: '260px', label: '품명', align: 'left', editable: true,
      render: (val, row) => {
        const isDup = dupNorms.has(normOf(String(row.itemName || '')));
        return (
          <span className="flex items-center gap-1.5">
            <span>{String(val ?? '')}</span>
            {isDup && (
              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap" title="같은 이름이 다른 구분에도 있음">
                중복
              </span>
            )}
          </span>
        );
      },
    },
    { key: 'spec', label: '규격', width: '95px', align: 'center', editable: true },
    { key: 'unit', label: '단위', width: '50px', align: 'center', editable: true },
    { key: 'gyeName', label: '계명칭', width: '110px', align: 'left' },
    { key: 'vendor', label: '거래처', width: '120px', align: 'left', editable: true },
    { key: 'safetyStock', label: '안전재고', width: '70px', align: 'right', format: 'number', editable: true },
    { key: 'moq', label: '최소주문수량', width: '85px', align: 'right', format: 'number', editable: true },
    { key: 'connectedCount', label: '연결제품수(BOM)', width: '90px', align: 'right', format: 'number', editable: false },
    { key: 'remark', label: '비고', width: '140px', align: 'left', editable: true },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      <MasterActionBar
        title="제품등록"
        buttons={[
          { key: 'new', label: '신규', icon: 'new', onClick: handleNew },
          { key: 'audit', label: auditLoading ? '대조 중...' : '정본대조', icon: 'search', onClick: handleNameAudit },
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('제품 목록 조회 완료') },
          {
            key: 'save',
            label: isSaving ? '저장 중...' : dirtyRowIds.size > 0 ? `저장 (${dirtyRowIds.size}건)` : '저장',
            icon: 'save',
            onClick: handleSave,
          },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: () => setProducts(SAMPLE_PRODUCTS) },
          { key: 'upload', label: '엑셀업로드', icon: 'upload', onClick: () => alert('제품 엑셀 업로드 파일을 선택하세요.') },
          {
            key: 'template',
            label: '업로드양식',
            icon: 'template',
            onClick: () =>
              downloadExcelTemplate('제품_원부자재_등록양식', [
                '품목코드',
                '구분',
                '품종',
                '품목명',
                '규격',
                '단위',
                '과세구분',
                '소비기한(일)',
                '보관방법',
                '입고단가',
                '출하단가',
              ]),
          },
          {
            key: 'download',
            label: '엑셀다운로드',
            icon: 'download',
            onClick: () =>
              exportGridToExcel({
                filename: '제품_원부자재_마스터',
                sheetName: '품목마스터',
                columns: COLUMNS,
                data: filteredProducts,
              }),
          },
        ]}
        helpContent="완성품, 반제품, 원부재료 마스터의 안전재고, 최소주문수량 및 BOM 연결정보를 등록/관리합니다."
      />

      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1 cursor-pointer font-medium text-gray-700">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => setAllChecked(e.target.checked)}
              className="rounded accent-blue-600"
            />
            전체
          </label>

          <div className="flex items-center gap-1 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">구분:</span>
            <div className="flex items-center gap-0.5 bg-gray-200/70 p-0.5 rounded border border-gray-300">
              {['전체', '완성품', '반제품', '원재료', '부자재'].map((c) => {
                const key = c === '전체' ? 'ALL' : c;
                const isActive = categoryFilter === key;
                const cnt = c === '전체' ? products.length : catCounts[c] || 0;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategoryFilter(key)}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-xs whitespace-nowrap ${
                      isActive ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {c} <span className="font-mono">{cnt}</span>
                  </button>
                );
              })}
            </div>
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

          <div className="flex items-center gap-1 pl-3 border-l border-gray-300">
            <span className="font-semibold text-gray-700">거래처:</span>
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="bg-white border border-gray-400 px-1.5 py-0.5 text-[12px] rounded-xs shadow-2xs focus:outline-blue-500"
            >
              <option value="ALL">ALL (전체)</option>
              <option value="지에스리테일">지에스리테일</option>
            </select>
          </div>
        </div>

        <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
          데이터수: <span className="text-blue-700 font-bold">2329</span>
        </span>
      </div>

      {auditOpen && audit && (
        <div className="bg-amber-50 border-b border-amber-300 px-3 py-1.5 text-[12px] shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-gray-800">정본대조 (발주서 정본 기준)</span>
            <span>엑셀 자재 <strong className="text-blue-700">{audit.excelMaterials}</strong> · 메뉴 <strong className="text-blue-700">{audit.excelMenus}</strong> · ERP <strong className="text-blue-700">{audit.erpCount}</strong></span>
            <span>미등록 자재 <strong className="text-red-700">{audit.missingMaterials?.length ?? 0}</strong> · 미등록 메뉴 <strong className="text-red-700">{audit.missingMenus?.length ?? 0}</strong> · 엑셀외 ERP <strong className="text-gray-700">{audit.erpNotInExcel?.length ?? 0}</strong> · 이름겹침 <strong className="text-amber-700">{audit.dupNames?.length ?? 0}</strong></span>
            <button type="button" onClick={() => setAuditOpen(false)} className="ml-auto px-2 py-0.5 bg-white border border-gray-400 rounded text-[11px] hover:bg-gray-100">닫기</button>
          </div>
          {(audit.missingMaterials?.length > 0 || audit.missingMenus?.length > 0) && (
            <div className="mt-1 grid grid-cols-2 gap-2 max-h-[120px] overflow-auto">
              <div className="bg-white border border-gray-300 rounded p-1.5">
                <div className="font-bold text-[11px] text-red-700 mb-0.5">미등록 자재 (BOM 일괄적재로 생성 가능)</div>
                <div className="text-[11px] text-gray-700 leading-relaxed">{audit.missingMaterials.slice(0, 50).join(' / ')}{audit.missingMaterials.length > 50 ? ` 외 ${audit.missingMaterials.length - 50}건` : ''}</div>
              </div>
              <div className="bg-white border border-gray-300 rounded p-1.5">
                <div className="font-bold text-[11px] text-red-700 mb-0.5">미등록 메뉴 (BOM 일괄적재로 생성 가능)</div>
                <div className="text-[11px] text-gray-700 leading-relaxed">{audit.missingMenus.slice(0, 50).join(' / ')}{audit.missingMenus.length > 50 ? ` 외 ${audit.missingMenus.length - 50}건` : ''}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 p-2">
        <div className="h-full flex flex-col bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={COLUMNS}
              data={filteredProducts}
              onCellChange={handleCellChange}
              summaryRow={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

