export interface AdminUserItem {
  id: number;
  userId: string;
  userName: string;
  status: '정상' | '잠김' | '휴면';
  lastLogin: string;
  permLevel: string;
  levelName: string;
  company: string;
  department: string;
  remark: string;
  phone: string;
  email: string;
  empNo: string;
  used: boolean;
}

export interface PagePermItem {
  pageCode: string;
  pageName: string;
  canRead: boolean;
  canWrite: boolean;
}

export interface ChangeRequestItem {
  id: number;
  reqId: number;
  reqDate: string;
  title: string;
  priority: number;
  result: '완료' | '진행중' | '접수대기' | '보류';
  execDate: string;
  remark: string;
  hasPhoto: boolean;
  client: string;
  requester: string;
}

export interface SystemUsageSummaryItem {
  id: number;
  pageCode: string;
  pageName: string;
  actionName: string; // 조회, 저장, 엑셀업로드, 초기화, 인쇄 등
  callCount: number;
}

export interface SystemUsageDetailItem {
  id: number;
  pageCode: string;
  actionName: string;
  userName: string;
  timestamp: string;
  ipAddress: string;
  clientVersion: string;
}

// 1. Initial Users (사용자 마스터 2)
export const INITIAL_ADMIN_USERS: AdminUserItem[] = [
  {
    id: 1,
    userId: 'heebee',
    userName: '전정우',
    status: '정상',
    lastLogin: '2026-10-30 11:42:15',
    permLevel: '00',
    levelName: '00:시스템관리자',
    company: '(주)GFS',
    department: '(주)GFS-전산실',
    remark: 'ERP/MES 시스템 총괄 운영자',
    phone: '010-9876-5432',
    email: 'jwjun@gfs.co.kr',
    empNo: 'GFS-2021004',
    used: true,
  },
  {
    id: 2,
    userId: 'admin',
    userName: '관리자',
    status: '정상',
    lastLogin: '2026-10-30 08:15:20',
    permLevel: '00',
    levelName: '00:시스템관리자',
    company: '(주)GFS',
    department: '(주)GFS-경영기획',
    remark: '전사 마스터 최고관리자',
    phone: '02-850-1000',
    email: 'admin@gfs.co.kr',
    empNo: 'GFS-1998001',
    used: true,
  },
  {
    id: 3,
    userId: 'ohyi',
    userName: '어용일',
    status: '정상',
    lastLogin: '2026-10-29 18:30:12',
    permLevel: '01',
    levelName: '01:경영관리자',
    company: '(주)GFS',
    department: '(주)GFS-생산팀',
    remark: '생산총괄 및 시스템 개발의뢰 담당',
    phone: '010-2345-6789',
    email: 'yioh@gfs.co.kr',
    empNo: 'GFS-2008012',
    used: true,
  },
  {
    id: 4,
    userId: 'kimgu',
    userName: '김은구',
    status: '정상',
    lastLogin: '2026-10-30 09:20:44',
    permLevel: '02',
    levelName: '02:현장반장',
    company: '(주)GFS',
    department: '(주)GFS-공장',
    remark: '성형 1공장 라인 반장',
    phone: '010-3456-7890',
    email: 'egkim@gfs.co.kr',
    empNo: 'GFS-2015045',
    used: true,
  },
  {
    id: 5,
    userId: 'parkms',
    userName: '박민수',
    status: '정상',
    lastLogin: '2026-10-29 17:10:05',
    permLevel: '02',
    levelName: '02:현장반장',
    company: '(주)GFS',
    department: '(주)GFS-공장',
    remark: '취반 및 전처리 라인 반장',
    phone: '010-4567-8901',
    email: 'mspark@gfs.co.kr',
    empNo: 'GFS-2017088',
    used: true,
  },
  {
    id: 6,
    userId: 'leesh',
    userName: '이승환',
    status: '정상',
    lastLogin: '2026-10-30 10:05:30',
    permLevel: '03',
    levelName: '03:일반사용자',
    company: '(주)GFS',
    department: '(주)GFS-자재물류',
    remark: '자재 입출고 및 수불 담당',
    phone: '010-5678-9012',
    email: 'shlee@gfs.co.kr',
    empNo: 'GFS-2022033',
    used: true,
  },
  {
    id: 7,
    userId: 'jungdh',
    userName: '정동훈',
    status: '정상',
    lastLogin: '2026-10-30 07:55:10',
    permLevel: '03',
    levelName: '03:일반사용자',
    company: '(주)GFS',
    department: '(주)GFS-영업부',
    remark: 'GS리테일 주문/납품 총괄',
    phone: '010-6789-0123',
    email: 'dhjung@gfs.co.kr',
    empNo: 'GFS-2020015',
    used: true,
  },
  {
    id: 8,
    userId: 'choiwh',
    userName: '최원호',
    status: '휴면',
    lastLogin: '2026-08-14 14:20:00',
    permLevel: '04',
    levelName: '04:조회전용',
    company: '(주)GFS',
    department: '(주)GFS-품질관리',
    remark: 'HACCP 검사 보조원',
    phone: '010-7890-1234',
    email: 'whchoi@gfs.co.kr',
    empNo: 'GFS-2023091',
    used: false,
  },
];

