export type OrderStatus =
  | 'delivered'
  | 'processing'
  | 'in_transit'
  | 'pending'
  | 'cancelled'
  | 'refunded';

export type OrderPriority = 'critical' | 'high' | 'medium' | 'low';

export type OrderRegion = 'North America' | 'EMEA' | 'APAC' | 'LATAM';

export type OrderCategory =
  | 'Cloud Infrastructure'
  | 'AI Hardware'
  | 'Security Suite'
  | 'Enterprise Licenses'
  | 'Dedicated Transit';

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    company: string;
    email: string;
    phone: string;
    avatarSeed: string;
  };
  status: OrderStatus;
  priority: OrderPriority;
  amount: number;
  currency: string;
  region: OrderRegion;
  category: OrderCategory;
  paymentMethod: 'Credit Card' | 'Wire Transfer' | 'ACH Direct' | 'Crypto / USDC';
  itemsCount: number;
  items: OrderItem[];
  trackingNumber: string;
  carrier: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
  notes: string;
  auditTrail: AuditLog[];
}

export type SortField =
  | 'orderNumber'
  | 'customer'
  | 'amount'
  | 'createdAt'
  | 'status'
  | 'priority';

export type SortOrder = 'asc' | 'desc';

export interface FilterParams {
  q: string;
  status: OrderStatus[];
  priority: OrderPriority[];
  region: OrderRegion[];
  category: OrderCategory[];
  minAmount?: number;
  maxAmount?: number;
  sortBy: SortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
  selectedId: string | null;
}

export interface PaginationMeta {
  totalCount: number;
  filteredCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  meta: {
    latencyMs: number;
    requestId: string;
    timestamp: number;
    chaosInjected: boolean;
  };
}

export interface ApiErrorResponse {
  error: string;
  code: string;
  requestId: string;
  timestamp: number;
}

export interface RequestLogEntry {
  id: string;
  timestamp: number;
  query: string;
  status: 'pending' | 'success' | 'cancelled' | 'error';
  latencyMs?: number;
  resultCount?: number;
  errorMessage?: string;
}
