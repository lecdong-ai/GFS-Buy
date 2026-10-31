'use client';

import React from 'react';
import { BarcodeCanvas } from '../BarcodeCanvas';
import { QrCodeCanvas } from '../QrCodeCanvas';
import { ShieldCheck } from 'lucide-react';

export interface LotLabelData {
  lotNo: string;
  productCode: string;
  productName: string;
  spec: string;
  producedAt: string;
  expiryDate: string;
  line: string;
  inspector: string;
  storageTemp: string;
}

const SAMPLE_LOTS: LotLabelData[] = [
  {
    lotNo: 'LOT-261031-A01',
    productCode: '10002015',
    productName: '참치마요삼각김밥',
    spec: '110g',
    producedAt: '2026-10-31 08:30',
    expiryDate: '2026-11-03 08:00',
    line: '1편 (삼각기계A)',
    inspector: '김품질 (QC)',
    storageTemp: '냉장 0~10℃',
  },
  {
    lotNo: 'LOT-261031-A02',
    productCode: '10002018',
    productName: '전주비빔삼각김밥',
    spec: '115g',
    producedAt: '2026-10-31 09:10',
    expiryDate: '2026-11-03 09:00',
    line: '1편 (삼각기계B)',
    inspector: '김품질 (QC)',
    storageTemp: '냉장 0~10℃',
  },
  {
    lotNo: 'LOT-261031-B01',
    productCode: '10001021',
    productName: '참치마요김밥(줄김밥)',
    spec: '230g',
    producedAt: '2026-10-31 09:45',
    expiryDate: '2026-11-02 18:00',
    line: '2편 (줄김밥라인)',
    inspector: '이검수 (QC)',
    storageTemp: '냉장 0~10℃',
  },
  {
    lotNo: 'LOT-261031-C01',
    productCode: '10003010',
    productName: '11가지찬도시락',
    spec: '430g',
    producedAt: '2026-10-31 10:15',
    expiryDate: '2026-11-02 12:00',
    line: '3편 (도시락라인)',
    inspector: '박위생 (QC)',
    storageTemp: '냉장 0~10℃',
  },
];

export const LotLabelPrint: React.FC<{ items?: LotLabelData[] }> = ({ items = SAMPLE_LOTS }) => {
  return (
    <div className="w-full bg-white text-black p-4 select-none">
      <div className="text-center font-bold text-sm mb-3 border-b pb-2 text-slate-800">
        (주)GFS 공정 품질관리 LOT 바코드 라벨 (표준 규격 2열 인쇄)
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const qrPayload = JSON.stringify({
            lot: item.lotNo,
            code: item.productCode,
            name: item.productName,
            exp: item.expiryDate,
          });

          return (
            <div
              key={idx}
              className="border-2 border-black rounded p-2.5 bg-white shadow-xs flex flex-col justify-between h-[210px] break-inside-avoid"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-1">
                <div className="flex items-center gap-1 text-[11px] font-black tracking-tight">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>(주)GFS 품질인증 LOT 라벨</span>
                </div>
                <span className="text-[10px] bg-black text-white px-1.5 py-0.2 font-mono font-bold">
                  {item.storageTemp}
                </span>
              </div>

              {/* Barcode area */}
              <div className="my-1 text-center">
                <BarcodeCanvas
                  value={item.lotNo}
                  format="CODE128"
                  width={1.6}
                  height={36}
                  fontSize={10}
                />
              </div>

              {/* Product Info & QR */}
              <div className="flex items-center justify-between gap-2 border-t border-dashed border-gray-400 pt-1.5">
                <div className="flex-1 text-[11px] leading-tight space-y-0.5">
                  <div className="font-bold text-[12px] truncate">
                    {item.productName} ({item.spec})
                  </div>
                  <div className="text-gray-700">
                    <span className="font-semibold">품번:</span> {item.productCode} |{' '}
                    <span className="font-semibold">라인:</span> {item.line}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-semibold">제조:</span> {item.producedAt}
                  </div>
                  <div className="font-bold text-red-700">
                    <span className="font-semibold">유통기한:</span> {item.expiryDate}
                  </div>
                </div>

                <div className="shrink-0 text-center">
                  <QrCodeCanvas value={qrPayload} size={62} />
                  <div className="text-[9px] text-gray-500 font-mono mt-0.5">검수: {item.inspector}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