// 2. Base Page Codes for Permissions (ERP Core Controller/View IDs)
export const ERP_PAGE_LIST: { code: string; name: string }[] = [
  { code: 'Uc_BasicCode', name: '기초코드' },
  { code: 'Uc_Counterpart', name: '거래처관리' },
  { code: 'Uc_ProductReg', name: '제품등록' },
  { code: 'Uc_Item_Unit', name: '제품단위' },
  { code: 'Uc_ProductPrice', name: '제품가격' },
  { code: 'Uc_PackSpec', name: '포장구성관리' },
  { code: 'Uc_BOM', name: 'BOM(일반)' },
  { code: 'Uc_BOM2', name: 'BOM(전개)' },
  { code: 'Uc_CvsMgmt', name: '편의점관리' },
  { code: 'Uc_ReprProdReg', name: '대표제품지정등록' },
  { code: 'Uc_ReprProdStatus', name: '대표제품지정현황' },
  { code: 'Uc_OrderGsrUpload', name: '주문등록GSR' },
  { code: 'Uc_ExtraOrderGsr', name: '추가주문등록GSR' },
  { code: 'Uc_InvoiceIssue', name: '거래명세서출력' },
  { code: 'Uc_TagPrint', name: '꼬리표출력' },
  { code: 'Uc_MatRequirement', name: '자재소요량출력' },
  { code: 'Uc_MatPartnerConfirm', name: '자재소요량/거래처확정' },
  { code: 'Uc_PurchaseOrderIssue', name: '발주서출력' },
  { code: 'Uc_ReceivingReg', name: '입고등록(GSR)' },
  { code: 'Uc_WorkOrder', name: '작업지시현황' },
  { code: 'Uc_InputResultReg', name: '투입실적등록(GSR)' },
  { code: 'Uc_ProductionResult', name: '생산실적현황(GSR)' },
  { code: 'Uc_ProductionOrder', name: '생산순서등록(GSR)' },
  { code: 'Uc_DiscardStatus', name: '폐기현황(GSR)' },
  { code: 'Uc_FoodWaste_Search', name: '음식물쓰레기현황' },
  { code: 'Uc_InventoryView', name: '재고조회' },
  { code: 'Uc_MatLedger', name: '자재수불부' },
  { code: 'Uc_DailyStockAmount', name: '일별재고금액' },
  { code: 'Uc_Obsolete_Usage_Search2', name: '불용자재사용현황2' },
  { code: 'Uc_GSR_BizAssessment', name: '경영지표등록' },
  { code: 'Uc_Cost_Search_Item', name: '제품별손익현황' },
  { code: 'Uc_Cost_Monthly', name: '월별손익현황' },
  { code: 'Uc_RecipeCost', name: '완성품레시피원가율' },
  { code: 'Uc_AdminUser', name: '사용자등록' },
  { code: 'Uc_AdminPerm', name: '사용자권한관리' },
  { code: 'Uc_ProgRequest', name: '프로그램수정요청' },
  { code: 'Uc_SysUsage', name: '시스템사용현황' },
];

// Helper to generate default permission items for a user
export function generateDefaultPermissions(level: string): PagePermItem[] {
  return ERP_PAGE_LIST.map((page) => {
    let canRead = true;
    let canWrite = true;

    if (level === '04') {
      canWrite = false; // 조회전용
    } else if (level === '03') {
      // 일반사용자는 어드민 메뉴 쓰기 불가
      if (page.code.startsWith('Uc_Admin') || page.code.startsWith('Uc_Cost')) {
        canWrite = false;
      }
    } else if (level === '02') {
      // 현장반장은 생산/재고 쓰기 가능, 원가/어드민 쓰기 불가
      if (page.code.startsWith('Uc_Admin')) {
        canWrite = false;
        canRead = false;
      }
    }

    return {
      pageCode: page.code,
      pageName: page.name,
      canRead,
      canWrite,
    };
  });
}

