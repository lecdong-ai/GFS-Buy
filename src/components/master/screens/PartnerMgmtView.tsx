'use client';

import React, { useState, useEffect } from 'react';
import { MasterActionBar } from '../common/MasterActionBar';
import { MasterDataGrid, MasterGridColumnDef } from '../common/MasterDataGrid';
import { Info } from 'lucide-react';
import { exportGridToExcel, downloadExcelTemplate } from '@/lib/excelExport';

interface PartnerItem {
  id: number;
  used: boolean;
  autoConnect: boolean;
  partnerAccept: string; // 'N', 'Y'
  stockConnect: boolean;
  partnerType: '매출처' | '매입처' | '당사';
  partnerId: string;
  partnerName: string;
  bizNo: string;
  seq: number;
  ceoName: string;
  leadTime: number; // 조달기간
  orderMethod: string;
  orderDay: string;
  closingDay: number; // 마감일자 (99 = 말일, red bold)
  region: string;
  zone: string;
  manager: string;
  tel: string;
  email: string;
  address: string;
  deliveryCode: string;
  shortName: string;
  printOrder: number;
  remark: string;
}

const SAMPLE_PARTNERS: PartnerItem[] = [
  { id: 1, used: true, autoConnect: true, partnerAccept: 'Y', stockConnect: true, partnerType: '매출처', partnerId: '116-81-18745', partnerName: '지에스리테일(수도권물류)', bizNo: '116-81-18745', seq: 1, ceoName: '허연수', leadTime: 1, orderMethod: 'EDI', orderDay: '월~일', closingDay: 99, region: '국내', zone: '수도권', manager: '박선영 팀장', tel: '02-2007-0114', email: 'gs25_order@gsretail.com', address: '서울특별시 강남구 논현로 508', deliveryCode: 'GS01', shortName: 'GS수도권', printOrder: 1, remark: '대표 매출처' },
  { id: 2, used: true, autoConnect: true, partnerAccept: 'Y', stockConnect: true, partnerType: '매출처', partnerId: '116-81-18746', partnerName: '지에스리테일(경산센터)', bizNo: '116-81-18745', seq: 2, ceoName: '허연수', leadTime: 1, orderMethod: 'EDI', orderDay: '월~일', closingDay: 99, region: '국내', zone: '영남권', manager: '이진우 과장', tel: '053-850-1200', email: 'gs_gyeongsan@gsretail.com', address: '경상북도 경산시 진량읍', deliveryCode: 'GS02', shortName: 'GS경산', printOrder: 2, remark: '영남 직송' },
  { id: 3, used: true, autoConnect: false, partnerAccept: 'Y', stockConnect: true, partnerType: '매입처', partnerId: '11658', partnerName: '[네트웍스]광주식품', bizNo: '408-81-45678', seq: 3, ceoName: '김광주', leadTime: 2, orderMethod: '카톡13시', orderDay: '월,수,금', closingDay: 25, region: '국내', zone: '호남권', manager: '이창승 상무', tel: '062-951-8899', email: 'gj_food@daum.net', address: '광주광역시 광산구 하남산단', deliveryCode: 'GJ10', shortName: '광주식품', printOrder: 10, remark: '쌀 및 전처리 채소' },
  { id: 4, used: true, autoConnect: false, partnerAccept: 'Y', stockConnect: true, partnerType: '매입처', partnerId: '11003', partnerName: '[네트웍스]대상', bizNo: '101-81-34567', seq: 4, ceoName: '임정배', leadTime: 3, orderMethod: '이메일', orderDay: '화,목', closingDay: 99, region: '국내', zone: '수도권', manager: '정재근 대리', tel: '02-2220-9500', email: 'daesang_order@daesang.com', address: '서울특별시 동대문구 천호대로', deliveryCode: 'DS01', shortName: '대상', printOrder: 11, remark: '장류 및 조미료' },
  { id: 5, used: true, autoConnect: false, partnerAccept: 'Y', stockConnect: true, partnerType: '매입처', partnerId: '11043', partnerName: '[네트웍스]놀부', bizNo: '214-81-99887', seq: 5, ceoName: '안세진', leadTime: 2, orderMethod: '카톡', orderDay: '월~토', closingDay: 30, region: '국내', zone: '수도권', manager: '구동서 부장', tel: '02-598-7700', email: 'nolboo_erp@nolboo.co.kr', address: '경기도 성남시 분당구', deliveryCode: 'NB01', shortName: '놀부', printOrder: 12, remark: '육가공 양념육' },
  { id: 6, used: true, autoConnect: false, partnerAccept: 'Y', stockConnect: false, partnerType: '당사', partnerId: '10638', partnerName: '(주)GFS', bizNo: '131-86-55443', seq: 6, ceoName: '전정우', leadTime: 0, orderMethod: '내부전표', orderDay: '상시', closingDay: 99, region: '국내', zone: '본사', manager: '전정우 대표', tel: '031-765-8800', email: 'ceo@gfsfood.co.kr', address: '경기도 광주시 곤지암읍 도척로', deliveryCode: 'HQ01', shortName: 'GFS', printOrder: 99, remark: '식품제조 가공 본사' },
  { id: 7, used: false, autoConnect: false, partnerAccept: 'N', stockConnect: false, partnerType: '매입처', partnerId: '11473', partnerName: '[1]불용자재용(미사용)', bizNo: '000-00-00000', seq: 7, ceoName: '관리자', leadTime: 0, orderMethod: '기타', orderDay: '', closingDay: 99, region: '국내', zone: '기타', manager: '재고담당', tel: '010-0000-0000', email: '', address: '사내 가상계정', deliveryCode: '', shortName: '불용자재', printOrder: 999, remark: '불용 재고 감가 처리용' },
  { id: 8, used: true, autoConnect: false, partnerAccept: 'Y', stockConnect: true, partnerType: '매출처', partnerId: '11668', partnerName: '(주)영풍', bizNo: '504-81-22334', seq: 8, ceoName: '조재곤', leadTime: 2, orderMethod: '발주서', orderDay: '수', closingDay: 99, region: '국내', zone: '대구경북', manager: '김영하 대리', tel: '053-582-8888', email: 'yp_sales@youngpung.co.kr', address: '대구광역시 달서구 성서공단', deliveryCode: 'YP01', shortName: '영풍', printOrder: 20, remark: '수출용 떡볶이 납품' },
];

