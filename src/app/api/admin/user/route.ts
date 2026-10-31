import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/admin/user
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        loginId: true,
        name: true,
        department: true,
        position: true,
        tel: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        remark: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/user (사용자 등록 및 수정)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loginId, password, name, department, position, tel, email, role, isActive } = body;

    if (!loginId || !name) {
      return NextResponse.json(
        { success: false, error: 'loginId and name are required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      department: department || '',
      position: position || '',
      tel: tel || '',
      email: email || '',
      role: role || '일반',
      isActive: isActive !== false,
    };

    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const hashedPassword = password && password.trim()
      ? await bcrypt.hash(password, 12)
      : await bcrypt.hash('password123!', 12);

    const user = await prisma.user.upsert({
      where: { loginId },
      update: updateData,
      create: {
        loginId,
        password: hashedPassword,
        name,
        department: department || '',
        position: position || '',
        tel: tel || '',
        email: email || '',
        role: role || '일반',
        isActive: isActive !== false,
      },
      select: {
        id: true,
        loginId: true,
        name: true,
        department: true,
        position: true,
        tel: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save user' },
      { status: 500 }
    );
  }
}