// 3. 88 Change Requests (프로그램수정요청/결과)
// 84 완료 (95%), 4 미완료 (5%)
export const INITIAL_CHANGE_REQUESTS: ChangeRequestItem[] = [
  {
    id: 1,
    reqId: 21,
    reqDate: '2025-07-11',
    title: '매입관리-자재출고 등록 신규 개발',
    priority: 10,
    result: '완료',
    execDate: '2025-08-05',
    remark: '유통기한적용 추가검토요',
    hasPhoto: true,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 2,
    reqId: 24,
    reqDate: '2025-07-11',
    title: '생산관리-메뉴 순서 수정',
    priority: 99,
    result: '완료',
    execDate: '2025-07-24',
    remark: '라인 우선순위 정렬 반영',
    hasPhoto: false,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 3,
    reqId: 25,
    reqDate: '2025-07-11',
    title: '생산관리-작업지시 현황 신규 개발',
    priority: 99,
    result: '완료',
    execDate: '2025-08-09',
    remark: '일자/차수별 배치 지시서 출력 연동',
    hasPhoto: true,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 4,
    reqId: 31,
    reqDate: '2025-07-11',
    title: '재고관리-메뉴 수정',
    priority: 99,
    result: '완료',
    execDate: '2025-08-04',
    remark: '불용자재 탭 분리 배치',
    hasPhoto: false,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 5,
    reqId: 32,
    reqDate: '2025-07-11',
    title: '재고관리-재고조회 화면 수정',
    priority: 1,
    result: '완료',
    execDate: '2025-08-01',
    remark: '안전재고 미달 품목 붉은색 강조 처리',
    hasPhoto: true,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 6,
    reqId: 34,
    reqDate: '2025-07-11',
    title: '재고관리-안전재고 관리 신규 개발',
    priority: 99,
    result: '완료',
    execDate: '2025-08-10',
    remark: '일일 적정 재고 알림 엔진 구축',
    hasPhoto: false,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 7,
    reqId: 39,
    reqDate: '2025-07-12',
    title: '매출매입현황-메뉴 수정',
    priority: 99,
    result: '완료',
    execDate: '2025-08-04',
    remark: '가매출/미출/확정금액 현황 화면 개편',
    hasPhoto: false,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 8,
    reqId: 42,
    reqDate: '2025-07-12',
    title: '원가관리-메뉴 추가',
    priority: 99,
    result: '완료',
    execDate: '2025-07-25',
    remark: '간접비등록 및 제품별 손익현황 구축',
    hasPhoto: true,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 9,
    reqId: 49,
    reqDate: '2025-07-19',
    title: '주문등록(GS리테일) 메시지 수정',
    priority: 1,
    result: '완료',
    execDate: '2025-07-19',
    remark: '중복 발주 데이터 업로드 시 경고창 팝업',
    hasPhoto: false,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 10,
    reqId: 50,
    reqDate: '2025-07-19',
    title: '발주소요량 / 거래처확정-메시지 추가',
    priority: 2,
    result: '완료',
    execDate: '2025-07-19',
    remark: '확정 완료 시 발주서 자동 생성 알림',
    hasPhoto: false,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 11,
    reqId: 58,
    reqDate: '2025-07-26',
    title: '자재소요량출력-조회 순서 정렬',
    priority: 3,
    result: '완료',
    execDate: '2025-08-02',
    remark: '단, 정렬순서=계명칭, 구분타입(id), 자재명',
    hasPhoto: true,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 12,
    reqId: 59,
    reqDate: '2025-07-26',
    title: '자재소요량/거래처 확정-조회순서 정렬',
    priority: 4,
    result: '완료',
    execDate: '2025-08-02',
    remark: '단, 발주량0을 아래로 빼는 것은 불가',
    hasPhoto: false,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 13,
    reqId: 63,
    reqDate: '2025-07-26',
    title: '발주서 출력-화면 수정',
    priority: 8,
    result: '완료',
    execDate: '2025-08-06',
    remark: 'GFS네이버계정 2차인증획득요',
    hasPhoto: true,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 14,
    reqId: 67,
    reqDate: '2025-07-26',
    title: '재고실사-화면 수정',
    priority: 12,
    result: '완료',
    execDate: '2025-08-06',
    remark: '유통기한별 재고실사 페이지 추가개발함',
    hasPhoto: true,
    client: '(주)GFS',
    requester: '어용일',
  },
  // 4 Ongoing / Incomplete Tasks to make 4 Incomplete (5%)
  {
    id: 15,
    reqId: 85,
    reqDate: '2026-10-20',
    title: '기준정보-BOM(전개) 다단계 엑셀 일괄 내보내기 고도화',
    priority: 5,
    result: '진행중',
    execDate: '2026-11-05',
    remark: '트리 레벨 7단계 서식 포맷팅 작업 중',
    hasPhoto: true,
    client: '(주)GFS',
    requester: '전정우',
  },
  {
    id: 16,
    reqId: 86,
    reqDate: '2026-10-22',
    title: '원가관리-실시간 전기요금 스마트계량기 IoT API 연동',
    priority: 7,
    result: '진행중',
    execDate: '2026-11-10',
    remark: '한전 원격검침 프로토콜 통신 테스트',
    hasPhoto: false,
    client: '(주)GFS',
    requester: '어용일',
  },
  {
    id: 17,
    reqId: 87,
    reqDate: '2026-10-25',
    title: '생산관리-취반솥 온도 모니터링 HACCP 기록지 자동화',
    priority: 2,
    result: '접수대기',
    execDate: '2026-11-15',
    remark: '취반공정 센서 신호 수집 인터페이스',
    hasPhoto: true,
    client: '(주)GFS',
    requester: '김은구',
  },
  {
    id: 18,
    reqId: 88,
    reqDate: '2026-10-28',
    title: '매출관리-GS25 모바일 영수증 EDI 실시간 취소 연동',
    priority: 1,
    result: '보류',
    execDate: '2026-11-20',
    remark: 'GS리테일 본사 차세대 EDI 프로토콜 공지 대기',
    hasPhoto: false,
    client: '(주)GFS',
    requester: '정동훈',
  },
  // Generate remaining completed tasks to total 88 items (84 완료)
  ...Array.from({ length: 70 }, (_, i) => {
    const rId = 90 + i;
    const modules = ['매출관리', '매입관리', '생산관리', '재고관리', '기준정보', '원가관리'];
    const mod = modules[i % modules.length];
    return {
      id: i + 19,
      reqId: rId,
      reqDate: `2025-09-${String((i % 28) + 1).padStart(2, '0')}`,
      title: `${mod}-업무 자동화 및 그리드 인덱싱 #${i + 1}`,
      priority: (i % 20) + 1,
      result: '완료' as const,
      execDate: `2025-10-${String((i % 28) + 1).padStart(2, '0')}`,
      remark: '운영 배포 및 기능 검증 완료',
      hasPhoto: i % 3 === 0,
      client: '(주)GFS',
      requester: i % 2 === 0 ? '어용일' : '전정우',
    };
  }),
];

