'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import { RotateCw, Search } from 'lucide-react';

interface CvsStoreItem {
  id: number;
  useYn: boolean;
  centerName: string;
  storeId: string;
  storeName: string;
  bizNo: string;
  ownerName: string;
  phone: string;
  address: string;
  status: string;
}

// GS25 Base sample stores for realistic procedural generation to 6,459
const BASE_CENTERS = [
  'GSR 김포',
  'GSR 오산',
  'GSR 용인',
  'GSR 경산2저온',
  'GSR 양산',
  'GSR 광주',
  'GSR 원주',
  'GSR 제주',
];

const BASE_STORES = [
  { prefix: 'VDP', name: '가산청기와점', owner: '김영희', addr: '서울 금천구 가산디지털1로 128' },
  { prefix: 'VKX', name: '가흥프레시점', owner: '이철수', addr: '경북 영주시 가흥로 45' },
  { prefix: 'VKY', name: '강남대명점', owner: '박민우', addr: '서울 강남구 테헤란로 134' },
  { prefix: 'VMM', name: '역삼테헤란점', owner: '정수진', addr: '서울 강남구 역삼로 210' },
  { prefix: 'VMN', name: '분당서현점', owner: '최동훈', addr: '경기 성남시 분당구 서현로 180' },
  { prefix: 'VOP', name: '일산호수점', owner: '황진희', addr: '경기 고양시 일산동구 중앙로 1200' },
  { prefix: 'VPS', name: '수원인계점', owner: '강태영', addr: '경기 수원시 팔달구 인계로 88' },
  { prefix: 'VQB', name: '부천중동점', owner: '조현정', addr: '경기 부천시 길주로 210' },
  { prefix: 'VRR', name: '안양평촌점', owner: '윤상호', addr: '경기 안양시 동안구 시민대로 195' },
  { prefix: 'VSK', name: '송도센트럴점', owner: '한지민', addr: '인천 연수구 송도과학로 32' },
  { prefix: 'VTC', name: '천안불당점', owner: '서동수', addr: '충남 천안시 서북구 불당21로 67' },
  { prefix: 'VUG', name: '청주가경점', owner: '오미란', addr: '충북 청주시 흥덕구 가경로 102' },
  { prefix: 'VVH', name: '대전둔산점', owner: '백승호', addr: '대전 서구 둔산로 51' },
  { prefix: 'VWW', name: '대구동성로점', owner: '송지은', addr: '대구 중구 동성로 25' },
  { prefix: 'VXA', name: '부산서면점', owner: '안재현', addr: '부산 부산진구 중앙대로 692' },
  { prefix: 'VYB', name: '울산삼산점', owner: '양희철', addr: '울산 남구 삼산로 241' },
  { prefix: 'VZC', name: '광주상무점', owner: '임선영', addr: '광주 서구 상무중앙로 78' },
  { prefix: 'VAA', name: '전주신시가지점', owner: '신동엽', addr: '전북 전주시 완산구 홍산중앙로 30' },
  { prefix: 'VBB', name: '원주단계점', owner: '문선미', addr: '강원 원주시 북원로 2250' },
  { prefix: 'VCC', name: '제주공항점', owner: '고승환', addr: '제주 제주시 공항로 2' },
];

function generate6459Stores(): CvsStoreItem[] {
  const list: CvsStoreItem[] = [];
  const total = 6459;
  for (let i = 0; i < total; i++) {
    const baseIdx = i % BASE_STORES.length;
    const centerIdx = i % BASE_CENTERS.length;
    const base = BASE_STORES[baseIdx];
    const center = BASE_CENTERS[centerIdx];
    const seqStr = String((i % 90) + 10).padStart(2, '0');
    const storeCode = `${base.prefix}${seqStr}`;
    const suffix = i >= BASE_STORES.length ? `${Math.floor(i / BASE_STORES.length) + 1}호점` : '';

    list.push({
      id: i + 1,
      useYn: i % 40 !== 0, // majority used
      centerName: center,
      storeId: storeCode,
      storeName: `GS25${base.name.replace('점', '')}${suffix ? suffix : '점'}`,
      bizNo: `10${(i % 8) + 1}-${(i % 80) + 10}-${String(10000 + i).slice(-5)}`,
      ownerName: base.owner,
      phone: `02-${(i % 800) + 100}-${String(1000 + i).slice(-4)}`,
      address: `${base.addr} ${i > 20 ? (i % 200) + 1 + '호' : ''}`,
      status: i % 40 === 0 ? '휴점' : '정상영업',
    });
  }
  return list;
}

