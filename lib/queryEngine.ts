import { Order, FilterParams, ApiResponse, ApiErrorResponse } from './types';
import { getMockOrdersDataset } from './mockData';

export interface ExecuteQueryOptions {
  simulatedLatency?: number; 
  failRate?: number; 
  forceFail?: boolean;
}

export async function executeOrdersQuery(
  params: Partial<FilterParams>,
  options: ExecuteQueryOptions = {}
): Promise<ApiResponse<Order>> {
  const allOrders = getMockOrdersDataset();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Determine simulated latency (assignment: 200 ms to 3 s)
  let latencyMs: number;
  if (typeof options.simulatedLatency === 'number') {
    latencyMs = options.simulatedLatency;
  } else {
    // Random latency between 200ms and 3000ms
    latencyMs = Math.floor(Math.random() * (3000 - 200 + 1)) + 200;
  }

  // 2. Determine failure (assignment: fail roughly 1 in 10 requests)
  const failRate = typeof options.failRate === 'number' ? options.failRate : 0.1;
  const shouldFail = options.forceFail || Math.random() < failRate;

  // Simulate network flight time
  if (latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, latencyMs));
  }

  // 3. Inject Chaos Failure if triggered
  if (shouldFail) {
    const errorPayload: ApiErrorResponse = {
      error: 'Upstream Gateway Error (HTTP 500): The simulated remote database service encountered an unhandled transient fault.',
      code: 'CHAOS_TRANSIENT_FAULT_500',
      requestId,
      timestamp: Date.now()
    };
    const error = new Error(errorPayload.error) as Error & { details: ApiErrorResponse };
    error.details = errorPayload;
    throw error;
  }

  // 4. Perform Server-side Search Filtering
  let results = allOrders;

  // Search filter (text across order number, customer, company, email, tracking, category, item names)
  const searchQuery = params.q?.trim().toLowerCase();
  if (searchQuery) {
    results = results.filter((order) => {
      if (order.orderNumber.toLowerCase().includes(searchQuery)) return true;
      if (order.customer.name.toLowerCase().includes(searchQuery)) return true;
      if (order.customer.company.toLowerCase().includes(searchQuery)) return true;
      if (order.customer.email.toLowerCase().includes(searchQuery)) return true;
      if (order.trackingNumber.toLowerCase().includes(searchQuery)) return true;
      if (order.category.toLowerCase().includes(searchQuery)) return true;
      if (order.carrier.toLowerCase().includes(searchQuery)) return true;
      return order.items.some((item) => item.name.toLowerCase().includes(searchQuery) || item.sku.toLowerCase().includes(searchQuery));
    });
  }

  // Status filter (multi-select)
  if (params.status && params.status.length > 0) {
    const statusSet = new Set(params.status);
    results = results.filter((order) => statusSet.has(order.status));
  }

  // Priority filter (multi-select)
  if (params.priority && params.priority.length > 0) {
    const prioritySet = new Set(params.priority);
    results = results.filter((order) => prioritySet.has(order.priority));
  }

  // Region filter (multi-select)
  if (params.region && params.region.length > 0) {
    const regionSet = new Set(params.region);
    results = results.filter((order) => regionSet.has(order.region));
  }

  // Category filter (multi-select)
  if (params.category && params.category.length > 0) {
    const categorySet = new Set(params.category);
    results = results.filter((order) => categorySet.has(order.category));
  }

  // Amount range filters
  if (typeof params.minAmount === 'number' && !isNaN(params.minAmount)) {
    results = results.filter((order) => order.amount >= params.minAmount!);
  }
  if (typeof params.maxAmount === 'number' && !isNaN(params.maxAmount)) {
    results = results.filter((order) => order.amount <= params.maxAmount!);
  }

  // 5. Perform Server-side Sorting
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';
  const multiplier = sortOrder === 'asc' ? 1 : -1;

  results = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'orderNumber':
        return a.orderNumber.localeCompare(b.orderNumber) * multiplier;
      case 'customer':
        return a.customer.company.localeCompare(b.customer.company) * multiplier;
      case 'amount':
        return (a.amount - b.amount) * multiplier;
      case 'createdAt':
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier;
      case 'status':
        return a.status.localeCompare(b.status) * multiplier;
      case 'priority': {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priorityWeight[a.priority] - priorityWeight[b.priority]) * multiplier;
      }
      default:
        return 0;
    }
  });

  // 6. Perform Server-side Pagination
  const filteredCount = results.length;
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, params.pageSize || 50);
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));

  const startIndex = (page - 1) * pageSize;
  const paginatedItems = results.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedItems,
    pagination: {
      totalCount: allOrders.length,
      filteredCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    meta: {
      latencyMs,
      requestId,
      timestamp: Date.now(),
      chaosInjected: shouldFail
    }
  };
}

export function getOrderById(id: string): Order | null {
  const allOrders = getMockOrdersDataset();
  return (
    allOrders.find(
      (order) => order.id === id || order.orderNumber.toLowerCase() === id.toLowerCase()
    ) || null
  );
}
