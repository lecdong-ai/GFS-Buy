import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/gfs/order-data
// GFS 스마트발주에서 사용할 ERP 기준정보 일괄 제공 (품목/재고/단가)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }
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
