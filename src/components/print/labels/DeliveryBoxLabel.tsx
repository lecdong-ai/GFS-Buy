'use client';

import React from 'react';
import { BarcodeCanvas } from '../BarcodeCanvas';
import { QrCodeCanvas } from '../QrCodeCanvas';
import { Truck, Package } from 'lucide-react';

export interface DeliveryBoxLabelData {
  boxNo: string;
  orderNo: string;
  centerName: string;
  centerCode: string;
  productCode: string;
  productName: string;
  boxQty: number;
  unit: string;
  shippingDate: string;
  deliveryDate: string;
  coldChainTemp: string;
}

const SAMPLE_BOXES: DeliveryBoxLabelData[] = [
  {
    boxNo: 'BOX-261031-KM01',
    orderNo: 'ORD-261031-GSR01',
    centerName: 'GS리테일 김해일배센터',
    centerCode: 'GSR-KMH',
    productCode: '10002015',
    productName: '참치마요삼각김밥 30입',
    boxQty: 30,
    unit: 'ea/Box',
    shippingDate: '2026-10-31 16:00',
    deliveryDate: '2026-11-01 04:00',
    coldChainTemp: '저온냉장 (0~10℃)',
  },
  {
    boxNo: 'BOX-261031-KM02',
    orderNo: 'ORD-261031-GSR01',
    centerName: 'GS리테일 김해일배센터',
    centerCode: 'GSR-KMH',
    productCode: '10002018',
    productName: '전주비빔삼각김밥 30입',
    boxQty: 30,
    unit: 'ea/Box',
    shippingDate: '2026-10-31 16:00',
    deliveryDate: '2026-11-01 04:00',
    coldChainTemp: '저온냉장 (0~10℃)',
  },
  {
    boxNo: 'BOX-261031-YS01',
    orderNo: 'ORD-261031-GSR02',
    centerName: 'GS리테일 양산조리센터',
    centerCode: 'GSR-YSN',
    productCode: '10003010',
    productName: '11가지찬도시락 16입',
    boxQty: 16,
    unit: 'ea/Box',
    shippingDate: '2026-10-31 16:30',
    deliveryDate: '2026-11-01 05:00',
    coldChainTemp: '저온냉장 (0~10℃)',
  },
  {
    boxNo: 'BOX-261031-GJ01',
    orderNo: 'ORD-261031-GSR03',
    centerName: 'GS리테일 신광주물류센터',
    centerCode: 'GSR-GWJ',
    productCode: '10001021',
    productName: '참치마요김밥 24입',
    boxQty: 24,
    unit: 'ea/Box',
    shippingDate: '2026-10-31 17:00',
    deliveryDate: '2026-11-01 06:00',
    coldChainTemp: '저온냉장 (0~10℃)',
  },
];

export const DeliveryBoxLabel: React.FC<{ items?: DeliveryBoxLabelData[] }> = ({
  items = SAMPLE_BOXES,
}) => {
  return (
    <div className="w-full bg-white text-black p-4 select-none">
      <div className="text-center font-bold text-sm mb-3 border-b pb-2 text-slate-800">
        GS리테일 편의점 프레시푸드 납품 박스 물류라벨 (GS1-128 규격)
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const barcodeValue = `(420)${item.centerCode}(01)${item.productCode}`;
          const qrPayload = JSON.stringify({
            box: item.boxNo,
            center: item.centerCode,
            prd: item.productCode,
            qty: item.boxQty,
            ship: item.shippingDate,
          });

          return (
            <div
              key={idx}
              className="border-2 border-black rounded p-3 bg-white shadow-xs flex flex-col justify-between h-[230px] break-inside-avoid"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
                <div className="flex items-center gap-1.5 text-[12px] font-black tracking-tight">
                  <div className="px-1.5 py-0.5 bg-[#0070bb] text-white font-extrabold text-[10px] rounded-xs">
                    GS25
                  </div>
                  <span>납품박스 물류전표</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 border border-amber-400 px-1.5 py-0.2 text-amber-900 rounded-xs">
                  <Truck className="w-3 h-3 text-amber-800" />
                  <span>{item.coldChainTemp}</span>
                </div>
              </div>

              {/* Barcode */}
              <div className="my-1 text-center">
                <BarcodeCanvas
                  value={barcodeValue}
                  format="CODE128"
                  width={1.5}
                  height={38}
                  fontSize={10}
                />
              </div>

              {/* Box Details & QR */}
              <div className="flex items-center justify-between gap-2 border-t border-dashed border-gray-400 pt-1.5">
                <div className="flex-1 text-[11px] leading-tight space-y-0.5">
                  <div className="font-extrabold text-[13px] text-blue-900">
                    {item.centerName}
                  </div>
                  <div className="font-bold text-[12px] text-slate-800 truncate">
                    {item.productName}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-semibold">박스ID:</span> {item.boxNo} |{' '}
                    <span className="font-bold text-emerald-800">
                      수량: {item.boxQty} {item.unit}
                    </span>
                  </div>
                  <div className="text-gray-600 text-[10px]">
                    <span className="font-semibold">출하:</span> {item.shippingDate} →{' '}
                    <span className="font-semibold">입고예정:</span> {item.deliveryDate}
                  </div>
                </div>

                <div className="shrink-0 text-center">
                  <QrCodeCanvas value={qrPayload} size={64} />
                  <div className="text-[9px] text-gray-500 font-mono mt-0.5">모바일 PDA 스캔</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

