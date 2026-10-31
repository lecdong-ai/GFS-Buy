import { GridColumn } from '@/types/erp';

export interface GridConfig {
  columns: GridColumn[];
  sampleData: Record<string, any>[];
  summaryLabels: Record<string, string | number>;
}

export function getGridConfigForMenu(categoryId: string, menuTitle: string): GridConfig {
  if (categoryId === 'sales' || menuTitle.includes('주문') || menuTitle.includes('납품') || menuTitle.includes('매출')) {
    const columns: GridColumn[] = [
      { key: 'no', label: 'No', width: '45px', align: 'center' },
      { key: 'date', label: '주문/납품일자', width: '100px', align: 'center', format: 'date' },
      { key: 'orderNo', label: '주문/전표번호', width: '120px', align: 'center' },
      { key: 'customer', label: '거래처', width: '130px', align: 'left' },
      { key: 'itemCode', label: '품목코드', width: '90px', align: 'center' },
      { key: 'itemName', label: '품목명(제품)', width: '200px', align: 'left' },
      { key: 'spec', label: '규격', width: '80px', align: 'center' },
      { key: 'unit', label: '단위', width: '50px', align: 'center' },
      { key: 'orderQty', label: '주문수량', width: '80px', align: 'right', format: 'number' },
      { key: 'deliveryQty', label: '납품수량', width: '80px', align: 'right', format: 'number' },
      { key: 'unitPrice', label: '단가(원)', width: '90px', align: 'right', format: 'currency' },
      { key: 'supplyAmount', label: '공급가액(원)', width: '110px', align: 'right', format: 'currency' },
      { key: 'taxAmount', label: '부가세(원)', width: '90px', align: 'right', format: 'currency' },
      { key: 'totalAmount', label: '합계금액(원)', width: '120px', align: 'right', format: 'currency' },
      { key: 'status', label: '진행상태', width: '80px', align: 'center', format: 'badge' },
    ];

    const sampleData = [
      { id: 1, no: 1, date: '2026-10-30', orderNo: 'ORD-261030-001', customer: 'GS리테일(수도권)', itemCode: 'GFS-F001', itemName: '전주비빔 삼각김밥 110g', spec: '110g*30EA', unit: 'BOX', orderQty: 1200, deliveryQty: 1200, unitPrice: 28000, supplyAmount: 33600000, taxAmount: 3360000, totalAmount: 36960000, status: '납품완료' },
      { id: 2, no: 2, date: '2026-10-30', orderNo: 'ORD-261030-002', customer: 'GS리테일(영남권)', itemCode: 'GFS-F002', itemName: '참치마요 삼각김밥 110g', spec: '110g*30EA', unit: 'BOX', orderQty: 1500, deliveryQty: 1500, unitPrice: 29000, supplyAmount: 43500000, taxAmount: 4350000, totalAmount: 47850000, status: '납품완료' },
      { id: 3, no: 3, date: '2026-10-30', orderNo: 'ORD-261030-003', customer: 'GS리테일(호남권)', itemCode: 'GFS-F003', itemName: '치킨마요 덮밥 도시락 420g', spec: '420g*12EA', unit: 'BOX', orderQty: 800, deliveryQty: 800, unitPrice: 42000, supplyAmount: 33600000, taxAmount: 3360000, totalAmount: 36960000, status: '배송중' },
      { id: 4, no: 4, date: '2026-10-30', orderNo: 'ORD-261030-004', customer: 'GS리테일(충청권)', itemCode: 'GFS-F004', itemName: '혜자로운 한식 반상 480g', spec: '480g*10EA', unit: 'BOX', orderQty: 950, deliveryQty: 950, unitPrice: 46000, supplyAmount: 43700000, taxAmount: 4370000, totalAmount: 48070000, status: '배송중' },
      { id: 5, no: 5, date: '2026-10-30', orderNo: 'ORD-261030-005', customer: 'GS리테일(수도권)', itemCode: 'GFS-F005', itemName: '케이준 치킨 샐러드 210g', spec: '210g*15EA', unit: 'BOX', orderQty: 600, deliveryQty: 600, unitPrice: 38000, supplyAmount: 22800000, taxAmount: 2280000, totalAmount: 25080000, status: '출하지시' },
      { id: 6, no: 6, date: '2026-10-30', orderNo: 'ORD-261030-006', customer: 'GS25 프레시원 직납', itemCode: 'GFS-F006', itemName: '햄에그 샌드위치 180g', spec: '180g*20EA', unit: 'BOX', orderQty: 1100, deliveryQty: 1100, unitPrice: 32000, supplyAmount: 35200000, taxAmount: 3520000, totalAmount: 38720000, status: '출하지시' },
      { id: 7, no: 7, date: '2026-10-30', orderNo: 'ORD-261030-007', customer: 'GS더프레시 슈퍼마켓', itemCode: 'GFS-F007', itemName: '불고기 버거 195g', spec: '195g*16EA', unit: 'BOX', orderQty: 550, deliveryQty: 520, unitPrice: 34000, supplyAmount: 17680000, taxAmount: 1768000, totalAmount: 19448000, status: '부분출고' },
      { id: 8, no: 8, date: '2026-10-30', orderNo: 'ORD-261030-008', customer: 'GS리테일(수도권)', itemCode: 'GFS-F008', itemName: '베이컨 에그 토스트 170g', spec: '170g*20EA', unit: 'BOX', orderQty: 700, deliveryQty: 700, unitPrice: 31000, supplyAmount: 21700000, taxAmount: 2170000, totalAmount: 23870000, status: '주문접수' },
      { id: 9, no: 9, date: '2026-10-30', orderNo: 'ORD-261030-009', customer: 'GS25 강원권 물류센터', itemCode: 'GFS-F009', itemName: '스팸 김치 볶음밥 350g', spec: '350g*15EA', unit: 'BOX', orderQty: 450, deliveryQty: 0, unitPrice: 39000, supplyAmount: 17550000, taxAmount: 1755000, totalAmount: 19305000, status: '대기중' },
      { id: 10, no: 10, date: '2026-10-30', orderNo: 'ORD-261030-010', customer: 'GS25 제주 직배송센터', itemCode: 'GFS-F010', itemName: '리코타 치즈 샐러드 220g', spec: '220g*12EA', unit: 'BOX', orderQty: 300, deliveryQty: 0, unitPrice: 41000, supplyAmount: 12300000, taxAmount: 1230000, totalAmount: 13530000, status: '대기중' },
    ];

    return {
      columns,
      sampleData,
      summaryLabels: {
        orderQty: 9150,
        deliveryQty: 7570,
        supplyAmount: 281430000,
        taxAmount: 28143000,
        totalAmount: 309573000,
      },
    };
  }

  if (categoryId === 'purchase' || menuTitle.includes('자재') || menuTitle.includes('발주') || menuTitle.includes('입고')) {
    const columns: GridColumn[] = [
      { key: 'no', label: 'No', width: '45px', align: 'center' },
      { key: 'date', label: '발주/입고일자', width: '100px', align: 'center', format: 'date' },
      { key: 'orderNo', label: '발주번호', width: '120px', align: 'center' },
      { key: 'supplier', label: '공급협력사', width: '130px', align: 'left' },
      { key: 'matCode', label: '원부자재코드', width: '90px', align: 'center' },
      { key: 'matName', label: '원부자재명', width: '190px', align: 'left' },
      { key: 'spec', label: '규격', width: '90px', align: 'center' },
      { key: 'unit', label: '단위', width: '50px', align: 'center' },
      { key: 'orderQty', label: '발주량', width: '80px', align: 'right', format: 'number' },
      { key: 'recvQty', label: '입고량', width: '80px', align: 'right', format: 'number' },
      { key: 'unitPrice', label: '단가(원)', width: '90px', align: 'right', format: 'currency' },
      { key: 'supplyAmount', label: '공급가(원)', width: '110px', align: 'right', format: 'currency' },
      { key: 'expiryDate', label: '유통기한', width: '95px', align: 'center', format: 'date' },
      { key: 'status', label: '상태', width: '80px', align: 'center', format: 'badge' },
    ];

    const sampleData = [
      { id: 1, no: 1, date: '2026-10-30', orderNo: 'PO-261030-01', supplier: '농협양곡유통', matCode: 'MAT-R001', matName: '국내산 경기미 20kg', spec: '20kg/포', unit: 'BAG', orderQty: 300, recvQty: 300, unitPrice: 52000, supplyAmount: 15600000, expiryDate: '2027-04-30', status: '입고완료' },
      { id: 2, no: 2, date: '2026-10-30', orderNo: 'PO-261030-02', supplier: '동원F&B 원료영업', matCode: 'MAT-T002', matName: '가공 참치플레이크 1.8kg', spec: '1.8kg*6CAN', unit: 'BOX', orderQty: 180, recvQty: 180, unitPrice: 68000, supplyAmount: 12240000, expiryDate: '2027-10-15', status: '입고완료' },
      { id: 3, no: 3, date: '2026-10-30', orderNo: 'PO-261030-03', supplier: '오뚜기 식품소재', matCode: 'MAT-S003', matName: '골드마요네즈 3.2kg', spec: '3.2kg*4통', unit: 'BOX', orderQty: 120, recvQty: 120, unitPrice: 38000, supplyAmount: 4560000, expiryDate: '2027-02-28', status: '입고완료' },
      { id: 4, no: 4, date: '2026-10-30', orderNo: 'PO-261030-04', supplier: 'CJ제일제당 소재본부', matCode: 'MAT-H004', matName: '슬라이스햄 1kg(냉장)', spec: '1kg*10팩', unit: 'BOX', orderQty: 250, recvQty: 250, unitPrice: 74000, supplyAmount: 18500000, expiryDate: '2026-11-25', status: '입고완료' },
      { id: 5, no: 5, date: '2026-10-30', orderNo: 'PO-261030-05', supplier: '광천김 수협가공', matCode: 'MAT-G005', matName: '삼각김밥용 조미김필름', spec: '1,000매/롤', unit: 'ROLL', orderQty: 200, recvQty: 200, unitPrice: 45000, supplyAmount: 9000000, expiryDate: '2027-06-30', status: '검수완료' },
      { id: 6, no: 6, date: '2026-10-30', orderNo: 'PO-261030-06', supplier: '하림 신선육영업부', matCode: 'MAT-C006', matName: '국내산 닭가슴살 훈제', spec: '2kg*5팩', unit: 'BOX', orderQty: 160, recvQty: 160, unitPrice: 82000, supplyAmount: 13120000, expiryDate: '2026-11-20', status: '검수완료' },
      { id: 7, no: 7, date: '2026-10-30', orderNo: 'PO-261030-07', supplier: '풀무원 채소유통', matCode: 'MAT-V007', matName: '전처리 혼합샐러드 1kg', spec: '1kg*5팩', unit: 'BOX', orderQty: 140, recvQty: 100, unitPrice: 36000, supplyAmount: 3600000, expiryDate: '2026-11-05', status: '부분입고' },
      { id: 8, no: 8, date: '2026-10-30', orderNo: 'PO-261030-08', supplier: '대한제분 베이커리', matCode: 'MAT-B008', matName: '샌드위치용 식빵(15mm)', spec: '30봉/BOX', unit: 'BOX', orderQty: 320, recvQty: 0, unitPrice: 29000, supplyAmount: 9280000, expiryDate: '2026-11-08', status: '발주접수' },
      { id: 9, no: 9, date: '2026-10-30', orderNo: 'PO-261030-09', supplier: '삼양패키징', matCode: 'MAT-P009', matName: '도시락 투명용기(2호)', spec: '600EA/BOX', unit: 'BOX', orderQty: 150, recvQty: 0, unitPrice: 58000, supplyAmount: 8700000, expiryDate: '2028-10-30', status: '발주대기' },
      { id: 10, no: 10, date: '2026-10-30', orderNo: 'PO-261030-10', supplier: '한솔케미칼 포장재', matCode: 'MAT-L010', matName: '식품용 리드필름(인쇄)', spec: '500m/롤', unit: 'ROLL', orderQty: 80, recvQty: 0, unitPrice: 65000, supplyAmount: 5200000, expiryDate: '2028-12-31', status: '발주대기' },
    ];

    return {
      columns,
      sampleData,
      summaryLabels: {
        orderQty: 1900,
        recvQty: 1310,
        supplyAmount: 99800000,
      },
    };
  }

  if (categoryId === 'production' || menuTitle.includes('생산') || menuTitle.includes('작업')) {
    const columns: GridColumn[] = [
      { key: 'no', label: 'No', width: '45px', align: 'center' },
      { key: 'date', label: '지시일자', width: '100px', align: 'center', format: 'date' },
      { key: 'woNo', label: '작업지시번호', width: '120px', align: 'center' },
      { key: 'line', label: '생산라인', width: '90px', align: 'center' },
      { key: 'itemCode', label: '제품코드', width: '90px', align: 'center' },
      { key: 'itemName', label: '생산제품명', width: '200px', align: 'left' },
      { key: 'planQty', label: '계획수량(EA)', width: '100px', align: 'right', format: 'number' },
      { key: 'actualQty', label: '생산실적(EA)', width: '100px', align: 'right', format: 'number' },
      { key: 'achieveRate', label: '달성률(%)', width: '80px', align: 'right' },
      { key: 'defectQty', label: '불량/폐기(EA)', width: '90px', align: 'right', format: 'number' },
      { key: 'worker', label: '라인반장', width: '80px', align: 'center' },
      { key: 'status', label: '작업진행상태', width: '90px', align: 'center', format: 'badge' },
    ];

    const sampleData = [
      { id: 1, no: 1, date: '2026-10-30', woNo: 'WO-261030-L1-01', line: '1라인(삼각김밥)', itemCode: 'GFS-F001', itemName: '전주비빔 삼각김밥 110g', planQty: 36000, actualQty: 36150, achieveRate: '100.4%', defectQty: 42, worker: '김생산', status: '생산완료' },
      { id: 2, no: 2, date: '2026-10-30', woNo: 'WO-261030-L1-02', line: '1라인(삼각김밥)', itemCode: 'GFS-F002', itemName: '참치마요 삼각김밥 110g', planQty: 45000, actualQty: 45080, achieveRate: '100.2%', defectQty: 55, worker: '김생산', status: '생산완료' },
      { id: 3, no: 3, date: '2026-10-30', woNo: 'WO-261030-L2-01', line: '2라인(도시락)', itemCode: 'GFS-F003', itemName: '치킨마요 덮밥 도시락 420g', planQty: 9600, actualQty: 9620, achieveRate: '100.2%', defectQty: 18, worker: '박제조', status: '생산완료' },
      { id: 4, no: 4, date: '2026-10-30', woNo: 'WO-261030-L2-02', line: '2라인(도시락)', itemCode: 'GFS-F004', itemName: '혜자로운 한식 반상 480g', planQty: 9500, actualQty: 9200, achieveRate: '96.8%', defectQty: 25, worker: '박제조', status: '진행중' },
      { id: 5, no: 5, date: '2026-10-30', woNo: 'WO-261030-L3-01', line: '3라인(샐러드)', itemCode: 'GFS-F005', itemName: '케이준 치킨 샐러드 210g', planQty: 9000, actualQty: 8850, achieveRate: '98.3%', defectQty: 12, worker: '이지시', status: '진행중' },
      { id: 6, no: 6, date: '2026-10-30', woNo: 'WO-261030-L4-01', line: '4라인(샌드위치)', itemCode: 'GFS-F006', itemName: '햄에그 샌드위치 180g', planQty: 22000, actualQty: 21500, achieveRate: '97.7%', defectQty: 38, worker: '최반장', status: '진행중' },
      { id: 7, no: 7, date: '2026-10-30', woNo: 'WO-261030-L4-02', line: '4라인(샌드위치)', itemCode: 'GFS-F007', itemName: '불고기 버거 195g', planQty: 8800, actualQty: 4200, achieveRate: '47.7%', defectQty: 10, worker: '최반장', status: '진행중' },
      { id: 8, no: 8, date: '2026-10-30', woNo: 'WO-261030-L3-02', line: '3라인(샐러드)', itemCode: 'GFS-F010', itemName: '리코타 치즈 샐러드 220g', planQty: 3600, actualQty: 0, achieveRate: '0.0%', defectQty: 0, worker: '이지시', status: '지시대기' },
      { id: 9, no: 9, date: '2026-10-30', woNo: 'WO-261030-L1-03', line: '1라인(삼각김밥)', itemCode: 'GFS-F008', itemName: '베이컨 에그 토스트 170g', planQty: 14000, actualQty: 0, achieveRate: '0.0%', defectQty: 0, worker: '김생산', status: '지시대기' },
      { id: 10, no: 10, date: '2026-10-30', woNo: 'WO-261030-L2-03', line: '2라인(도시락)', itemCode: 'GFS-F009', itemName: '스팸 김치 볶음밥 350g', planQty: 6750, actualQty: 0, achieveRate: '0.0%', defectQty: 0, worker: '박제조', status: '지시대기' },
    ];

    return {
      columns,
      sampleData,
      summaryLabels: {
        planQty: 164250,
        actualQty: 134600,
        achieveRate: '81.9%',
        defectQty: 200,
      },
    };
  }

  if (categoryId === 'inventory' || menuTitle.includes('재고') || menuTitle.includes('수불')) {
    const columns: GridColumn[] = [
      { key: 'no', label: 'No', width: '45px', align: 'center' },
      { key: 'whName', label: '창고명', width: '100px', align: 'center' },
      { key: 'loc', label: '로케이션', width: '90px', align: 'center' },
      { key: 'itemCode', label: '품목코드', width: '90px', align: 'center' },
      { key: 'itemName', label: '품목명', width: '200px', align: 'left' },
      { key: 'spec', label: '규격', width: '80px', align: 'center' },
      { key: 'unit', label: '단위', width: '50px', align: 'center' },
      { key: 'initQty', label: '기초재고', width: '80px', align: 'right', format: 'number' },
      { key: 'inQty', label: '당일입고', width: '80px', align: 'right', format: 'number' },
      { key: 'outQty', label: '당일출고', width: '80px', align: 'right', format: 'number' },
      { key: 'currQty', label: '현재고수량', width: '90px', align: 'right', format: 'number' },
      { key: 'safeQty', label: '안전재고', width: '80px', align: 'right', format: 'number' },
      { key: 'stockAmount', label: '재고금액(원)', width: '120px', align: 'right', format: 'currency' },
      { key: 'expiryDate', label: '유통기한', width: '95px', align: 'center', format: 'date' },
      { key: 'status', label: '재고상태', width: '80px', align: 'center', format: 'badge' },
    ];

    const sampleData = [
      { id: 1, no: 1, whName: '제1원자재창고', loc: 'A-01-01', itemCode: 'MAT-R001', itemName: '국내산 경기미 20kg', spec: '20kg/포', unit: 'BAG', initQty: 450, inQty: 300, outQty: 220, currQty: 530, safeQty: 200, stockAmount: 27560000, expiryDate: '2027-04-30', status: '정상' },
      { id: 2, no: 2, whName: '제1원자재창고', loc: 'A-02-03', itemCode: 'MAT-T002', itemName: '가공 참치플레이크 1.8kg', spec: '1.8kg*6CAN', unit: 'BOX', initQty: 210, inQty: 180, outQty: 150, currQty: 240, safeQty: 100, stockAmount: 16320000, expiryDate: '2027-10-15', status: '정상' },
      { id: 3, no: 3, whName: '제2냉장창고', loc: 'C-01-02', itemCode: 'MAT-S003', itemName: '골드마요네즈 3.2kg', spec: '3.2kg*4통', unit: 'BOX', initQty: 130, inQty: 120, outQty: 90, currQty: 160, safeQty: 80, stockAmount: 6080000, expiryDate: '2027-02-28', status: '정상' },
      { id: 4, no: 4, whName: '제2냉장창고', loc: 'C-02-01', itemCode: 'MAT-H004', itemName: '슬라이스햄 1kg(냉장)', spec: '1kg*10팩', unit: 'BOX', initQty: 180, inQty: 250, outQty: 200, currQty: 230, safeQty: 120, stockAmount: 17020000, expiryDate: '2026-11-25', status: '주의(임박)' },
      { id: 5, no: 5, whName: '포장재창고', loc: 'P-01-05', itemCode: 'MAT-G005', itemName: '삼각김밥용 조미김필름', spec: '1,000매/롤', unit: 'ROLL', initQty: 380, inQty: 200, outQty: 280, currQty: 300, safeQty: 150, stockAmount: 13500000, expiryDate: '2027-06-30', status: '정상' },
      { id: 6, no: 6, whName: '제2냉장창고', loc: 'C-03-04', itemCode: 'MAT-C006', itemName: '국내산 닭가슴살 훈제', spec: '2kg*5팩', unit: 'BOX', initQty: 90, inQty: 160, outQty: 110, currQty: 140, safeQty: 80, stockAmount: 11480000, expiryDate: '2026-11-20', status: '정상' },
      { id: 7, no: 7, whName: '제2냉장창고', loc: 'C-04-02', itemCode: 'MAT-V007', itemName: '전처리 혼합샐러드 1kg', spec: '1kg*5팩', unit: 'BOX', initQty: 60, inQty: 100, outQty: 120, currQty: 40, safeQty: 60, stockAmount: 1440000, expiryDate: '2026-11-05', status: '안전미달' },
      { id: 8, no: 8, whName: '완제품물류센터', loc: 'F-01-01', itemCode: 'GFS-F001', itemName: '전주비빔 삼각김밥 110g', spec: '110g*30EA', unit: 'BOX', initQty: 80, inQty: 1200, outQty: 1200, currQty: 80, safeQty: 50, stockAmount: 2240000, expiryDate: '2026-11-02', status: '출하대기' },
      { id: 9, no: 9, whName: '완제품물류센터', loc: 'F-01-02', itemCode: 'GFS-F002', itemName: '참치마요 삼각김밥 110g', spec: '110g*30EA', unit: 'BOX', initQty: 100, inQty: 1500, outQty: 1500, currQty: 100, safeQty: 60, stockAmount: 2900000, expiryDate: '2026-11-02', status: '출하대기' },
      { id: 10, no: 10, whName: '완제품물류센터', loc: 'F-02-01', itemCode: 'GFS-F003', itemName: '치킨마요 덮밥 도시락 420g', spec: '420g*12EA', unit: 'BOX', initQty: 50, inQty: 800, outQty: 800, currQty: 50, safeQty: 40, stockAmount: 2100000, expiryDate: '2026-11-01', status: '출하대기' },
    ];

    return {
      columns,
      sampleData,
      summaryLabels: {
        initQty: 1650,
        inQty: 4610,
        outQty: 4470,
        currQty: 1870,
        stockAmount: 100640000,
      },
    };
  }

  // Default general enterprise columns for Master Data, Management, Cost, Admin, Work, Help
  const columns: GridColumn[] = [
    { key: 'no', label: 'No', width: '45px', align: 'center' },
    { key: 'code', label: '코드/식별자', width: '110px', align: 'center' },
    { key: 'title', label: '관리항목/명칭', width: '220px', align: 'left' },
    { key: 'category', label: '구분/분류', width: '100px', align: 'center' },
    { key: 'author', label: '담당자/등록자', width: '90px', align: 'center' },
    { key: 'regDate', label: '등록/기준일자', width: '100px', align: 'center', format: 'date' },
    { key: 'modDate', label: '최종수정일시', width: '130px', align: 'center' },
    { key: 'value', label: '설정값/금액', width: '120px', align: 'right', format: 'number' },
    { key: 'status', label: '상태/사용여부', width: '90px', align: 'center', format: 'badge' },
    { key: 'note', label: '비고/관리메모', width: '200px', align: 'left' },
  ];

  const sampleData = [
    { id: 1, no: 1, code: 'GFS-STD-01', title: `${menuTitle} 1차 관리기준`, category: '공통기준', author: '전정우', regDate: '2026-10-01', modDate: '2026-10-30 08:35', value: 125000, status: '사용중', note: '2026년도 하반기 기준 적용 완료' },
    { id: 2, no: 2, code: 'GFS-STD-02', title: `${menuTitle} 가공식품 품질점검 규정`, category: '품질관리', author: '김품질', regDate: '2026-10-05', modDate: '2026-10-29 17:10', value: 89000, status: '사용중', note: 'HACCP 7원칙 12절차 연계' },
    { id: 3, no: 3, code: 'GFS-STD-03', title: `${menuTitle} GS25 일배식품 출하가이드`, category: '유통기준', author: '박영업', regDate: '2026-10-08', modDate: '2026-10-28 14:22', value: 340000, status: '사용중', note: '수도권 콜드체인 기준온도 준수' },
    { id: 4, no: 4, code: 'GFS-STD-04', title: `${menuTitle} 원자재 입고 검수표준`, category: '구매관리', author: '이구매', regDate: '2026-10-10', modDate: '2026-10-27 11:45', value: 45000, status: '사용중', note: '농산물 잔류농약 및 신선도 검사' },
    { id: 5, no: 5, code: 'GFS-STD-05', title: `${menuTitle} 포장라인 가동효율표`, category: '생산관리', author: '정생산', regDate: '2026-10-12', modDate: '2026-10-26 16:30', value: 980000, status: '사용중', note: 'OEE 지표 92% 달성 목표' },
    { id: 6, no: 6, code: 'GFS-STD-06', title: `${menuTitle} 일별 원가배부 기준표`, category: '원가회계', author: '최회계', regDate: '2026-10-15', modDate: '2026-10-25 10:15', value: 520000, status: '사용중', note: '간접노무비 및 유틸리티 배부' },
    { id: 7, no: 7, code: 'GFS-STD-07', title: `${menuTitle} GS리테일 EDI 인터페이스`, category: '시스템', author: '강전산', regDate: '2026-10-18', modDate: '2026-10-24 09:20', value: 12000, status: '정상가동', note: '주문 자동수집 주기: 30분' },
    { id: 8, no: 8, code: 'GFS-STD-08', title: `${menuTitle} 긴급 추가발주 승인권한`, category: '보안/권한', author: '전정우', regDate: '2026-10-20', modDate: '2026-10-23 18:05', value: 150000, status: '승인완료', note: '팀장 전결 금액: 5,000만원' },
    { id: 9, no: 9, code: 'GFS-STD-09', title: `${menuTitle} 불용재고 처리지침서`, category: '재고관리', author: '윤물류', regDate: '2026-10-22', modDate: '2026-10-22 13:40', value: 23000, status: '검토중', note: '사료화 및 비료화 위탁업체 계약' },
    { id: 10, no: 10, code: 'GFS-STD-10', title: `${menuTitle} 연간 목표 달성도 모니터링`, category: '경영기획', author: '임기획', regDate: '2026-10-25', modDate: '2026-10-21 15:00', value: 680000, status: '사용중', note: '당월 누적 매출 35.9억원 집계' },
  ];

  return {
    columns,
    sampleData,
    summaryLabels: {
      value: 2984000,
    },
  };
}

