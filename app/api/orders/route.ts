import { NextRequest, NextResponse } from 'next/server';
import { executeOrdersQuery } from '@/lib/queryEngine';
import { FilterParams, OrderStatus, OrderPriority, OrderRegion, OrderCategory, SortField, SortOrder } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get('q') || '';
    const status = searchParams.getAll('status') as OrderStatus[];
    const priority = searchParams.getAll('priority') as OrderPriority[];
    const region = searchParams.getAll('region') as OrderRegion[];
    const category = searchParams.getAll('category') as OrderCategory[];
    const minAmount = searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined;
    const maxAmount = searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined;
    const sortBy = (searchParams.get('sortBy') as SortField) || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);

    const simulatedLatency = searchParams.has('simulatedLatency')
      ? parseInt(searchParams.get('simulatedLatency')!, 10)
      : undefined;
    const failRate = searchParams.has('failRate')
      ? parseFloat(searchParams.get('failRate')!)
      : undefined;
    const forceFail = searchParams.get('forceFail') === 'true';

    const filterParams: Partial<FilterParams> = {
      q,
      status: status.length > 0 ? status : undefined,
      priority: priority.length > 0 ? priority : undefined,
      region: region.length > 0 ? region : undefined,
      category: category.length > 0 ? category : undefined,
      minAmount,
      maxAmount,
      sortBy,
      sortOrder,
      page,
      pageSize
    };

    const response = await executeOrdersQuery(filterParams, {
      simulatedLatency,
      failRate,
      forceFail
    });

    return NextResponse.json(response);
  } catch (err: unknown) {
    const errorObj = err as { details?: unknown; message?: string };
    const details = errorObj?.details || {
      error: errorObj?.message || 'Internal Server Error',
      code: 'SERVER_ERROR',
      requestId: `req_err_${Date.now()}`,
      timestamp: Date.now()
    };

    return NextResponse.json(details, { status: 500 });
  }
}