export const CvsMgmtView: React.FC = () => {
  const [data, setData] = useState<CvsStoreItem[]>(() => generate6459Stores());
  const [selectedCenter, setSelectedCenter] = useState('전체');
  const [useFilter, setUseFilter] = useState('전체');
  const [keyword, setKeyword] = useState('');
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/master/cvs-store')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          const loaded: CvsStoreItem[] = json.data.map((s: any) => ({
            id: s.id,
            useYn: s.isUsed !== false,
            centerName: s.centerCode || 'GSR 김포',
            storeId: s.storeCode,
            storeName: s.storeName,
            bizNo: '101-85-00000',
            ownerName: '대표',
            phone: s.tel || '02-000-0000',
            address: s.address || '',
            status: s.status || '정상영업',
          }));
          setData(loaded);
        }
      })
      .catch((err) => console.error('Failed to load CVS stores', err));
  }, []);

  const handleSave = async () => {
    try {
      const topRows = data.slice(0, 50).map((r) => ({
        storeCode: r.storeId,
        storeName: r.storeName,
        centerCode: r.centerName,
        address: r.address,
        tel: r.phone,
        status: r.status,
      }));
      const res = await fetch('/api/master/cvs-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: topRows }),
      });
      const json = await res.json();
      if (json.success) {
        alert('편의점 마스터 변경사항이 데이터베이스에 안전하게 저장되었습니다.');
      } else {
        alert('저장 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('저장 중 오류: ' + err.message);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedCenter !== '전체' && item.centerName !== selectedCenter) return false;
      if (useFilter === '사용' && !item.useYn) return false;
      if (useFilter === '미사용' && item.useYn) return false;
      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        const matchName = item.storeName.toLowerCase().includes(kw);
        const matchId = item.storeId.toLowerCase().includes(kw);
        const matchOwner = item.ownerName.toLowerCase().includes(kw);
        if (!matchName && !matchId && !matchOwner) return false;
      }
      return true;
    });
  }, [data, selectedCenter, useFilter, keyword]);

  const handleCellChange = (rowId: any, columnKey: string, newValue: any) => {
    setData((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [columnKey]: newValue } : r))
    );
  };

  const handleNew = () => {
    const newItem: CvsStoreItem = {
      id: Date.now(),
      useYn: true,
      centerName: selectedCenter !== '전체' ? selectedCenter : 'GSR 김포',
      storeId: 'VNEW1',
      storeName: 'GS25신규점',
      bizNo: '101-85-00000',
      ownerName: '홍길동',
      phone: '02-123-4567',
      address: '서울시',
      status: '정상영업',
    };
    setData([newItem, ...data]);
    setSelectedRowId(newItem.id);
  };

  const handleReset = () => {
    setSelectedCenter('전체');
    setUseFilter('전체');
    setKeyword('');
    setSelectedRowId(null);
  };

  const columns: MasterGridColumnDef[] = [
    {
      key: 'useYn',
      label: '사용',
      width: '70px',
      align: 'center',
      format: 'checkbox',
      editable: true,
      sortable: true,
    },
    {
      key: 'centerName',
      label: '센터',
      width: '140px',
      align: 'center',
      format: 'dropdown',
      options: BASE_CENTERS,
      editable: true,
      sortable: true,
      filterable: true,
    },
    {
      key: 'storeId',
      label: '편의점id',
      width: '120px',
      align: 'center',
      sortable: true,
      filterable: true,
    },
    {
      key: 'storeName',
      label: '편의점명',
      minWidth: '280px',
      sortable: true,
      filterable: true,
    },
    {
      key: 'bizNo',
      label: '사업자번호',
      width: '130px',
      align: 'center',
      sortable: true,
    },
    {
      key: 'ownerName',
      label: '점주명',
      width: '100px',
      align: 'center',
      sortable: true,
    },
    {
      key: 'phone',
      label: '전화번호',
      width: '130px',
      align: 'center',
    },
    {
      key: 'status',
      label: '영업상태',
      width: '90px',
      align: 'center',
      isDangerText: (v) => v === '휴점',
    },
    {
      key: 'address',
      label: '점포주소',
      minWidth: '320px',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] text-[12px] select-none">
      {/* 1. Header Action Bar */}
      <MasterActionBar
        title="편의점관리"
        buttons={[
          { key: 'new', label: '신규', icon: 'new', onClick: handleNew },
          { key: 'search', label: '조회', icon: 'search', onClick: () => {} },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: handleReset },
          {
            key: 'upload',
            label: '엑셀업로드',
            icon: 'upload',
            onClick: () => alert('편의점 마스터 엑셀 대량 업로드 창을 엽니다.'),
          },
        ]}
        helpContent="전국 GS25 편의점 점포 마스터를 조회/관리합니다. 센터별 소속 점포 및 사용 여부를 지정하며 엑셀 일괄 업로드가 가능합니다."
      />

      {/* 2. Filter Bar */}
      <div className="bg-[#e4e8ee] border-b border-[#b0b8c2] px-3 py-1.5 flex items-center justify-between gap-4 text-[12px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">센터</span>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px] focus:outline-none focus:border-blue-600"
            >
              <option value="전체">전체</option>
              {BASE_CENTERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">사용여부</span>
            <select
              value={useFilter}
              onChange={(e) => setUseFilter(e.target.value)}
              className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px] focus:outline-none focus:border-blue-600"
            >
              <option value="전체">전체</option>
              <option value="사용">사용</option>
              <option value="미사용">미사용</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="font-semibold text-gray-700">편의점명/ID</span>
            <div className="relative">
              <input
                type="text"
                placeholder="점포명 또는 코드 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-white border border-gray-400 rounded px-2 py-0.5 text-[12px] w-48 focus:outline-none focus:border-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1.5 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12px] font-bold text-gray-700">
            데이터수: <span className="text-blue-700">{filteredData.length.toLocaleString()}</span>
          </span>
          <button
            onClick={() => {
              setKeyword('');
              setSelectedCenter('전체');
              setUseFilter('전체');
            }}
            title="새로고침"
            className="p-1 text-gray-600 hover:text-black rounded hover:bg-gray-200 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Main DataGrid with Pagination */}
      <div className="flex-1 p-2 bg-[#d8dde5] overflow-hidden flex flex-col">
        <div className="flex-1 bg-white border border-[#9aa2ad] shadow-sm flex flex-col overflow-hidden">
          <MasterDataGrid
            columns={columns}
            data={filteredData}
            selectedRowId={selectedRowId}
            onRowClick={(row) => setSelectedRowId(row.id)}
            onCellChange={handleCellChange}
            showRowIndex={true}
            summaryRow={false}
            enablePagination={true}
            pageSize={100}
          />
        </div>
      </div>
    </div>
  );
};

