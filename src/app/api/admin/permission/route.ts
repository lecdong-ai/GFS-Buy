import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const where: any = {};
    if (userId) where.userId = Number(userId);

    const list = await prisma.userPermission.findMany({
      where,
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
    const { permissions } = body;

    if (Array.isArray(permissions)) {
      const results = [];
      for (const p of permissions) {
        if (!p.userId || !p.menuId) continue;
        const upserted = await prisma.userPermission.upsert({
          where: {
            userId_menuId: {
              userId: Number(p.userId),
              menuId: p.menuId,
            },
          },
          update: {
            canRead: !!p.canRead,
            canWrite: !!p.canWrite,
            canDelete: !!p.canDelete,
            canExport: !!p.canExport,
          },
          create: {
            userId: Number(p.userId),
            menuId: p.menuId,
            canRead: !!p.canRead,
            canWrite: !!p.canWrite,
            canDelete: !!p.canDelete,
            canExport: !!p.canExport,
          },
        });
        results.push(upserted);
      }
      return NextResponse.json({ success: true, count: results.length, data: results });
    }

    return NextResponse.json({ success: false, error: 'Permissions array required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
