import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/gfs/order-data
// GFS 스마트발주에서 사용할 ERP 기준정보 일괄 제공 (품목/재고/단가)
export async function GET() {
  try {
    const [products, inventory, prices] = await Promise.all([
      prisma.product.findMany({
        where: { isUsed: true },
        select: {
          productCode: true,
          name: true,
          spec: true,
          unit: true,
          category: true,
          kind: true,
          warehouse: true,
          safetyStockQty: true,
          orderUnitQty: true,
          minOrderQty: true,
          partnerId: true,
        },
        orderBy: { productCode: 'asc' },
      }),
      prisma.inventory.findMany({
        select: {
          productCode: true,
          productName: true,
          warehouse: true,
          currentQty: true,
          unit: true,
          expiryDate: true,
          lotNo: true,
        },
        orderBy: { productCode: 'asc' },
      }),
      prisma.productPrice.findMany({
        select: {
          product: { select: { productCode: true } },
          purchasePrice: true,
          deliveryPrice: true,
          effectiveDate: true,
        },
        orderBy: { effectiveDate: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        inventory,
        prices: prices.map((p) => ({
          productCode: p.product.productCode,
          purchasePrice: p.purchasePrice,
          deliveryPrice: p.deliveryPrice,
          effectiveDate: p.effectiveDate,
        })),
        exportedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load GFS order data' },
      { status: 500 }
    );
  }
}