// 4. 202 System Usage Summary Rows (시스템사용현황)
// Total calls sum: 193
export const INITIAL_SYSTEM_USAGE_SUMMARY: SystemUsageSummaryItem[] = [
  { id: 1, pageCode: 'Uc_BasicCode', pageName: '기초코드', actionName: '조회', callCount: 1 },
  { id: 2, pageCode: 'Uc_BOM', pageName: 'BOM', actionName: '조회', callCount: 2 },
  { id: 3, pageCode: 'Uc_BOM2', pageName: 'BOM2', actionName: '엑셀업로드', callCount: 0 },
  { id: 4, pageCode: 'Uc_BOM2', pageName: 'BOM2', actionName: '저장', callCount: 0 },
  { id: 5, pageCode: 'Uc_Cost_Search_Item', pageName: '제품별손익현황', actionName: '초기화', callCount: 0 },
  { id: 6, pageCode: 'Uc_Counterpart', pageName: '거래처관리', actionName: '조회', callCount: 0 },
  { id: 7, pageCode: 'Uc_FoodWaste_Search', pageName: '음식물쓰레기현황', actionName: '조회', callCount: 0 },
  { id: 8, pageCode: 'Uc_GSR_BizAssessment', pageName: '경영지표등록', actionName: '조회', callCount: 1 },
  { id: 9, pageCode: 'Uc_InventoryView', pageName: '재고조회', actionName: '저장', callCount: 0 },
  { id: 10, pageCode: 'Uc_InvoiceIssue', pageName: '거래명세서출력', actionName: '조회', callCount: 1 },
  { id: 11, pageCode: 'Uc_Item_Unit', pageName: '제품단위', actionName: '저장', callCount: 0 },
  { id: 12, pageCode: 'Uc_Obsolete_Usage_Search2', pageName: '불용자재사용현황2', actionName: '조회', callCount: 0 },
  { id: 13, pageCode: 'Uc_OrderGsrUpload', pageName: '주문등록GSR', actionName: '조회', callCount: 28 },
  { id: 14, pageCode: 'Uc_OrderGsrUpload', pageName: '주문등록GSR', actionName: '저장', callCount: 14 },
  { id: 15, pageCode: 'Uc_WorkOrder', pageName: '작업지시현황', actionName: '조회', callCount: 32 },
  { id: 16, pageCode: 'Uc_WorkOrder', pageName: '작업지시현황', actionName: '저장', callCount: 12 },
  { id: 17, pageCode: 'Uc_ProductionResult', pageName: '생산실적현황', actionName: '조회', callCount: 25 },
  { id: 18, pageCode: 'Uc_ProductionResult', pageName: '생산실적현황', actionName: '저장', callCount: 8 },
  { id: 19, pageCode: 'Uc_ReceivingReg', pageName: '입고등록', actionName: '조회', callCount: 18 },
  { id: 20, pageCode: 'Uc_ReceivingReg', pageName: '입고등록', actionName: '저장', callCount: 10 },
  { id: 21, pageCode: 'Uc_MatLedger', pageName: '자재수불부', actionName: '조회', callCount: 15 },
  { id: 22, pageCode: 'Uc_InventoryView', pageName: '재고조회', actionName: '조회', callCount: 22 },
  { id: 23, pageCode: 'Uc_Cost_Search_Item', pageName: '제품별손익현황', actionName: '조회', callCount: 5 },
  // Additional rows to reach 202 total rows, with callCount 0 so total calls remains exactly 193
  ...Array.from({ length: 179 }, (_, i) => {
    const idx = i + 24;
    const actions = ['조회', '저장', '엑셀다운로드', '초기화', '인쇄', '삭제'];
    const pCode = `Uc_Module_${String(idx).padStart(3, '0')}`;
    return {
      id: idx,
      pageCode: pCode,
      pageName: `업무서브모듈_${idx}`,
      actionName: actions[i % actions.length],
      callCount: 0,
    };
  }),
];

