'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  FilterParams,
  OrderStatus,
  OrderPriority,
  OrderRegion,
  OrderCategory,
  SortField,
  SortOrder,
} from '@/lib/types';

export const DEFAULT_PAGE_SIZE = 50;

export const DEFAULT_PARAMS: FilterParams = {
  q: '',
  status: [],
  priority: [],
  region: [],
  category: [],
  minAmount: undefined,
  maxAmount: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  selectedId: null,
};

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSelectedId = searchParams.get('selectedId') || null;
  const [prevUrlSelectedId, setPrevUrlSelectedId] = useState<string | null>(urlSelectedId);
  const [selectedId, setSelectedIdState] = useState<string | null>(urlSelectedId);

  if (urlSelectedId !== prevUrlSelectedId) {
    setPrevUrlSelectedId(urlSelectedId);
    setSelectedIdState(urlSelectedId);
  }

  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      setSelectedIdState(sp.get('selectedId') || null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const statusRaw = searchParams.getAll('status');
  const statusKey = statusRaw.join(',');
  const status = useMemo(() => statusRaw as OrderStatus[], [statusKey]);

  const priorityRaw = searchParams.getAll('priority');
  const priorityKey = priorityRaw.join(',');
  const priority = useMemo(() => priorityRaw as OrderPriority[], [priorityKey]);

  const regionRaw = searchParams.getAll('region');
  const regionKey = regionRaw.join(',');
  const region = useMemo(() => regionRaw as OrderRegion[], [regionKey]);

  const categoryRaw = searchParams.getAll('category');
  const categoryKey = categoryRaw.join(',');
  const category = useMemo(() => categoryRaw as OrderCategory[], [categoryKey]);

  const currentParams: FilterParams = useMemo(() => {
    const q = searchParams.get('q') || '';
    const minAmount = searchParams.has('minAmount')
      ? parseFloat(searchParams.get('minAmount')!)
      : undefined;
    const maxAmount = searchParams.has('maxAmount')
      ? parseFloat(searchParams.get('maxAmount')!)
      : undefined;
    const sortBy = (searchParams.get('sortBy') as SortField) || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'desc';
    const page = searchParams.has('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.has('pageSize')
      ? parseInt(searchParams.get('pageSize')!, 10)
      : DEFAULT_PAGE_SIZE;

    return {
      q,
      status,
      priority,
      region,
      category,
      minAmount: minAmount && !isNaN(minAmount) ? minAmount : undefined,
      maxAmount: maxAmount && !isNaN(maxAmount) ? maxAmount : undefined,
      sortBy,
      sortOrder,
      page: isNaN(page) || page < 1 ? 1 : page,
      pageSize: isNaN(pageSize) || pageSize < 1 ? DEFAULT_PAGE_SIZE : pageSize,
      selectedId,
    };
  }, [searchParams, status, priority, region, category, selectedId]);

  const serializeParams = useCallback((params: FilterParams): string => {
    const sp = new URLSearchParams();

    if (params.q.trim()) sp.set('q', params.q.trim());
    params.status.forEach((s) => sp.append('status', s));
    params.priority.forEach((p) => sp.append('priority', p));
    params.region.forEach((r) => sp.append('region', r));
    params.category.forEach((c) => sp.append('category', c));

    if (typeof params.minAmount === 'number' && !isNaN(params.minAmount)) {
      sp.set('minAmount', params.minAmount.toString());
    }
    if (typeof params.maxAmount === 'number' && !isNaN(params.maxAmount)) {
      sp.set('maxAmount', params.maxAmount.toString());
    }

    if (params.sortBy !== 'createdAt') sp.set('sortBy', params.sortBy);
    if (params.sortOrder !== 'desc') sp.set('sortOrder', params.sortOrder);
    if (params.page > 1) sp.set('page', params.page.toString());
    if (params.pageSize !== DEFAULT_PAGE_SIZE) sp.set('pageSize', params.pageSize.toString());
    if (params.selectedId) sp.set('selectedId', params.selectedId);

    const str = sp.toString();
    return str ? `?${str}` : '';
  }, []);

  // Update URL atomically without reloading
  const updateUrl = useCallback(
    (updater: (prev: FilterParams) => FilterParams, pushHistory: boolean = false) => {
      const next = updater(currentParams);
      const query = serializeParams(next);
      const url = `${pathname}${query}`;

      if (pushHistory) {
        router.push(url, { scroll: false });
      } else {
        router.replace(url, { scroll: false });
      }
    },
    [currentParams, pathname, router, serializeParams]
  );

  // Setters
  const setSearch = useCallback(
    (q: string) => {
      updateUrl((prev) => ({ ...prev, q, page: 1 }));
    },
    [updateUrl]
  );

  const toggleStatus = useCallback(
    (status: OrderStatus) => {
      updateUrl((prev) => {
        const exists = prev.status.includes(status);
        const nextStatus = exists
          ? prev.status.filter((s) => s !== status)
          : [...prev.status, status];
        return { ...prev, status: nextStatus, page: 1 };
      });
    },
    [updateUrl]
  );

  const togglePriority = useCallback(
    (priority: OrderPriority) => {
      updateUrl((prev) => {
        const exists = prev.priority.includes(priority);
        const nextPriority = exists
          ? prev.priority.filter((p) => p !== priority)
          : [...prev.priority, priority];
        return { ...prev, priority: nextPriority, page: 1 };
      });
    },
    [updateUrl]
  );

  const toggleRegion = useCallback(
    (region: OrderRegion) => {
      updateUrl((prev) => {
        const exists = prev.region.includes(region);
        const nextRegion = exists
          ? prev.region.filter((r) => r !== region)
          : [...prev.region, region];
        return { ...prev, region: nextRegion, page: 1 };
      });
    },
    [updateUrl]
  );

  const toggleCategory = useCallback(
    (category: OrderCategory) => {
      updateUrl((prev) => {
        const exists = prev.category.includes(category);
        const nextCategory = exists
          ? prev.category.filter((c) => c !== category)
          : [...prev.category, category];
        return { ...prev, category: nextCategory, page: 1 };
      });
    },
    [updateUrl]
  );

  const setSorting = useCallback(
    (field: SortField) => {
      updateUrl((prev) => {
        if (prev.sortBy === field) {
          // Toggle direction
          return {
            ...prev,
            sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
            page: 1,
          };
        }
        return {
          ...prev,
          sortBy: field,
          sortOrder: 'desc',
          page: 1,
        };
      });
    },
    [updateUrl]
  );

  const setPage = useCallback(
    (page: number) => {
      updateUrl((prev) => ({ ...prev, page }));
    },
    [updateUrl]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      updateUrl((prev) => ({ ...prev, pageSize, page: 1 }));
    },
    [updateUrl]
  );

  const setSelectedId = useCallback(
    (newSelectedId: string | null) => {
      setSelectedIdState(newSelectedId);
      // Using pushHistory so pressing browser "Back" smoothly closes the drawer!
      updateUrl((prev) => ({ ...prev, selectedId: newSelectedId }), true);
    },
    [updateUrl]
  );

  const resetFilters = useCallback(() => {
    setSelectedIdState(null);
    updateUrl(() => ({ ...DEFAULT_PARAMS }));
  }, [updateUrl]);

  const getShareableUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const cleanQuery = serializeParams(currentParams);
    return `${window.location.origin}${pathname}${cleanQuery}`;
  }, [currentParams, pathname, serializeParams]);

  return {
    params: currentParams,
    setSearch,
    toggleStatus,
    togglePriority,
    toggleRegion,
    toggleCategory,
    setSorting,
    setPage,
    setPageSize,
    setSelectedId,
    resetFilters,
    getShareableUrl,
  };
}
