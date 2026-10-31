'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  PackageCheck,
  Factory,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Clock,
  Truck,
} from 'lucide-react';
import {
  SALES_DAILY,
  SALES_YEARLY,
  PURCHASE_DAILY,
  PURCHASE_YEARLY,
  PRODUCTION_DAILY_EMPTY,
  PRODUCTION_YEARLY,
  UNDELIVERED_DAILY,
  UNDELIVERED_YEARLY,
  ChartPoint,
} from './dashboardData';

// Recharts는 클라이언트 환경(브라우저)에서만 로드하도록 ssr: false 설정
const ErpChartPanel = dynamic(
  () => import('./ErpChartPanel').then((mod) => mod.ErpChartPanel),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col border border-gray-400 bg-white shadow-sm h-[265px] animate-pulse">
        <div className="h-[28px] bg-[#e2e8f0] border-b border-gray-300" />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-xs font-medium">
          차트 로딩 중...
        </div>
      </div>
    ),
  }
);

export const Dashboard: React.FC = () => {
  const [salesData, setSalesData] = useState({ monthly: SALES_DAILY, yearly: SALES_YEARLY });
  const [purchaseData, setPurchaseData] = useState({ monthly: PURCHASE_DAILY, yearly: PURCHASE_YEARLY });
  const [productionData, setProductionData] = useState({ monthly: PRODUCTION_DAILY_EMPTY, yearly: PRODUCTION_YEARLY });
  const [undeliveredData, setUndeliveredData] = useState({ monthly: UNDELIVERED_DAILY, yearly: UNDELIVERED_YEARLY });
  const [notification, setNotification] = useState('새 알림이 없습니다.');

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          if (json.data.sales) setSalesData(json.data.sales);
          if (json.data.purchase) setPurchaseData(json.data.purchase);
          if (json.data.production) setProductionData(json.data.production);
          if (json.data.undelivered) setUndeliveredData(json.data.undelivered);
          if (json.data.notifications && json.data.notifications.length > 0) {
            setNotification(json.data.notifications.join('  |  '));
          }
        }
      })
      .catch((err) => console.error('Failed to load dashboard stats:', err));
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-[#f8fafc] overflow-y-auto p-3.5 gap-3">
      {/* 1. 상단 알림 영역: 회색 배너 바 안에 붉은색 굵은 글씨 */}
      <div className="w-full bg-[#f1f3f5] border border-gray-300 px-4 py-2 flex items-center shadow-xs overflow-hidden shrink-0 rounded-xs">
        <span className="text-rose-600 font-bold text-[13px] tracking-tight truncate">
          {notification}
        </span>
      </div>

      {/* 2. 핵심 경영/생산 KPI 요약 카드 (4열) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-300 p-3.5 rounded-md shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[12.5px] font-bold text-slate-500">금일 GS25 총 수주액</div>
            <div className="text-[20px] font-black text-blue-900 mt-0.5 tracking-tight">₩ 105,256,016</div>
            <div className="text-[11.5px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span>▲ 3.8%</span>
              <span className="text-slate-400 font-normal">총 32,067 ea</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-300 p-3.5 rounded-md shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[12.5px] font-bold text-slate-500">납품 출하 달성률</div>
            <div className="text-[20px] font-black text-emerald-700 mt-0.5 tracking-tight">98.4 %</div>
            <div className="text-[11.5px] text-slate-500 font-normal mt-0.5">
              목표 98.0% 초과달성 (저온일배)
            </div>
          </div>
          <div className="w-11 h-11 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-300 p-3.5 rounded-md shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[12.5px] font-bold text-slate-500">46계 공정 가동률</div>
            <div className="text-[20px] font-black text-indigo-900 mt-0.5 tracking-tight">94.2 %</div>
            <div className="text-[11.5px] text-indigo-600 font-semibold mt-0.5">
              1편·2편 정상 가동 (HACCP 적합)
            </div>
          </div>
          <div className="w-11 h-11 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Factory className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-300 p-3.5 rounded-md shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[12.5px] font-bold text-slate-500">안전재고 / FEFO 관제</div>
            <div className="text-[20px] font-black text-amber-700 mt-0.5 tracking-tight">3건 주의</div>
            <div className="text-[11.5px] text-rose-600 font-semibold mt-0.5">
              백미 외 2건 추가발주 권장
            </div>
          </div>
          <div className="w-11 h-11 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. 제조 공장 실시간 라인 현황 바 */}
      <div className="bg-[#1e293b] text-white px-4 py-2 rounded-xs shadow-2xs flex flex-wrap items-center justify-between text-[12px] gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="font-black text-[13px]">제조라인 실시간 텔레메트리:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[12px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-300">1편 삼각라인:</span>
            <span className="font-bold text-white">12,000 / 12,000 ea (완료)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-300">2편 줄김밥라인:</span>
            <span className="font-bold text-white">7,700 / 7,700 ea (완료)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-300">3편 도시락라인:</span>
            <span className="font-bold text-white">5,200 / 5,200 ea (완료)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-gray-300">4편 샌드/버거:</span>
            <span className="font-bold text-white">출하 배차 대기중</span>
          </div>
        </div>
      </div>

      {/* 4. 메인 차트 영역 (2x2 그리드 레이아웃, 총 4개 패널) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 pb-2">
        {/* ① 좌상단: 매출현황 (단위: 백만) */}
        <ErpChartPanel
          title="매출현황 (단위: 백만)"
          monthlyData={salesData.monthly}
          yearlyData={salesData.yearly}
          yDomain={[0, 120]}
          defaultMode="monthly"
        />

        {/* ② 우상단: 매입현황 (단위: 백만) */}
        <ErpChartPanel
          title="매입현황 (단위: 백만)"
          monthlyData={purchaseData.monthly}
          yearlyData={purchaseData.yearly}
          yDomain={[0, 120]}
          defaultMode="monthly"
        />

        {/* ③ 좌하단: 생산현황 (단위: 백만) */}
        <ErpChartPanel
          title="생산현황 (단위: 백만)"
          monthlyData={productionData.monthly}
          yearlyData={productionData.yearly}
          yDomain={[0, 120]}
          defaultMode="monthly"
          showZeroLabels={false}
        />

        {/* ④ 우하단: 미납품금액 (단위: 백만) */}
        <ErpChartPanel
          title="미납품금액 (단위: 백만)"
          monthlyData={undeliveredData.monthly}
          yearlyData={undeliveredData.yearly}
          yDomain={[0, 250]}
          defaultMode="monthly"
        />
      </div>
    </div>
  );
};

