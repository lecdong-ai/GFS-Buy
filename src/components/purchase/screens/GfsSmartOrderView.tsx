'use client';

import React, { useRef, useState } from 'react';
import { SalesActionBar } from '@/components/sales/common/SalesActionBar';

export const GfsSmartOrderView: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState('대기 중');
  const [isLoadingData, setIsLoadingData] = useState(false);

  const handleOpenNewWindow = () => {
    window.open('/gfs/index.html', '_blank', 'width=1600,height=900');
  };

  const handleReload = () => {
    iframeRef.current?.contentWindow?.location.reload();
  };

  // ERP 기준정보(JSON) 다운로드 → GFS에 직접 올릴 수 있는 형태
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
      setStatus(`완료: 품목 ${json.data.products?.length ?? 0}건 / 재고 ${json.data.inventory?.length ?? 0}건 / 단가 ${json.data.prices?.length ?? 0}건`);
    } catch (e: any) {
      alert('다운로드 실패: ' + e.message);
      setStatus('다운로드 실패');
    } finally {
      setIsLoadingData(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e2e8f0] select-none text-[12px]">
      <SalesActionBar
        title="스마트발주(GFS)"
        buttons={[
          { key: 'erp-data', label: isLoadingData ? '조회중...' : 'ERP 기준정보(JSON)', icon: 'search', variant: 'primary', onClick: handleDownloadErpData },
          { key: 'reload', label: '새로고침', icon: 'reset', variant: 'secondary', onClick: handleReload },
          { key: 'popup', label: '새창으로 열기', icon: 'print', variant: 'secondary', onClick: handleOpenNewWindow },
        ]}
        helpContent="발주 전용 GFS 스마트발주 화면을 ERP 안에서 그대로 사용합니다. 엑셀 업로드 방식은 기존과 동일하며, ERP 기준정보(JSON) 버튼으로 품목/재고/단가를 내려받아 대조할 수 있습니다. 발주 확정분은 GFS 엑셀 다운로드 후 매입관리 발주등록에 반영하세요."
      />

      <div className="bg-[#efefef] border-b border-[#c0c0c0] px-3 py-1.5 flex items-center justify-between shadow-inner">
        <span className="font-semibold text-gray-700">
          상태: <span className="text-blue-700">{status}</span>
        </span>
        <span className="text-[11px] text-gray-500">
          iframe: <span className="font-mono">/gfs/index.html</span> (ERP 로그인과 동일 세션)
        </span>
      </div>

      <div className="flex-1 min-h-0 p-2">
        <div className="h-full bg-white border border-[#94a3b8] rounded shadow-xs overflow-hidden">
          <iframe
            ref={iframeRef}
            src="/gfs/index.html"
            title="GFS 스마트발주"
            className="w-full h-full border-0"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      </div>
    </div>
  );
};