// 5. System Usage Detail Audit Logs
export const INITIAL_SYSTEM_USAGE_LOGS: SystemUsageDetailItem[] = [
  {
    id: 1,
    pageCode: 'Uc_BOM',
    actionName: '조회',
    userName: '전정우',
    timestamp: '2026-10-30 11:35:12',
    ipAddress: '192.168.1.104',
    clientVersion: '2026.5.25.2239',
  },
  {
    id: 2,
    pageCode: 'Uc_BOM',
    actionName: '조회',
    userName: '어용일',
    timestamp: '2026-10-30 09:18:44',
    ipAddress: '192.168.1.112',
    clientVersion: '2026.5.25.2239',
  },
  {
    id: 3,
    pageCode: 'Uc_BasicCode',
    actionName: '조회',
    userName: '전정우',
    timestamp: '2026-10-30 10:45:21',
    ipAddress: '192.168.1.104',
    clientVersion: '2026.5.25.2239',
  },
  {
    id: 4,
    pageCode: 'Uc_GSR_BizAssessment',
    actionName: '조회',
    userName: '관리자',
    timestamp: '2026-10-30 08:30:19',
    ipAddress: '192.168.1.101',
    clientVersion: '2026.5.25.2239',
  },
  {
    id: 5,
    pageCode: 'Uc_InvoiceIssue',
    actionName: '조회',
    userName: '정동훈',
    timestamp: '2026-10-30 07:58:02',
    ipAddress: '192.168.1.125',
    clientVersion: '2026.5.25.2239',
  },
  {
    id: 6,
    pageCode: 'Uc_OrderGsrUpload',
    actionName: '조회',
    userName: '정동훈',
    timestamp: '2026-10-30 08:02:11',
    ipAddress: '192.168.1.125',
    clientVersion: '2026.5.25.2239',
  },
  {
    id: 7,
    pageCode: 'Uc_WorkOrder',
    actionName: '조회',
    userName: '김은구',
    timestamp: '2026-10-30 08:45:33',
    ipAddress: '192.168.1.130',
    clientVersion: '2026.5.25.2239',
  },
  {
    id: 8,
    pageCode: 'Uc_ProductionResult',
    actionName: '조회',
    userName: '박민수',
    timestamp: '2026-10-30 09:12:50',
    ipAddress: '192.168.1.135',
    clientVersion: '2026.5.25.2239',
  },
  {
    id: 9,
    pageCode: 'Uc_ReceivingReg',
    actionName: '조회',
    userName: '이승환',
    timestamp: '2026-10-30 09:30:14',
    ipAddress: '192.168.1.140',
    clientVersion: '2026.5.25.2239',
  },
  {
    id: 10,
    pageCode: 'Uc_InventoryView',
    actionName: '조회',
    userName: '이승환',
    timestamp: '2026-10-30 10:15:00',
    ipAddress: '192.168.1.140',
    clientVersion: '2026.5.25.2239',
  },
];