export const PartnerMgmtView: React.FC = () => {
  const [partners, setPartners] = useState<PartnerItem[]>(SAMPLE_PARTNERS);

  useEffect(() => {
    fetch('/api/master/partner')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: PartnerItem[] = res.data.map((p: any, idx: number) => ({
            id: idx + 1,
            used: p.isUsed !== false,
            autoConnect: true,
            partnerAccept: 'Y',
            stockConnect: true,
            partnerType: p.partnerType === 'S' ? '매출처' : p.partnerType === 'O' ? '당사' : '매입처',
            partnerId: p.id,
            partnerName: p.name,
            bizNo: p.bizNo || '000-00-00000',
            seq: idx + 1,
            ceoName: p.ceoName || '대표자',
            leadTime: p.leadTime || 1,
            orderMethod: p.orderMethod || 'EDI',
            orderDay: p.orderDay || '월~금',
            closingDay: 99,
            region: '국내',
            zone: '수도권',
            manager: p.contactPerson || '담당자',
            tel: p.tel || '010-0000-0000',
            email: p.email || 'info@partner.com',
            address: p.address || '사업장 주소',
            deliveryCode: `D-${p.id}`,
            shortName: p.name.slice(0, 6),
            printOrder: idx + 1,
            remark: p.remark || '',
          }));
          setPartners(mapped);
        }
      })
      .catch((err) => console.error('Failed to load partners from DB:', err));
  }, []);

  const handleCellChange = (id: number, colKey: string, val: any) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [colKey]: val } : p))
    );
  };

  const handleNew = () => {
    const newItem: PartnerItem = {
      id: Date.now(),
      used: true,
      autoConnect: false,
      partnerAccept: 'N',
      stockConnect: false,
      partnerType: '매입처',
      partnerId: String(Date.now()).slice(-5),
      partnerName: '신규 거래처(입력)',
      bizNo: '000-00-00000',
      seq: partners.length + 1,
      ceoName: '대표자',
      leadTime: 2,
      orderMethod: '이메일',
      orderDay: '월~금',
      closingDay: 99,
      region: '국내',
      zone: '수도권',
      manager: '담당자',
      tel: '010-0000-0000',
      email: 'vendor@email.com',
      address: '사업장 주소',
      deliveryCode: '',
      shortName: '신규약칭',
      printOrder: partners.length + 1,
      remark: '',
    };
    setPartners((prev) => [...prev, newItem]);
  };

  const handleSave = async () => {
    try {
      for (const p of partners) {
        await fetch('/api/master/partner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: p.partnerId,
            name: p.partnerName,
            partnerType: p.partnerType === '매출처' ? 'S' : p.partnerType === '당사' ? 'O' : 'P',
            bizNo: p.bizNo,
            ceoName: p.ceoName,
            contactPerson: p.manager,
            tel: p.tel,
            email: p.email,
            orderDay: p.orderDay,
            leadTime: p.leadTime,
            remark: p.remark,
          }),
        });
      }
      alert('거래처 마스터 정보가 데이터베이스에 성공적으로 저장되었습니다.');
    } catch (err: any) {
      alert('거래처 저장 중 오류: ' + err.message);
    }
  };

  const handleReset = () => {
    setPartners(SAMPLE_PARTNERS);
    alert('초기화되었습니다.');
  };

  const COLUMNS: MasterGridColumnDef[] = [
    { key: 'used', label: '사용', width: '45px', align: 'center', format: 'checkbox' },
    { key: 'autoConnect', label: '자동연결', width: '60px', align: 'center', format: 'checkbox' },
    { key: 'partnerAccept', label: '거래처수락', width: '75px', align: 'center' },
    { key: 'stockConnect', label: '재고연결', width: '60px', align: 'center', format: 'checkbox' },
    {
      key: 'partnerType',
      label: '거래처타입',
      width: '85px',
      align: 'center',
      format: 'dropdown',
      options: ['매출처', '매입처', '당사'],
    },
    { key: 'partnerId', label: '거래처id', width: '105px', align: 'center' },
    {
      key: 'partnerName',
      label: '거래처명',
      minWidth: '260px',
      align: 'left',
      isDangerText: (_, row) => !row.used || row.partnerName.includes('미사용'),
    },
    { key: 'bizNo', label: '사업자번호', width: '110px', align: 'center' },
    { key: 'seq', label: 'SEQ', width: '45px', align: 'center', format: 'number' },
    { key: 'ceoName', label: '대표자', width: '80px', align: 'center' },
    {
      key: 'leadTime',
      label: '조달기간',
      width: '65px',
      align: 'right',
      format: 'number',
      isDangerText: (val) => Number(val) > 2,
    },
    { key: 'orderMethod', label: '주문방법', width: '85px', align: 'center' },
    { key: 'orderDay', label: '발주요일', width: '80px', align: 'center' },
    {
      key: 'closingDay',
      label: '마감일자',
      width: '65px',
      align: 'center',
      isDangerText: (val) => val === 99,
      render: (val) => (
        <span className={val === 99 ? 'text-red-600 font-bold' : ''}>
          {val === 99 ? '99(말일)' : val}
        </span>
      ),
    },
    { key: 'region', label: '지역', width: '60px', align: 'center' },
    { key: 'zone', label: '권역', width: '75px', align: 'center' },
    { key: 'manager', label: '담당', width: '85px', align: 'center' },
    { key: 'tel', label: '연락처', width: '110px', align: 'center' },
    { key: 'email', label: 'email', width: '170px', align: 'left' },
    { key: 'address', label: '주소', width: '220px', align: 'left' },
    { key: 'deliveryCode', label: '납품처코드', width: '85px', align: 'center' },
    {
      key: 'shortName',
      label: '축약명',
      width: '90px',
      align: 'center',
      isDangerText: (_, row) => !row.used,
    },
    { key: 'printOrder', label: '출력순서', width: '65px', align: 'right', format: 'number' },
    { key: 'remark', label: '비고', width: '160px', align: 'left' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      <MasterActionBar
        title="거래처관리"
        buttons={[
          { key: 'new', label: '신규', icon: 'new', onClick: handleNew },
          { key: 'search', label: '조회', icon: 'search', onClick: () => alert('거래처 목록이 조회되었습니다.') },
          { key: 'save', label: '저장', icon: 'save', onClick: handleSave },
          { key: 'reset', label: '초기화', icon: 'reset', onClick: handleReset },
          { key: 'upload', label: '엑셀업로드', icon: 'upload', onClick: () => alert('엑셀 일괄 업로드 파일을 선택하세요.') },
          {
            key: 'template',
            label: '업로드양식',
            icon: 'template',
            onClick: () =>
              downloadExcelTemplate('거래처_등록표준양식', [
                '거래처구분',
                '거래처코드',
                '거래처명',
                '사업자번호',
                '대표자',
                '담당자',
                '전화번호',
                '이메일',
                '조달기간',
              ]),
          },
          {
            key: 'download',
            label: '엑셀다운로드',
            icon: 'download',
            onClick: () =>
              exportGridToExcel({
                filename: '거래처_마스터_전체목록',
                sheetName: '거래처',
                columns: COLUMNS,
                data: partners,
              }),
          },
        ]}
        helpContent="매출처(GS25 물류센터 등), 매입처(식자재 공급사) 및 사내 계정의 사업자등록번호, 조달기간, 마감일자 조건을 관리합니다."
      />

      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2 text-gray-700">
          <Info size={14} className="text-blue-700" />
          <span className="font-semibold text-[11px] text-gray-800">
            마감일이 말일인 경우 <span className="text-red-600 font-bold">99</span>로 입력
          </span>
        </div>
        <span className="text-[11px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 font-semibold shadow-2xs">
          데이터수: <span className="text-blue-700 font-bold">207</span>
        </span>
      </div>

      <div className="flex-1 min-h-0 p-2">
        <div className="h-full flex flex-col bg-white border border-[#94a3b8] rounded shadow-xs">
          <div className="flex-1 min-h-0">
            <MasterDataGrid
              columns={COLUMNS}
              data={partners}
              onCellChange={handleCellChange}
              summaryRow={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

