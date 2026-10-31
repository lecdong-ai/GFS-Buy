export interface CodeClassItem {
  id: string; // 코드클래스
  name: string; // 코드클래스명
  order: number; // 순서
  remark: string; // 비고
  used: boolean;
}

export interface DetailCodeItem {
  id: number;
  classId: string;
  code: string;
  name: string;
  order: number;
  val1: string;
  val2: string;
  val3: string;
  val4: string;
  val5: string;
  remark: string;
  used: boolean;
}

// 56 Master Code Classes
export const MASTER_CODE_CLASSES: CodeClassItem[] = [
  { id: 'STR', name: '창고', order: 10, remark: '보관창고 코드', used: true },
  { id: 'AAA', name: '프로그램정보', order: 20, remark: '시스템 환경정보', used: true },
  { id: 'PKG', name: '제품포장단위', order: 30, remark: '포장 규격 단위', used: true },
  { id: 'BTL', name: '기초코드 value E', order: 40, remark: '확장 속성', used: true },
  { id: 'JTP', name: '급여형태', order: 60, remark: '시급/월급/연봉', used: true },
  { id: 'ACC', name: '계좌', order: 100, remark: '출납 금융계좌', used: true },
  { id: 'SET', name: '세팅', order: 130, remark: '기본 설정값', used: true },
  { id: 'WOD', name: '요일', order: 130, remark: '월~일 요일코드', used: true },
  { id: 'PRD', name: '제품종류', order: 140, remark: '완제품/반제품/원재료', used: true },
  { id: 'FNT', name: '글꼴', order: 150, remark: '라벨 인쇄 폰트', used: true },
  { id: 'UNT', name: '제품단위', order: 160, remark: 'ea, box, kg, g', used: true },
  { id: 'PAY', name: '급여항목', order: 170, remark: '기본급, 수당 등', used: true },
  { id: 'CPT', name: '거래처타입', order: 170, remark: '매출처/매입처/당사', used: true },
  { id: 'RGN', name: '국내/국외', order: 180, remark: '국내/수입 구분', used: true },
  { id: 'DDC', name: '세금과 공공보험', order: 180, remark: '4대보험 및 원천세', used: true },
  { id: 'SRT', name: '제품분류', order: 190, remark: '김밥, 도시락, 샌드위치', used: true },
  { id: 'ATR', name: '사용자권한', order: 200, remark: '관리자/일반/생산', used: true },
  { id: 'PFX', name: '접두어와 일련번호', order: 210, remark: '발주번호 pc 등', used: true },
  { id: 'LAN', name: '언어', order: 220, remark: 'KO, EN', used: true },
  { id: 'ERA', name: '기간설정옵션', order: 220, remark: '일/주/월/분기', used: true },
  { id: 'PRT', name: '프린트아이템', order: 230, remark: '꼬리표 및 지시서', used: true },
  { id: 'STA', name: '입출고상태', order: 230, remark: '입고대기/완료/반품', used: true },
  { id: 'ARR', name: '인쇄정렬', order: 240, remark: '가로/세로', used: true },
  { id: 'FNB', name: 'Font Bold', order: 250, remark: '굵게 여부', used: true },
  { id: 'PST', name: '직급', order: 260, remark: '사원~이사', used: true },
  { id: 'ARG', name: '프린트텍스트정렬', order: 260, remark: '좌/우/중앙', used: true },
  { id: 'SMD', name: '쇼핑몰', order: 270, remark: '온라인 판매채널', used: true },
  { id: 'UNI', name: '제품단위(공통)', order: 280, remark: '공통 환산 규격', used: true },
  { id: 'RMT', name: '주문등록방법', order: 290, remark: 'EDI/엑셀/수기', used: true },
  { id: 'ORG', name: '조직레벨', order: 300, remark: '본부/팀/파트', used: true },
  { id: 'ORH', name: '조직구성', order: 310, remark: '부서 배치', used: true },
  { id: 'TSK', name: '업무분장', order: 320, remark: '생산, 물류, 영업', used: true },
  { id: 'CYL', name: '주기', order: 330, remark: '매일, 격일, 주간', used: true },
  { id: 'STS', name: '업무진행상태', order: 340, remark: '대기/진행/완료', used: true },
  { id: 'PRC', name: '공정관리', order: 350, remark: '계량, 취반, 성형, 포장', used: true },
  { id: 'WST', name: '입출고상태', order: 360, remark: '미입고/부분/완료', used: true },
  { id: 'GFS', name: '계명칭', order: 370, remark: '46개 작업장 계', used: true },
  { id: 'ODT', name: '주문구분', order: 380, remark: '정규/추가/긴급', used: true },
  { id: 'EMS', name: '이메일서버', order: 380, remark: 'SMTP 설정', used: true },
  { id: 'CD0', name: '거래처관리추가항목', order: 390, remark: '부가 거래조건', used: true },
  { id: 'PYE', name: '폐기사유', order: 400, remark: '유통기한/파손/변질', used: true },
  { id: 'UTP', name: '제품상태', order: 410, remark: '정상/단종/불용', used: true },
  { id: 'TXC', name: '과세구분', order: 430, remark: '과세/면세/영세', used: true },
  { id: 'OBP', name: '불용자재 사용목적', order: 440, remark: '연구용/대체투입/실습', used: true },
  { id: 'IOM', name: '발주오더타입', order: 450, remark: '정기/수시/시뮬레이션', used: true },
  { id: 'RMR', name: '자재불출사유', order: 460, remark: '정규/추가불출/시험', used: true },
  { id: 'DST', name: '권역', order: 470, remark: '수도권/충청/영남/호남', used: true },
  { id: 'CST', name: '원가항목', order: 480, remark: '재료비/노무비/경비', used: true },
  { id: 'BAI', name: '경영지표관리항목', order: 490, remark: '매출액/영업이익/가동률', used: true },
  { id: 'RTR', name: '반품사유', order: 500, remark: '오배송/파손/선도불량', used: true },
  { id: 'URR', name: '미납사유', order: 510, remark: '원료결품/설비고장', used: true },
  { id: 'RTY', name: '등록타입', order: 520, remark: '자동/수동', used: true },
  { id: 'BOB', name: '밥유형', order: 530, remark: '백미밥/초밥/비빔밥/잡곡밥', used: true },
  { id: 'QTP', name: '퀴즈타입', order: 540, remark: 'HACCP 시험 유형', used: true },
  { id: 'SCT', name: '단원', order: 550, remark: '위생교육 단원', used: true },
  { id: 'SBJ', name: '과목', order: 560, remark: 'HACCP 교육 과목', used: true },
];

