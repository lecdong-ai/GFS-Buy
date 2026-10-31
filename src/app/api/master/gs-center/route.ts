import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const list = await prisma.gsCenter.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await prisma.gsCenter.create({
      data: {
        centerCode: body.centerCode,
        centerName: body.centerName,
        shift: body.shift || '1편',
        status: body.status || '대기',
        abbrevName: body.abbrevName || '',
        isUsed: body.isUsed !== false,
      },
    });
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
