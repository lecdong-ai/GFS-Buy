'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { HelpCircle, RotateCcw, Calendar, Save } from 'lucide-react';

import { EditableTableWrapper } from '@/components/common/EditableTableWrapper';

interface SheetRow {
  id: number;
  supplier: string;
  name: string;
  boxesBase: number; // D 발주량박스(엑셀기준)
  packUnit: number; // E 입수량(엑셀)
  packUnitAudit: number; // P 입수량(정본)
  days: number; // G 발주일수
  dailyUsage: number; // H 일사용량
  incoming: number; // I 입고량
  currentStock: number; // J 금일재고
  bagPrice: number; // Q 봉단가
  warehouse: string;
  vendor: string;
  finalBoxes: number; // O 확정발주량 (편집)
  manual: boolean;
}

const DAY_CHARS = ['월', '화', '수', '목', '금', '토', '일'];

function parseDeliveryDays(header: string): boolean[] {
  const hasAll = /월화수목금토/.test(header);
  if (hasAll) return [true, true, true, true, true, true, false];
  if (!/[월화수목금토일]/.test(header)) return [false, false, false, true, false, false, false];
  return DAY_CHARS.map((d) => header.includes(d));
}

function calcRow(r: SheetRow) {
  const pack = r.packUnit > 0 ? r.packUnit : r.packUnitAudit > 0 ? r.packUnitAudit : 0;
  const totalStock = r.incoming + r.currentStock;
  const required = r.dailyUsage * r.days;
  const diff = totalStock - required;
  const stockDays = r.dailyUsage > 0 ? totalStock / r.dailyUsage : 99;
  const inpack = r.boxesBase * (r.packUnit || 0);
  const shortage = Math.max(0, required - totalStock);
  const suggest = pack > 0 ? Math.ceil(shortage / pack) : 0;
  const finalBoxes = r.manual ? r.finalBoxes : suggest;
  const amount = finalBoxes * pack * r.bagPrice;
  const dailyBox = r.dailyUsage > 0 && pack > 0 ? r.dailyUsage / pack : 0;
  return { pack, totalStock, required, diff, stockDays, inpack, suggest, finalBoxes, amount, dailyBox };
}

function splitWeek(r: SheetRow, finalBoxes: number): number[] {
  const days = parseDeliveryDays(r.supplier || '');
  const idx = days.map((on, i) => (on ? i : -1)).filter((i) => i >= 0);
  const out = [0, 0, 0, 0, 0, 0, 0];
  if (finalBoxes <= 0 || idx.length === 0) return out;
  const base = Math.floor(finalBoxes / idx.length);
  let rem = finalBoxes - base * idx.length;
  idx.forEach((i) => {
    out[i] = base + (rem > 0 ? 1 : 0);
    if (rem > 0) rem -= 1;
  });
  return out;
}

