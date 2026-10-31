'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

interface PartnerOpt {
  id: string;
  name: string;
}

export const GfsSmartOrderView: React.FC = () => {
  const { data: session } = useSession();
  const me: any = session?.user;
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState('대기 중');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [barsVisible, setBarsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 발주 저장 폼
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [partners, setPartners] = useState<PartnerOpt[]>([]);
  const [partnerId, setPartnerId] = useState('');
  const [memo, setMemo] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    fetch('/api/master/partner?type=P')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          setPartners(j.data.map((p: any) => ({ id: p.id, name: p.name })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleOpenNewWindow = () => {
    window.open('/gfs/index.html', '_blank', 'width=1600,height=900');
  };

  const handleReload = () => {
    iframeRef.current?.contentWindow?.location.reload();
  };

  const handleToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current?.requestFullscreen();
      }
    } catch {
      alert('전체화면을 지원하지 않는 브라우저입니다. 새창으로 열기를 사용하세요.');
    }
  };

  // ERP 기준정보(JSON) 다운로드
  const handleDownloadErpData = async () => {
    setIsLoadingData(true);
    setStatus('ERP 데이터 조회 중...');
    try {
      const res = await fetch('/api/gfs/order-data');
      const json = await res.json();
      if (!json.success) {
        alert('ERP 데이터 조회 실패: ' + (json.error || '알 수 없는 오류'));
        setStatus('조회 실패');
        return;
      }
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GFS_ERP_기준정보_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`완료: 품목 ${json.data.products?.length ?? 0}건 / 재고 ${json.data.inventory?.length ?? 0}건`);
    } catch (e: any) {
      alert('다운로드 실패: ' + e.message);
      setStatus('다운로드 실패');
    } finally {
      setIsLoadingData(false);
    }
  };

  // GFS iframe에서 산출결과 가져오기 → ERP 매칭+자동생성 → 저장바 자동채움
  const handleFetchGfs = async () => {
    setIsFetching(true);
    setStatus('GFS 결과 읽는 중...');
    try {
      const win = iframeRef.current?.contentWindow as any;
      if (!win) {
        alert('GFS 화면이 아직 로드되지 않았습니다.');
        return;
      }
      let raw: any[] = [];
      try {
        raw = win.eval('Array.isArray(state?.rawItems) ? state.rawItems : []');
      } catch {
        alert('GFS 상태를 읽지 못했습니다. GFS에서 먼저 [발주 데이터 자동 산출]을 실행하세요.');
        return;
      }
      if (!raw || raw.length === 0) {
        alert('GFS에 산출 결과가 없습니다. GFS에서 엑셀 3종을 올리고 산출을 먼저 실행하세요.');
        return;
      }
      const orderables = raw
        .map((m: any) => ({
          name: String(m?.name || '').trim(),
          boxes: Number(m?.calc?.finalBoxes ?? m?.finalBoxes ?? 0),
          packUnit: Number(m?.packUnit ?? 0),
          bagPrice: Number(m?.unitPrice ?? 0),
          supplierHeader: String(m?.supplier?.name || m?.supplier || ''),
        }))
        .filter((x) => x.name && x.boxes > 0);
      if (orderables.length === 0) {
        alert('발주 대상(박스>0)이 없습니다. GFS 필터(발주 대상만 보기)를 확인하세요.');
        setStatus('발주 대상 없음');
        return;
      }
      setStatus(`GFS ${orderables.length}건 매칭 중...`);
      const res = await fetch('/api/gfs/materialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderables, orderDate }),
      });
      const json = await res.json();
      if (!json.success) {
        alert('매칭 실패: ' + (json.error || '알 수 없는 오류'));
        setStatus('매칭 실패');
        return;
      }
      const { matched = [], created = [], failed = [] } = json.data || {};
      const newProducts = created.filter((c: any) => c.type === 'product');
      // 저장바에 productCode 기준으로 자동채움 (order-result 규격)
      const forOrder = matched
        .filter((m: any) => m.productCode)
        .map((m: any) => ({
          productCode: m.productCode,
          orderQty: m.orderQty,
          unitPrice: m.boxPrice || 0,
          partnerId: m.partnerId || undefined,
        }));
      setItemsText(JSON.stringify(forOrder));
      const msg =
        `매칭 ${matched.length}건` +
        (newProducts.length ? ` · 신규생성 ${newProducts.length}건(${newProducts.slice(0, 3).map((c: any) => c.name).join(', ')}${newProducts.length > 3 ? ' 외' : ''})` : '') +
        (failed.length ? ` · 실패 ${failed.length}건` : '');
      setPreview(
        failed.length ? `미처리: ${failed.map((f: any) => f.name).join(', ')}` : ''
      );
      setStatus(`가져오기 완료: ${msg} → 확인 후 발주저장`);
    } catch (e: any) {
      alert('가져오기 실패: ' + e.message);
      setStatus('가져오기 실패');
    } finally {
      setIsFetching(false);
    }
  };

  // 로그인한 담당자 신원으로 발주 저장
  const handleSaveOrder = async () => {
    if (!itemsText.trim()) {
      alert('발주 품목을 JSON으로 입력하세요. 예: [{"productCode":"...","orderQty":10}]');
      return;
    }
    let items: any[];
    try {
      items = JSON.parse(itemsText);
    } catch {
      alert('JSON 형식이 올바르지 않습니다.');
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      alert('발주 품목이 비어 있습니다.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/gfs/order-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderDate, partnerId: partnerId || undefined, memo, items }),
      });
      const json = await res.json();
      if (!json.success) {
        alert('발주 저장 실패: ' + (json.error || '알 수 없는 오류'));
        setStatus('발주 저장 실패');
        return;
      }
      const orders = (json.data || []).map((o: any) => o.orderNo).join(', ');
      alert(`발주 저장 완료 (${me?.name || me?.loginId || '담당자'} 명의)\n${json.message}\n${orders}`);
      setStatus(`발주 완료: ${orders}`);
      setItemsText('');
    } catch (e: any) {
      alert('저장 실패: ' + e.message);
      setStatus('발주 저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full bg-[#e2e8f0] text-[12px] overflow-hidden">
      {/* 슬림 1줄 툴바 */}
      <div className="h-9 shrink-0 bg-[#1e293b] text-white px-3 flex items-center gap-2 text-[12px]">
        <span className="w-1.5 h-4 bg-emerald-500 rounded-2xs inline-block" />
        <span className="font-bold whitespace-nowrap">스마트발주(GFS)</span>
        <span className="text-slate-300 whitespace-nowrap hidden md:inline">
          {me?.name || '-'}({me?.loginId || '-'})
        </span>
        <span className="text-slate-400 whitespace-nowrap hidden lg:inline">· {status}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFetchGfs}
            disabled={isFetching}
            className="h-6 px-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded text-[11px] font-bold"
            title="GFS 산출결과를 읽어 ERP 품목 매칭+자동생성 후 저장바에 채움"
          >
            {isFetching ? '가져오는중' : 'GFS결과 가져오기'}
          </button>
          <button
            type="button"
            onClick={() => setBarsVisible((v) => !v)}
            className="h-6 px-2 bg-slate-700 hover:bg-slate-600 rounded text-[11px] font-bold"
            title={barsVisible ? '입력바 숨기기 (발주창 넓게)' : '입력바 보이기'}
          >
            {barsVisible ? '▲ 바 숨기기' : '▼ 바 보이기'}
          </button>
          <button
            type="button"
            onClick={handleDownloadErpData}
            disabled={isLoadingData}
            className="h-6 px-2 bg-slate-700 hover:bg-slate-600 rounded text-[11px] font-bold disabled:opacity-50"
          >
            {isLoadingData ? '조회중' : 'ERP정보'}
          </button>
          <button
            type="button"
            onClick={handleReload}
            className="h-6 px-2 bg-slate-700 hover:bg-slate-600 rounded text-[11px] font-bold"
          >
            새로고침
          </button>
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="h-6 px-2 bg-blue-600 hover:bg-blue-500 rounded text-[11px] font-bold"
          >
            {isFullscreen ? '전체화면 해제' : '전체화면'}
          </button>
          <button
            type="button"
            onClick={handleOpenNewWindow}
            className="h-6 px-2 bg-emerald-600 hover:bg-emerald-500 rounded text-[11px] font-bold"
          >
            새창
          </button>
        </div>
      </div>

      {/* 발주 저장바 (접기 가능) */}
      {barsVisible && (
        <div className="shrink-0 bg-white border-b border-gray-300 px-2 py-1 flex flex-wrap items-center gap-1.5">
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="h-6 border border-gray-300 px-1.5 text-[12px] rounded-xs bg-white"
            title="발주일자"
          />
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="h-6 border border-gray-300 px-1.5 text-[12px] rounded-xs bg-white max-w-[180px]"
            title="거래처 (미선택 시 기본 거래처)"
          >
            <option value="">거래처 자동</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>{p.id} {p.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모"
            className="h-6 border border-gray-300 px-1.5 text-[12px] rounded-xs w-[120px]"
          />
          <input
            type="text"
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            placeholder='발주품목 JSON: [{"productCode":"...","orderQty":10}]'
            className="h-6 border border-gray-300 px-1.5 text-[12px] rounded-xs flex-1 min-w-[200px] font-mono"
          />
          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={isSaving}
            className="h-6 px-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xs text-[12px] whitespace-nowrap"
          >
            {isSaving ? '저장중' : '발주저장'}
          </button>
        </div>
      )}
      {barsVisible && preview && (
        <div className="shrink-0 bg-amber-50 border-b border-amber-300 px-2 py-0.5 text-[11px] text-amber-800">
          {preview}
        </div>
      )}

      {/* GFS iframe 최대 확보 */}
      <div className="flex-1 min-h-0 bg-white">
        <iframe
          ref={iframeRef}
          src="/gfs/index.html"
          title="GFS 스마트발주"
          className="w-full h-full border-0 block"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};
