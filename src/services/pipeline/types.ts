export interface OrderIntakeItem {
  orderId: string;
  storeCode: string;
  storeName: string;
  orderItemCode: string; // 바코드 또는 주문코드 (예: 28607290144)
  orderItemName: string;
  orderQty1: number; // 1편 주문량
  orderQty2: number; // 2편 주문량
  totalOrderQty: number; // 1편 + 2편
  deliveryPrice: number; // 개당 납품단가
}

export interface RepresentativeMapping {
  orderItemCode: string; // 주문용/시즌용 코드
  reprItemCode: string; // 기준 대표 품번
  reprItemName: string;
  spec: string;
  unit: string;
  category: string;
}

export interface BomRecipeComponent {
  componentCode: string;
  componentName: string;
  level: 1 | 2 | 3; // 1=완제품, 2=반제품, 3=원부자재
  gyeId: string; // 46개 계 마스터 ID (예: GFS152, GFS552, GFS004 등)
  gyeName: string; // 계명칭 (예: 취반(미반류), 조리실(볶음), 성형장(도시락))
  lineName: string;
  unitQty: number; // 단위투입량 (g, kg, ea, 매 등)
  unit: string;
  yieldRate: number; // 레시피 수율 (80% ~ 100%)
  unitCost: number; // 구매단가 또는 반제품 원가
  warehouse: string; // 보관창고 (상온보관고, 육류냉장고, 부재료보관 등)
  nextProcess: string; // 다음 공정 (예: 냉각실, 성형장, 포장검품)
  subComponents?: BomRecipeComponent[]; // 재귀 하위 원부자재
}

export interface WorkOrderDispatchItem {
  id: number;
  gyeId: string;
  gyeName: string;
  lineName: string;
  workSeq: number;
  partName: string;
  partSpec: string;
  unit: string;
  nextProcess: string;
  totalOrderQty: number; // 1편 + 2편 총합
  orderQty1: number; // 1편 지시수량
  orderQty2: number; // 2편 지시수량
  prodQty: number; // 실생산량
  completeStatus: '대기' | '진행중' | '완료';
  completeTime: string;
}

export interface MaterialLedgerDepletionItem {
  id: number;
  ledgerDate: string;
  category: '원재료' | '부재료' | '포장재';
  partCode: string;
  partName: string;
  partSpec: string;
  unit: string;
  warehouse: string;
  carriedOverQty: number; // 이월재고량
  inQty: number; // 입고량
  outQty: number; // 출고량 (BOM 자동 차감치)
  currentStock: number; // 현재고 = 이월 + 입고 - 출고
  safetyStock: number; // 안전재고
  fefoLotNo: string; // 선입선출 LOT 번호
  expiryDate: string; // 유통기한
}

export interface CostAnalysisResultItem {
  id: number;
  productId: string;
  productName: string;
  salesAmount: number; // 매출액 = 판매수량 * 개당판매단가
  salesRatio: number; // 매출비중 (%)
  indirectCostAllocated: number; // 배분된 간접비
  logisticsRatio: number; // 물류비율 (%) (기본 12.5%)
  logisticsCost: number; // 제품물류비
  directMaterialUnit: number; // 단기총투입재료비 (단위당 재료비)
  productionQty: number; // 생산수량
  directMaterialCost: number; // 직접재료비 = 단기총투입 * 생산수량
  totalCost: number; // 원가합계 = 간접비 + 물류비 + 직접재료비
  salesProfit: number; // 매출손익 = 매출액 - 원가합계
  profitRate: number; // 이익율 (%)
  costRatio: number; // 원가비중 (%)
  salesQty: number; // 판매수량
  unitPrice: number; // 개당판매단가
  unitCost: number; // 단위원가 = 원가합계 / 판매수량
  unitProfit: number; // 개당손익 = 개당판매단가 - 단위원가
  isAbnormalPrice: boolean; // 단가 누락 (0, -9, -99)
  isLossItem: boolean; // 역마진 품목 (차이 < 0)
  alertMessage?: string;
}

export interface PipelineExecutionSummary {
  executionDate: string;
  executionTime: string;
  totalOrdersCount: number; // 수주 건수
  totalOrdersQty: number; // 총 수주 수량
  dispatchedWorkOrdersCount: number; // 발행된 작업지시 건수
  depletedMaterialsCount: number; // 차감된 자재 종류 수
  totalSalesAmount: number; // 총 매출액
  totalDirectMaterialCost: number; // 총 직접재료비
  totalLogisticsCost: number; // 총 제품물류비
  totalIndirectCost: number; // 총 간접비 배분액
  totalCostAmount: number; // 총 원가합계
  netProfitAmount: number; // 순 손익
  overallProfitRate: number; // 전체 이익율 (%)
  abnormalItemsCount: number; // 이상 징후 품목수 (누락/역마진)
  logs: { timestamp: string; step: string; message: string; type: 'info' | 'success' | 'warn' | 'error' }[];
}

