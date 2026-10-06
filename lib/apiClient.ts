import { ApiResponse, FilterParams, ApiErrorResponse, Order } from './types';

export interface FetchOrdersOptions {
  signal?: AbortSignal;
  simulatedLatency?: number;
  failRate?: number;
  forceFail?: boolean;
}

export async function fetchOrders(
  params: Partial<FilterParams>,
  options: FetchOrdersOptions = {}
): Promise<ApiResponse<Order>> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.status && params.status.length > 0) {
    params.status.forEach((s) => searchParams.append('status', s));
  }
  if (params.priority && params.priority.length > 0) {
    params.priority.forEach((p) => searchParams.append('priority', p));
  }
  if (params.region && params.region.length > 0) {
    params.region.forEach((r) => searchParams.append('region', r));
  }
  if (params.category && params.category.length > 0) {
    params.category.forEach((c) => searchParams.append('category', c));
  }
  if (typeof params.minAmount === 'number') searchParams.set('minAmount', params.minAmount.toString());
  if (typeof params.maxAmount === 'number') searchParams.set('maxAmount', params.maxAmount.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());

  if (typeof options.simulatedLatency === 'number') {
    searchParams.set('simulatedLatency', options.simulatedLatency.toString());
  }
  if (typeof options.failRate === 'number') {
    searchParams.set('failRate', options.failRate.toString());
  }
  if (options.forceFail) {
    searchParams.set('forceFail', 'true');
  }

  const url = `/api/orders?${searchParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal: options.signal,
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        error: `Server responded with HTTP ${response.status} (${response.statusText})`,
        code: `HTTP_${response.status}`,
        requestId: 'unknown',
        timestamp: Date.now(),
      };
    }

    const err = new Error(errorData.error) as Error & { details: ApiErrorResponse; status: number };
    err.details = errorData;
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export async function fetchOrderById(id: string, signal?: AbortSignal): Promise<Order> {
  const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
    signal,
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order: HTTP ${response.status}`);
  }

  const json = await response.json();
  return json.data;
}
