import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/inventory/stock?category=원재료&warehouse=상온보관고
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const warehouse = searchParams.get('warehouse');
    const search = searchParams.get('search');

    const where: any = {};
    if (category) where.category = category;
    if (warehouse) where.warehouse = warehouse;
    if (search) {
      where.OR = [
        { productCode: { contains: search } },
        { productName: { contains: search } },
        { lotNo: { contains: search } },
      ];
    }

    const items = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          include: {
            partner: true,
          },
        },
      },
      orderBy: [{ expiryDate: 'asc' }, { productCode: 'asc' }],
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/stock - 재고 정보 직접입력/수정 일괄 저장
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updates: Array<{
      id: number;
      currentQty?: number;
      unitPrice?: number;
      stockAmount?: number;
      warehouse?: string;
      safetyStock?: number;
      productId?: number;
    }> = body.updates || (body.id ? [body] : []);

    if (!updates || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: '저장할 변경 내역이 없습니다.' },
        { status: 400 }
      );
    }

    const results = await prisma.$transaction(
      updates.map((item) => {
        const data: any = {};
        if (item.currentQty !== undefined) data.currentQty = Number(item.currentQty);
        if (item.unitPrice !== undefined) data.unitPrice = Number(item.unitPrice);
        if (item.stockAmount !== undefined) {
          data.stockAmount = Number(item.stockAmount);
        } else if (item.currentQty !== undefined && item.unitPrice !== undefined) {
          data.stockAmount = Number(item.currentQty) * Number(item.unitPrice);
        }
        if (item.warehouse !== undefined) data.warehouse = String(item.warehouse);

        return prisma.inventory.update({
          where: { id: Number(item.id) },
          data,
          include: { product: true },
        });
      })
    );

    // 안전재고(Product.safetyStockQty) 업데이트가 있는 경우 별도 반영
    const safetyUpdates = updates.filter(
      (u) => u.safetyStock !== undefined && (u.productId || u.id)
    );
    if (safetyUpdates.length > 0) {
      await Promise.all(
        safetyUpdates.map(async (u) => {
          let pId = u.productId;
          if (!pId) {
            const inv = await prisma.inventory.findUnique({
              where: { id: Number(u.id) },
              select: { productId: true },
            });
            pId = inv?.productId;
          }
          if (pId) {
            await prisma.product.update({
              where: { id: pId },
              data: { safetyStockQty: Number(u.safetyStock) },
            });
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: `${results.length}건의 재고 정보가 저장되었습니다.`,
      count: results.length,
      data: results,
    });
  } catch (error: any) {
    console.error('Inventory stock update failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || '재고 정보 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}

