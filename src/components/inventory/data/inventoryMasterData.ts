export interface InventoryGyeItem {
  no: number;
  id: string;
  name: string;
}

export const INVENTORY_GYE_LIST: InventoryGyeItem[] = [
  { no: 1, id: 'GFS053', name: '간편식' },
  { no: 2, id: 'GFS046', name: '계량실(계량)' },
  { no: 3, id: 'GFS045', name: '계량실(냉동)' },
  { no: 4, id: 'GFS025', name: '계량실(분말류)' },
  { no: 5, id: 'GFS024', name: '계량실(소스류)' },
  { no: 6, id: 'GFS023', name: '계량실(양념류)' },
  { no: 7, id: 'GFS017', name: '냉동고' },
  { no: 8, id: 'GFS036', name: '로터리쉐프' },
  { no: 9, id: 'GFS554', name: '부자재전실(개봉)' },
  { no: 10, id: 'GFS021', name: '부재료보관고' },
  { no: 11, id: 'GFS015', name: '빵보관실' },
  { no: 12, id: 'GFS014', name: '빵슬라이스실' },
  { no: 13, id: 'GFS022', name: '상온보관고' },
  { no: 14, id: 'GFS102', name: '샐러드(개봉)' },
  { no: 15, id: 'GFS100', name: '샐러드(계량)' },
  { no: 16, id: 'GFS101', name: '샐러드(믹싱)' },
  { no: 17, id: 'GFS103', name: '샐러드(외장소독)' },
  { no: 18, id: 'GFS029', name: '선별실(계량)' },
  { no: 19, id: 'GFS027', name: '선별실(선별)' },
  { no: 20, id: 'GFS028', name: '선별실(커팅)' },
  { no: 21, id: 'GFS005', name: '성형장(김밥)' },
  { no: 22, id: 'GFS006', name: '성형장(김밥성형)' },
  { no: 23, id: 'GFS008', name: '성형장(더큰삼각)' },
  { no: 24, id: 'GFS004', name: '성형장(도시락)' },
  { no: 25, id: 'GFS007', name: '성형장(삼각김밥)' },
  { no: 26, id: 'GFS002', name: '성형장(샌드위치)' },
  { no: 27, id: 'GFS049', name: '성형장(조리면)' },
  { no: 28, id: 'GFS003', name: '성형장(햄버거)' },
  { no: 29, id: 'GFS900', name: '쌀보관고' },
  { no: 30, id: 'GFS019', name: '육류냉장고' },
  { no: 31, id: 'GFS551', name: '조리실(데침/삶기)' },
  { no: 32, id: 'GFS553', name: '조리실(면 믹싱)' },
  { no: 33, id: 'GFS552', name: '조리실(볶음)' },
  { no: 34, id: 'GFS020', name: '채소류냉장고' },
  { no: 35, id: 'GFS032', name: '채소작업실(계량)' },
  { no: 36, id: 'GFS030', name: '채소작업실(세척)' },
  { no: 37, id: 'GFS031', name: '채소작업실(커팅)' },
  { no: 38, id: 'GFS151', name: '취반(계량)' },
  { no: 39, id: 'GFS152', name: '취반(미반류)' },
  { no: 40, id: 'GFS026', name: '취반실(계량)' },
  { no: 41, id: 'GFS011', name: '커팅' },
  { no: 42, id: 'GFS012', name: '커팅개봉' },
  { no: 43, id: 'GFS401', name: '키팅실(탈수)' },
  { no: 44, id: 'GFS502', name: '튀김실(제트오븐)' },
  { no: 45, id: 'GFS503', name: '튀김실(콤비오븐)' },
  { no: 46, id: 'GFS501', name: '튀김실(튀김)' },
];

export interface DailyStockAmountItem {
  no: number;
  date: string;
  stockAmount: number;
  dailyChange: number;
}

export const EXACT_DAILY_STOCK_DATA: DailyStockAmountItem[] = [
  { no: 1, date: '전월이월', stockAmount: 12051551558, dailyChange: 12051551558 },
  { no: 2, date: '2026-10-01', stockAmount: 12072631714, dailyChange: 21080156 },
  { no: 3, date: '2026-10-02', stockAmount: 12167795614, dailyChange: 95163900 },
  { no: 4, date: '2026-10-03', stockAmount: 12228085658, dailyChange: 60290044 },
  { no: 5, date: '2026-10-04', stockAmount: 12228085658, dailyChange: 0 },
  { no: 6, date: '2026-10-05', stockAmount: 12303506458, dailyChange: 75420800 },
  { no: 7, date: '2026-10-06', stockAmount: 12350013692, dailyChange: 46507234 },
  { no: 8, date: '2026-10-07', stockAmount: 12434522540, dailyChange: 84508848 },
  { no: 9, date: '2026-10-08', stockAmount: 12494028336, dailyChange: 59505796 },
  { no: 10, date: '2026-10-09', stockAmount: 12602650579, dailyChange: 108622243 },
  { no: 11, date: '2026-10-10', stockAmount: 12656911150, dailyChange: 54260571 },
  { no: 12, date: '2026-10-11', stockAmount: 12656911150, dailyChange: 0 },
  { no: 13, date: '2026-10-12', stockAmount: 12733094830, dailyChange: 76183680 },
  { no: 14, date: '2026-10-13', stockAmount: 12785592350, dailyChange: 52497520 },
  { no: 15, date: '2026-10-14', stockAmount: 12877359900, dailyChange: 91767550 },
  { no: 16, date: '2026-10-15', stockAmount: 12936622320, dailyChange: 59262420 },
  { no: 17, date: '2026-10-16', stockAmount: 13036641980, dailyChange: 100019660 },
  { no: 18, date: '2026-10-17', stockAmount: 13092294134, dailyChange: 55652154 },
  { no: 19, date: '2026-10-18', stockAmount: 13091997814, dailyChange: -296320 },
  { no: 20, date: '2026-10-19', stockAmount: 13177452104, dailyChange: 85454290 },
  { no: 21, date: '2026-10-20', stockAmount: 13218586628, dailyChange: 41134524 },
  { no: 22, date: '2026-10-21', stockAmount: 13284526188, dailyChange: 65939560 },
  { no: 23, date: '2026-10-22', stockAmount: 13346537375, dailyChange: 62011187 },
  { no: 24, date: '2026-10-23', stockAmount: 13439513163, dailyChange: 92975788 },
  { no: 25, date: '2026-10-24', stockAmount: 13498079545, dailyChange: 58566382 },
  { no: 26, date: '2026-10-25', stockAmount: 13498079545, dailyChange: 0 },
  { no: 27, date: '2026-10-26', stockAmount: 13586579523, dailyChange: 88499978 },
  { no: 28, date: '2026-10-27', stockAmount: 13640450310, dailyChange: 53870787 },
  { no: 29, date: '2026-10-28', stockAmount: 13727650124, dailyChange: 87199814 },
  { no: 30, date: '2026-10-29', stockAmount: 13755214350, dailyChange: 27564226 },
  { no: 31, date: '2026-10-30', stockAmount: 13780348891, dailyChange: 25134541 },
  { no: 32, date: '2026-10-31', stockAmount: 13780348891, dailyChange: 0 },
];

export const VENDOR_OPTIONS = ['ALL', '[네트웍스]광주식품', '사조오양', '평화영농조합', '이우유통', '야미푸드', '한성기업', '두레'];

