'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, SearchX, ShieldAlert } from 'lucide-react';
import { ApiErrorResponse } from '@/lib/types';

interface ErrorStateProps {
  error: ApiErrorResponse | null;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="my-8 mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 border border-rose-200 text-rose-600">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-xs font-mono text-rose-600 border border-rose-200 mb-3">
        <ShieldAlert className="h-3.5 w-3.5" />
        <span>{error?.code || 'SIMULATED_500_FAULT'}</span>
        {error?.requestId && <span className="opacity-60">ID: {error.requestId}</span>}
      </div>

      <h3 className="text-xl font-bold tracking-tight text-stone-900 mb-2">
        Request Failed
      </h3>
      <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed mb-6">
        {error?.error ||
          'The server returned a 500 Internal Server Error due to simulated network latency & fault injection.'}
      </p>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying Connection...' : 'Retry Request'}</span>
        </button>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onReset: () => void;
  query?: string;
}

export function EmptyState({ onReset, query }: EmptyStateProps) {
  return (
    <div className="my-12 mx-auto max-w-md text-center p-8 rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 border border-stone-200 text-stone-400">
        <SearchX className="h-7 w-7" />
      </div>

      <h3 className="text-lg font-semibold text-stone-900 mb-1">
        No Matching Records Found
      </h3>
      <p className="text-sm text-stone-500 mb-6">
        {query
          ? `We couldn't find any orders matching "${query}". Try adjusting your filters or search keywords.`
          : 'No orders match the selected filter combination. Reset your filters to view all records.'}
      </p>

      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 font-medium text-sm transition-all border border-stone-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Reset All Filters</span>
      </button>
    </div>
  );
}

export function TableSkeletonRows({ rowCount = 9 }: { rowCount?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        role="status"
        aria-label="Loading orders table..."
        className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-sm flex flex-col"
      >
        <div className="overflow-x-auto">
          <div
            role="rowgroup"
            className="grid grid-cols-[135px_minmax(180px,1.4fr)_minmax(130px,1fr)_120px_100px_125px_105px] gap-4 px-5 py-3.5 bg-stone-100 border-b border-stone-200/90 text-xs font-bold text-stone-700 uppercase tracking-wider select-none min-w-[960px]"
          >
            <div>Order ID</div>
            <div>Customer & Account</div>
            <div>Category</div>
            <div className="text-right">Total (USD)</div>
            <div className="text-center">Priority</div>
            <div className="text-center">Status</div>
            <div className="text-right">Date</div>
          </div>

          <div className="divide-y divide-stone-100 min-w-[960px]">
            {Array.from({ length: rowCount }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[135px_minmax(180px,1.4fr)_minmax(130px,1fr)_120px_100px_125px_105px] gap-4 px-5 h-16 items-center animate-pulse"
              >
                <div className="flex items-center">
                  <div className="h-4 w-24 rounded-md bg-stone-200" />
                </div>

                <div className="flex flex-col justify-center gap-1.5 pr-1">
                  <div className="h-3.5 w-36 rounded-md bg-stone-200" />
                  <div className="h-2.5 w-24 rounded bg-stone-100" />
                </div>

                <div className="flex items-center">
                  <div className="h-3.5 w-28 rounded-md bg-stone-200" />
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div className="h-3.5 w-20 rounded-md bg-stone-200" />
                  <div className="h-2.5 w-12 rounded bg-stone-100" />
                </div>

                <div className="flex justify-center">
                  <div className="h-5 w-14 rounded-md bg-stone-200" />
                </div>

                <div className="flex justify-center">
                  <div className="h-6 w-24 rounded-full bg-stone-200" />
                </div>

                <div className="flex justify-end">
                  <div className="h-3 w-16 rounded bg-stone-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
