import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const list = await prisma.systemLog.findMany({
      take: 100,
      orderBy: { id: 'desc' },
      include: { user: true },
    });
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await prisma.systemLog.create({
      data: {
        logDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userId: body.userId ? Number(body.userId) : null,
        loginId: body.loginId || 'admin',
        userName: body.userName || '시스템관리자',
        action: body.action || '조회',
        menuId: body.menuId || '',
        menuName: body.menuName || '',
        detail: body.detail || '',
        ipAddress: body.ipAddress || '127.0.0.1',
      },
    });
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
