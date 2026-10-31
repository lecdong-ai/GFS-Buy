import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { loadCanonicalFromRepo } from '@/lib/gfs/canonical';

// GET /api/gfs/canonical-map — 정본(재고조사표+발주서) 요약
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }
    const { audit, orderItems, suppliers, auditFile, orderFile } = loadCanonicalFromRepo();
    const orderTargets = orderItems.filter((i) => i.boxes > 0);
    const auditNorms = new Set(audit.map((a) => a.norm));
    const covered = orderTargets.filter((i) => auditNorms.has(i.norm)).length;
    const byWarehouse: Record<string, number> = {};
    audit.forEach((a) => {
      byWarehouse[a.warehouse] = (byWarehouse[a.warehouse] || 0) + 1;
    });
    return NextResponse.json({
      success: true,
      data: {
        auditCount: audit.length,
        byWarehouse,
        orderItemCount: orderItems.length,
        orderTargetCount: orderTargets.length,
        orderTargetCovered: covered,
        supplierCount: suppliers.length,
        auditFile,
        orderFile,
        sampleAudit: audit.slice(0, 5),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'canonical-map 실패' },
      { status: 500 }
    );
  }
}
