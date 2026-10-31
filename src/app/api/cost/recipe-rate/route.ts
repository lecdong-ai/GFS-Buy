import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const calcMonth = searchParams.get('calcMonth') || '2026-10';

    const list = await prisma.recipeCostRate.findMany({
      where: { calcMonth },
      include: { product: true },
      orderBy: { costRate: 'desc' },
    });
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows } = body;

    if (Array.isArray(rows)) {
      const results = [];
      for (const r of rows) {
        if (!r.productId) continue;
        const upserted = await prisma.recipeCostRate.upsert({
          where: {
            calcMonth_productId: {
              calcMonth: r.calcMonth || '2026-10',
              productId: Number(r.productId),
            },
          },
          update: {
            recipeCost: Number(r.recipeCost) || 0,
            deliveryPrice: Number(r.deliveryPrice) || 0,
            diff: Number(r.diff) || 0,
            costRate: Number(r.costRate) || 0,
            remark: r.remark || '',
          },
          create: {
            calcMonth: r.calcMonth || '2026-10',
            productId: Number(r.productId),
            productCode: r.productCode || '',
            productName: r.productName || '',
            category: r.category || '완성품',
            kind: r.kind || '',
            spec: r.spec || '',
            unit: r.unit || 'ea',
            packType: r.packType || '',
            gyeName: r.gyeName || '',
            recipeCost: Number(r.recipeCost) || 0,
            deliveryPrice: Number(r.deliveryPrice) || 0,
            diff: Number(r.diff) || 0,
            costRate: Number(r.costRate) || 0,
            remark: r.remark || '',
          },
        });
        results.push(upserted);
      }
      return NextResponse.json({ success: true, data: results });
    }

    return NextResponse.json({ success: false, error: 'Rows array required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