export const MatOrderNormalView: React.FC = () => {
  const [orderDate, setOrderDate] = useState('2026-10-30');
  const [supplierFilter, setSupplierFilter] = useState('전체');
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlyNeeded, setOnlyNeeded] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showWeek, setShowWeek] = useState(true);

  useEffect(() => {
    fetch('/api/gfs/order-sheet')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data?.rows)) {
          const loaded: SheetRow[] = json.data.rows.map((r: any) => {
            const pack = r.packUnit || r.packUnitAudit || 0;
            const total = (r.incoming || 0) + (r.currentStock || 0);
            const req = (r.dailyUsage || 0) * (r.days || 0);
            const suggest = pack > 0 ? Math.ceil(Math.max(0, req - total) / pack) : 0;
            return {
              id: r.id,
              supplier: r.supplier || '',
              name: r.name,
              boxesBase: r.boxesBase || 0,
              packUnit: r.packUnit || 0,
              packUnitAudit: (r as any).packUnitAudit || 0,
              days: r.days || 0,
              dailyUsage: r.dailyUsage || 0,
              incoming: r.incoming || 0,
              currentStock: r.currentStock || 0,
              bagPrice: r.bagPrice || 0,
              warehouse: r.warehouse || '',
              vendor: r.vendor || '',
              finalBoxes: suggest,
              manual: false,
            };
          });
          setRows(loaded);
          setSuppliers(json.data.suppliers || []);
        }
      })
      .catch((err) => console.error('Failed to load order sheet', err))
      .finally(() => setIsLoading(false));
  }, []);

  // 요일 헤더 (발주일 기준 7일)
  const weekLabels = useMemo(() => {
    const base = new Date(orderDate + 'T00:00:00');
    return DAY_CHARS.map((d, i) => {
      const dt = new Date(base);
      dt.setDate(dt.getDate() + i);
      return `${d}(${String(dt.getDate()).padStart(2, '0')})`;
    });
  }, [orderDate]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (supplierFilter !== '전체' && r.supplier !== supplierFilter) return false;
      if (keyword.trim() && !r.name.toLowerCase().includes(keyword.trim().toLowerCase())) return false;
      if (onlyNeeded) {
        const c = calcRow(r);
        if (c.finalBoxes <= 0) return false;
      }
      return true;
    });
  }, [rows, supplierFilter, keyword, onlyNeeded]);

  const totals = useMemo(() => {
    let boxes = 0;
    let amt = 0;
    filtered.forEach((r) => {
      const c = calcRow(r);
      boxes += c.finalBoxes;
      amt += c.amount;
    });
    return { boxes, amt };
  }, [filtered]);

  const handleFinalChange = (id: number, val: string) => {
    const num = Math.max(0, Number(val) || 0);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, finalBoxes: num, manual: true } : r)));
  };

  const handleReset = () => {
    setRows((prev) => prev.map((r) => ({ ...r, manual: false, finalBoxes: calcRow({ ...r, manual: false }).suggest })));
  };

  const handleSaveOrder = async () => {
    const targets = rows
      .map((r) => ({ r, c: calcRow(r) }))
      .filter(({ c }) => c.finalBoxes > 0);
    if (targets.length === 0) {
      alert('확정 발주량(발주량)이 0보다 큰 품목이 없습니다.');
      return;
    }
    setIsSaving(true);
    try {
      const matRes = await fetch('/api/gfs/materialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDate,
          items: targets.map(({ r, c }) => ({
            name: r.name,
            boxes: c.finalBoxes,
            packUnit: c.pack || r.packUnit,
            bagPrice: r.bagPrice,
            supplierHeader: r.supplier,
          })),
        }),
      });
      const matJson = await matRes.json();
      if (!matJson.success) {
        alert('품목 매칭 실패: ' + (matJson.error || '알 수 없는 오류'));
        return;
      }
      const orderItems = (matJson.data?.matched || [])
        .filter((m: any) => m.productCode)
        .map((m: any) => ({
          productCode: m.productCode,
          orderQty: m.orderQty,
          unitPrice: m.boxPrice || 0,
          partnerId: m.partnerId || undefined,
        }));
      if (orderItems.length === 0) {
        alert('ERP 품목과 매칭된 항목이 없습니다.');
        return;
      }
      const res = await fetch('/api/gfs/order-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDate,
          memo: '자재발주(일반) 발주시트 확정',
          items: orderItems,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const orders = (json.data || []).map((o: any) => o.orderNo).join(', ');
        alert(`발주 확정 완료\n${json.message}\n${orders}`);
      } else {
        alert('발주 실패: ' + json.error);
      }
    } catch (err: any) {
      alert('발주 저장 중 오류: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f2f5] select-none text-[12.5px] font-sans">
      {/* 1. 상단 다크 헤더 바 */}
      <div className="h-[32px] bg-[#333333] border-b border-[#222222] px-3 flex items-center justify-between text-white shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[#4caf50] rounded-2xs inline-block" />
          <h1 className="text-[13px] font-bold tracking-tight text-white">자재발주 (일반)</h1>
          <span className="text-[10px] text-gray-300 font-mono">발주시트 미러</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1 bg-[#2e7d32] hover:bg-[#1b5e20] disabled:opacity-50 text-white rounded-xs text-[11px] font-bold transition-colors shadow-2xs cursor-pointer border border-[#1b5e20]"
          >
            <Save size={12} className="stroke-[2.5]" />
            {isSaving ? '저장 중...' : '발주확정/저장'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1 bg-[#607d8b] hover:bg-[#546e7a] text-white rounded-xs text-[11px] font-medium transition-colors shadow-2xs cursor-pointer border border-[#455a64]"
          >
            <RotateCcw size={12} className="stroke-[2.5]" />
            산출초기화
          </button>
          <button
            type="button"
            onClick={() => setShowWeek((v) => !v)}
            className="px-3 py-1 bg-[#607d8b] hover:bg-[#546e7a] text-white rounded-xs text-[11px] font-medium transition-colors shadow-2xs cursor-pointer border border-[#455a64]"
          >
            {showWeek ? '요일숨기기' : '요일보기'}
          </button>
          <button
            type="button"
            onClick={() => alert('발주시트 미러: 거래처명~금액 18열 + 요일 7일. 발주량(확정) 수정 시 금액·요일분할 자동계산. 확정분은 품목 자동생성 후 발주서로 저장됩니다.')}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 text-white cursor-pointer ml-1 text-[11px] font-bold"
          >
            <HelpCircle size={13} />
          </button>
        </div>
      </div>

      {/* 2. 조건 검색 바 */}
      <div className="bg-[#f5f6f8] border-b border-[#cccccc] px-3 py-1 flex items-center justify-between shrink-0 h-[30px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-700 text-[11px]">발주일자</span>
            <div className="flex items-center bg-white border border-gray-300 px-2 py-0.5 rounded-xs shadow-2xs text-[11px]">
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="font-medium text-gray-800 outline-none"
              />
              <Calendar size={12} className="text-gray-500 ml-1" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-700 text-[11px]">거래처</span>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="bg-white border border-gray-300 px-2 py-0.5 text-[11px] font-medium rounded-xs shadow-2xs w-[220px] h-[22px] outline-none focus:border-blue-500"
            >
              <option value="전체">전체 ({suppliers.length})</option>
              {suppliers.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="품명 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="bg-white border border-gray-300 px-2 py-0.5 text-[11px] rounded-xs w-[180px] h-[22px] outline-none focus:border-blue-500"
            />
          </div>

          <label className="flex items-center gap-1 cursor-pointer text-[11px] font-bold text-gray-700">
            <input type="checkbox" checked={onlyNeeded} onChange={(e) => setOnlyNeeded(e.target.checked)} />
            발주대상만
          </label>
        </div>

        <div className="text-[11px] text-gray-700 font-semibold bg-white px-2.5 py-0.5 rounded-xs border border-gray-300 shadow-2xs">
          품목: <span className="font-bold text-blue-700">{filtered.length}</span>
          {' '}발주: <span className="font-bold text-emerald-700">{totals.boxes.toLocaleString()}박스</span>
          {' '}<span className="font-bold text-gray-900">{totals.amt.toLocaleString()}원</span>
        </div>
      </div>

      {/* 3. 발주시트 미러 그리드 */}
      <div className="flex-1 p-0.5 min-h-0 overflow-hidden flex flex-col bg-white">
        <div className="flex-1 min-h-0 overflow-auto border border-[#a4abb6]">
          {isLoading ? (
            <div className="py-20 text-center text-gray-500">발주서 정본을 불러오는 중입니다...</div>
          ) : (
          <EditableTableWrapper><table className="w-full min-w-full border-collapse text-[12.5px] font-sans">
            <thead className="sticky top-0 z-20 bg-[#c5cbf0] text-gray-900 font-semibold border-b border-[#9098aa]">
              <tr className="h-[32px] leading-tight text-center whitespace-nowrap font-bold">
                <th className="border border-[#9098aa] px-1.5 py-0.5 w-[40px]">No</th>
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[160px] text-left">거래처명</th>
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[280px] text-left">품목</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[75px]" title="D 발주량박스(엑셀기준)">발주량박스</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[60px]" title="E 입수량">입수량</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[75px]" title="F 발주량입수 = D×E">발주량입수</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[60px]" title="G 발주일수">발주일수</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[70px]" title="H 일사용량">일사용량</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[70px]" title="I 입고량(입수)">입고량</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[70px]" title="J 금일재고(봉)">금일재고</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[70px]" title="K 총재고량 = I+J">총재고량</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[70px]" title="L 필요값 = H×G">필요값</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[70px]" title="M 차이 = K-L">차이</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[70px]" title="N 재고유지일">재고유지일</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[75px] bg-[#b5bbf5]" title="O 확정발주량(박스)">발주량</th>
                <th className="border border-[#9098aa] px-1 py-0.5 min-w-[60px]" title="P 입수량(정본)">입수량</th>
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[80px] text-right" title="Q 봉단가">봉단가</th>
                <th className="border border-[#9098aa] px-2 py-0.5 min-w-[100px] text-right" title="R 금액 = O×P×Q">금액</th>
                {showWeek && weekLabels.map((d) => (
                  <th key={d} className="border border-[#9098aa] px-1 py-0.5 min-w-[55px]">{d}</th>
                ))}
                {showWeek && (
                  <th className="border border-[#9098aa] px-1 py-0.5 min-w-[70px]" title="AA 일사용량(박스)">일(박스)</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => {
                const c = calcRow(row);
                const week = splitWeek(row, c.finalBoxes);
                const neg = c.diff < 0;
                return (
                <tr key={row.id} className="h-[21px] border-b border-gray-300 hover:bg-[#eef3fb] bg-white text-gray-900">
                  <td className="border border-gray-300 text-center text-gray-500 font-mono text-[11px] bg-gray-50">{idx + 1}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-left text-gray-800" title={row.supplier}>{row.supplier}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-left font-medium" title={`${row.name}${row.vendor ? ` / ${row.vendor}` : ''}${row.warehouse ? ` [${row.warehouse}]` : ''}`}>{row.name}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono text-gray-600">{row.boxesBase || '-'}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono text-gray-600">{row.packUnit || '-'}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono text-gray-700">{c.inpack ? c.inpack.toLocaleString() : '-'}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono">{row.days || '-'}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono">{row.dailyUsage || '-'}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono">{row.incoming || '-'}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono">{row.currentStock.toLocaleString()}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono font-medium">{c.totalStock.toLocaleString()}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono text-gray-700">{c.required ? Math.round(c.required * 10) / 10 : '-'}</td>
                  <td className={`border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono font-bold ${neg ? 'text-red-600' : 'text-blue-700'}`}>
                    {Number.isFinite(c.diff) ? (c.diff > 0 ? `+${Math.round(c.diff)}` : Math.round(c.diff)) : '-'}
                  </td>
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono text-gray-600">
                    {Number.isFinite(c.stockDays) && c.stockDays !== 99 ? (Math.round(c.stockDays * 10) / 10) : '-'}
                  </td>
                  <td className="border border-gray-300 p-0 text-right font-mono bg-amber-50/40">
                    <input
                      type="number"
                      value={row.manual ? row.finalBoxes : c.suggest}
                      onChange={(e) => handleFinalChange(row.id, e.target.value)}
                      className="w-full h-full text-right font-bold text-gray-900 border-none outline-none focus:ring-1 focus:ring-blue-500 bg-transparent px-1.5"
                    />
                  </td>
                  <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono text-gray-600">{c.pack || '-'}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono text-gray-800">{row.bagPrice ? row.bagPrice.toLocaleString() : '-'}</td>
                  <td className="border border-gray-300 whitespace-nowrap px-2 py-0.5 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30">
                    {c.amount ? Math.round(c.amount).toLocaleString() : '-'}
                  </td>
                  {showWeek && week.map((v, i) => (
                    <td key={i} className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono text-gray-600">{v || ''}</td>
                  ))}
                  {showWeek && (
                    <td className="border border-gray-300 whitespace-nowrap px-1 py-0.5 text-right font-mono text-gray-500">
                      {c.dailyBox ? (Math.round(c.dailyBox * 100) / 100) : ''}
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>

            <tfoot className="sticky bottom-0 z-20 bg-[#ffffcc] border-t-2 border-[#9098aa] font-bold text-gray-900 shadow-inner">
              <tr className="h-[25px]">
                <td colSpan={14} className="border border-[#9098aa] px-2 py-1 text-center">합계</td>
                <td className="border border-[#9098aa] px-1 py-1 text-right font-mono text-blue-900">{totals.boxes.toLocaleString()}</td>
                <td className="border border-[#9098aa] px-1 py-1"></td>
                <td className="border border-[#9098aa] px-2 py-1"></td>
                <td className="border border-[#9098aa] px-2 py-1 text-right font-mono">{totals.amt ? Math.round(totals.amt).toLocaleString() : ''}</td>
                {showWeek && weekLabels.map((d) => (
                  <td key={d} className="border border-[#9098aa] px-1 py-1"></td>
                ))}
                {showWeek && <td className="border border-[#9098aa] px-1 py-1"></td>}
              </tr>
            </tfoot>
          </table></EditableTableWrapper>
          )}
        </div>
      </div>
    </div>
  );
};