export const SAMPLE_DETAIL_CODES: Record<string, DetailCodeItem[]> = {
  STR: [
    { id: 1, classId: 'STR', code: 'W01', name: '냉장1', order: 1, val1: 'COLD1', val2: '0~5℃', val3: '', val4: '', val5: '', remark: '신선 육류 및 축산', used: true },
    { id: 2, classId: 'STR', code: 'W02', name: '냉장2', order: 2, val1: 'COLD2', val2: '0~8℃', val3: '', val4: '', val5: '', remark: '신선 채소 및 원채', used: true },
    { id: 3, classId: 'STR', code: 'W03', name: '냉동', order: 3, val1: 'FREEZE', val2: '-18℃이하', val3: '', val4: '', val5: '', remark: '냉동 패티 및 가공육', used: true },
    { id: 4, classId: 'STR', code: 'W04', name: '상온', order: 4, val1: 'ROOM', val2: '15~25℃', val3: '', val4: '', val5: '', remark: '건식 자재 및 곡류', used: true },
    { id: 5, classId: 'STR', code: 'W05', name: '부자재', order: 5, val1: 'SUB', val2: '상온', val3: '', val4: '', val5: '', remark: '용기 및 필름 포장재', used: true },
  ],
  CPT: [
    { id: 11, classId: 'CPT', code: 'S', name: '매출처', order: 1, val1: 'SALES', val2: '', val3: '', val4: '', val5: '', remark: '납품 거래처', used: true },
    { id: 12, classId: 'CPT', code: 'P', name: '매입처', order: 2, val1: 'PURCHASE', val2: '', val3: '', val4: '', val5: '', remark: '원부자재 공급사', used: true },
    { id: 13, classId: 'CPT', code: 'O', name: '당사', order: 3, val1: 'OWN', val2: '', val3: '', val4: '', val5: '', remark: '자사 사업장', used: true },
  ],
  TXC: [
    { id: 21, classId: 'TXC', code: 'T1', name: '과세', order: 1, val1: '10%', val2: '', val3: '', val4: '', val5: '', remark: '일반 부가세 적용', used: true },
    { id: 22, classId: 'TXC', code: 'T2', name: '면세', order: 2, val1: '0%', val2: '', val3: '', val4: '', val5: '', remark: '미가공 식료품/농산물', used: true },
    { id: 23, classId: 'TXC', code: 'T3', name: '영세', order: 3, val1: '0%', val2: '', val3: '', val4: '', val5: '', remark: '수출 재화', used: true },
  ],
  SRT: [
    { id: 31, classId: 'SRT', code: 'C01', name: '김밥', order: 1, val1: '', val2: '', val3: '', val4: '', val5: '', remark: '줄김밥', used: true },
    { id: 32, classId: 'SRT', code: 'C02', name: '삼각김밥', order: 2, val1: '', val2: '', val3: '', val4: '', val5: '', remark: '오니기리/더큰삼각', used: true },
    { id: 33, classId: 'SRT', code: 'C03', name: '도시락', order: 3, val1: '', val2: '', val3: '', val4: '', val5: '', remark: '정식 및 덮밥 도시락', used: true },
    { id: 34, classId: 'SRT', code: 'C04', name: '샌드위치', order: 4, val1: '', val2: '', val3: '', val4: '', val5: '', remark: '식빵 및 모닝빵', used: true },
    { id: 35, classId: 'SRT', code: 'C05', name: '조리면', order: 5, val1: '', val2: '', val3: '', val4: '', val5: '', remark: '파스타 및 볶음우동', used: true },
    { id: 36, classId: 'SRT', code: 'C06', name: '햄버거', order: 6, val1: '', val2: '', val3: '', val4: '', val5: '', remark: '번즈 버거류', used: true },
  ],
  BOB: [
    { id: 41, classId: 'BOB', code: 'B01', name: '백미밥', order: 1, val1: '1.0', val2: '', val3: '', val4: '', val5: '', remark: '일반 쌀밥', used: true },
    { id: 42, classId: 'BOB', code: 'B02', name: '초밥미반', order: 2, val1: '1.05', val2: '', val3: '', val4: '', val5: '', remark: '단촛물 배합 밥', used: true },
    { id: 43, classId: 'BOB', code: 'B03', name: '비빔밥(조미)', order: 3, val1: '1.15', val2: '', val3: '', val4: '', val5: '', remark: '전주비빔 소스 배합', used: true },
    { id: 44, classId: 'BOB', code: 'B04', name: '흑미밥', order: 4, val1: '1.0', val2: '', val3: '', val4: '', val5: '', remark: '잡곡 배합', used: true },
  ],
};

