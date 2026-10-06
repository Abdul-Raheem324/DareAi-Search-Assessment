'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FilterParams, ApiResponse, Order, ApiErrorResponse, RequestLogEntry } from '@/lib/types';
import { fetchOrders } from '@/lib/apiClient';

export interface UseOrdersQueryOptions {
  simulatedLatency?: number;
  failRate?: number;
  forceFail?: boolean;
}

export function useOrdersQuery(params: FilterParams, options: UseOrdersQueryOptions = {}) {
  const [data, setData] = useState<ApiResponse<Order> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [requestLogs, setRequestLogs] = useState<RequestLogEntry[]>([]);

  const activeControllerRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef<number>(0);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const appendLog = useCallback((entry: RequestLogEntry) => {
    setRequestLogs((prev) => [entry, ...prev.slice(0, 24)]);
  }, []);

  const updateLog = useCallback((id: string, updates: Partial<RequestLogEntry>) => {
    setRequestLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updates } : log))
    );
  }, []);

  const executeQuery = useCallback(
    async (
      overrideParams?: Partial<FilterParams>,
      overrideOptions?: Partial<UseOrdersQueryOptions>
    ) => {
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
        activeControllerRef.current = null;
      }

      const currentSeq = ++requestSeqRef.current;
      const controller = new AbortController();
      activeControllerRef.current = controller;

      const mergedParams = { ...paramsRef.current, ...overrideParams };
      const mergedOptions = { ...optionsRef.current, ...overrideOptions };

      const requestId = `req_${currentSeq}_${Math.random().toString(36).substring(2, 6)}`;
      const startTime = performance.now();

      // UI state transition: If we already have data, show subtle isFetching. If initial or empty, show isLoading.
      setIsFetching(true);
      setError(null);

      // Log request initiation
      const querySummary = [
        mergedParams.q ? `q:"${mergedParams.q}"` : '',
        mergedParams.status.length ? `status:[${mergedParams.status.join(',')}]` : '',
        mergedParams.priority.length ? `priority:[${mergedParams.priority.join(',')}]` : '',
        `p:${mergedParams.page}`,
        `sort:${mergedParams.sortBy}_${mergedParams.sortOrder}`
      ]
        .filter(Boolean)
        .join(' | ') || 'all_orders';

      appendLog({
        id: requestId,
        timestamp: Date.now(),
        query: querySummary,
        status: 'pending',
      });

      try {
        const result = await fetchOrders(mergedParams, {
          signal: controller.signal,
          simulatedLatency: mergedOptions.simulatedLatency,
          failRate: mergedOptions.failRate,
          forceFail: mergedOptions.forceFail,
        });

        // 3. Strict Concurrency Check: If a newer request was dispatched while this was in-flight, IGNORE!
        if (currentSeq !== requestSeqRef.current) {
          updateLog(requestId, {
            status: 'cancelled',
            latencyMs: Math.round(performance.now() - startTime),
            errorMessage: 'Slow response ignored (superseded by newer request)',
          });
          return;
        }

        const duration = Math.round(performance.now() - startTime);
        setData(result);
        setError(null);
        setIsLoading(false);
        setIsFetching(false);

        updateLog(requestId, {
          status: 'success',
          latencyMs: duration,
          resultCount: result.pagination.filteredCount,
        });
      } catch (err: unknown) {
        const errorObj = err as Error & { details?: ApiErrorResponse; name?: string };

        // Handle AbortError (cancellation)
        if (errorObj?.name === 'AbortError' || controller.signal.aborted) {
          updateLog(requestId, {
            status: 'cancelled',
            latencyMs: Math.round(performance.now() - startTime),
            errorMessage: 'Aborted via AbortController (slow response ignored)',
          });
          // Do not overwrite UI state when cancelled!
          return;
        }

        // Check sequence token even on error
        if (currentSeq !== requestSeqRef.current) {
          return;
        }

        const duration = Math.round(performance.now() - startTime);
        const errorPayload: ApiErrorResponse = errorObj?.details || {
          error: errorObj?.message || 'Network request failed',
          code: 'FETCH_ERROR',
          requestId,
          timestamp: Date.now(),
        };

        // Honest error handling: Never leave old data looking current when the active query fails
        setError(errorPayload);
        setIsLoading(false);
        setIsFetching(false);

        updateLog(requestId, {
          status: 'error',
          latencyMs: duration,
          errorMessage: errorPayload.error,
        });
      }
    },
    [appendLog, updateLog]
  );

  const statusKey = params.status.join(',');
  const priorityKey = params.priority.join(',');
  const regionKey = params.region.join(',');
  const categoryKey = params.category.join(',');

  // Trigger fetch only when query/filter parameters or chaos options change (excluding selectedId drawer state)
  useEffect(() => {
    executeQuery();

    return () => {
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }
    };
  }, [
    params.q,
    statusKey,
    priorityKey,
    regionKey,
    categoryKey,
    params.minAmount,
    params.maxAmount,
    params.sortBy,
    params.sortOrder,
    params.page,
    params.pageSize,
    options.simulatedLatency,
    options.failRate,
    options.forceFail,
    executeQuery,
  ]);

  // Retry function for error state
  const retry = useCallback(() => {
    setIsLoading(true);
    executeQuery();
  }, [executeQuery]);

  const [raceDemoMessage, setRaceDemoMessage] = useState<string | null>(null);

  // Demo: Stress test race condition live (mirrors Playwright test: slow query followed by fast query)
  const triggerRaceDemo = useCallback(async () => {
    setRaceDemoMessage('Dispatched slow request (2.8s) for "Cloud"...');
    executeQuery({ q: 'Cloud' }, { simulatedLatency: 2800 });

    await new Promise((r) => setTimeout(r, 120));

    setRaceDemoMessage('Dispatched fast request (200ms) for "AI Hardware" (superseding slow request)...');
    executeQuery({ q: 'AI Hardware' }, { simulatedLatency: 200 });

    await new Promise((r) => setTimeout(r, 400));
    setRaceDemoMessage('Race demo verified: Fast request committed. Slow response ignored and aborted via AbortController!');
  }, [executeQuery]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    requestLogs,
    retry,
    triggerRaceDemo,
    raceDemoMessage,
    clearLogs: () => setRequestLogs([]),
  };
}
