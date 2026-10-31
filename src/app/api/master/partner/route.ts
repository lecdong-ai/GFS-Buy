import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/master/partner?type=P&search=CJ
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: any = { isUsed: true };
    if (type) where.partnerType = type;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { id: { contains: search } },
        { contactPerson: { contains: search } },
      ];
    }

    const partners = await prisma.partner.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ success: true, data: partners });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// POST /api/master/partner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, partnerType, bizNo, ceoName, contactPerson, tel, email, orderDay, leadTime, remark } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'id and name are required' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.upsert({
      where: { id },
      update: {
        name,
        partnerType: partnerType ?? 'P',
        bizNo: bizNo ?? '',
        ceoName: ceoName ?? '',
        contactPerson: contactPerson ?? '',
        tel: tel ?? '',
        email: email ?? '',
        orderDay: orderDay ?? '',
        leadTime: leadTime ? Number(leadTime) : 1,
        remark: remark ?? '',
      },
      create: {
        id,
        name,
        partnerType: partnerType ?? 'P',
        bizNo: bizNo ?? '',
        ceoName: ceoName ?? '',
        contactPerson: contactPerson ?? '',
        tel: tel ?? '',
        email: email ?? '',
        orderDay: orderDay ?? '',
        leadTime: leadTime ? Number(leadTime) : 1,
        remark: remark ?? '',
      },
    });

    return NextResponse.json({ success: true, data: partner });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save partner' },
      { status: 500 }
    );
  }
}

