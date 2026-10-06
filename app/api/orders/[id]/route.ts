import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/queryEngine';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    return NextResponse.json(
      { error: `Order with identifier "${id}" not found`, code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: order });
}
