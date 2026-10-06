'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Order, SortField, SortOrder } from '@/lib/types';
import { STATUS_BADGES, PRIORITY_BADGES } from '@/lib/badgeConfig';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2
} from 'lucide-react';

interface VirtualizedTableProps {
  orders: Order[];
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onSelectOrder: (orderId: string) => void;
  selectedId: string | null;
  isLoading?: boolean;
}

export function VirtualizedTable({
  orders,
  sortBy,
  sortOrder,
  onSort,
  onSelectOrder,
  selectedId,
}: VirtualizedTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const rowVirtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, 
    overscan: 10,
  });

  useEffect(() => {
    if (selectedId && orders.length > 0) {
      const idx = orders.findIndex((o) => o.id === selectedId || o.orderNumber === selectedId);
      if (idx !== -1) {
        setFocusedIndex(idx);
      }
    }
  }, [selectedId, orders]);

  useEffect(() => {
    if (focusedIndex >= 0) {
      const timer = setTimeout(() => {
        const el = parentRef.current?.querySelector<HTMLDivElement>(
          `[data-row-index="${focusedIndex}"]`
        );
        if (el && document.activeElement !== el) {
          el.focus({ preventScroll: true });
        }
      }, 16);
      return () => clearTimeout(timer);
    }
  }, [focusedIndex]);

  const navigateRow = useCallback(
    (nextIdx: number) => {
      if (orders.length === 0) return;
      const bounded = Math.max(0, Math.min(orders.length - 1, nextIdx));
      setFocusedIndex(bounded);
      rowVirtualizer.scrollToIndex(bounded, { align: 'auto' });
    },
    [orders.length, rowVirtualizer]
  );

  const handleTableKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const navKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', 'Enter', ' '];
      if (!navKeys.includes(e.key)) return;

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'ArrowDown') {
        navigateRow(focusedIndex === -1 ? 0 : focusedIndex + 1);
      } else if (e.key === 'ArrowUp') {
        navigateRow(focusedIndex === -1 ? 0 : focusedIndex - 1);
      } else if (e.key === 'Home') {
        navigateRow(0);
      } else if (e.key === 'End') {
        navigateRow(orders.length - 1);
      } else if (e.key === 'PageDown') {
        navigateRow(focusedIndex === -1 ? 8 : focusedIndex + 8);
      } else if (e.key === 'PageUp') {
        navigateRow(focusedIndex === -1 ? 0 : focusedIndex - 8);
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (focusedIndex >= 0 && orders[focusedIndex]) {
          onSelectOrder(orders[focusedIndex].id);
        }
      }
    },
    [focusedIndex, orders, navigateRow, onSelectOrder]
  );

  useEffect(() => {
    const onWindowKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.isContentEditable ||
          active.closest('[role="dialog"]') ||
          active.closest('[data-modal]'))
      ) {
        return;
      }

      if (selectedId) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateRow(focusedIndex === -1 ? 0 : focusedIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateRow(focusedIndex === -1 ? 0 : focusedIndex - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigateRow(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigateRow(orders.length - 1);
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        navigateRow(focusedIndex === -1 ? 8 : focusedIndex + 8);
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        navigateRow(focusedIndex === -1 ? 0 : focusedIndex - 8);
      } else if (e.key === 'Enter') {
        if (focusedIndex >= 0 && orders[focusedIndex]) {
          e.preventDefault();
          onSelectOrder(orders[focusedIndex].id);
        }
      }
    };

    window.addEventListener('keydown', onWindowKeyDown);
    return () => window.removeEventListener('keydown', onWindowKeyDown);
  }, [focusedIndex, orders, navigateRow, onSelectOrder, selectedId]);

  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-35 group-hover:opacity-80 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-violet-700" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-violet-700" />
    );
  };

  const getAriaSort = (field: SortField) => {
    if (sortBy !== field) return 'none';
    return sortOrder === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <div
            role="rowgroup"
            className="grid grid-cols-[135px_minmax(180px,1.4fr)_minmax(130px,1fr)_120px_100px_125px_105px] gap-4 px-5 py-3.5 bg-stone-100 border-b border-stone-200/90 text-xs font-bold text-stone-700 uppercase tracking-wider select-none min-w-[960px]"
          >
            <button
              onClick={() => onSort('orderNumber')}
              aria-sort={getAriaSort('orderNumber')}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer group text-left ${
                sortBy === 'orderNumber' ? 'text-violet-700' : 'hover:text-stone-900'
              }`}
            >
              <span>Order ID</span>
              {renderSortIcon('orderNumber')}
            </button>

            <button
              onClick={() => onSort('customer')}
              aria-sort={getAriaSort('customer')}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer group text-left ${
                sortBy === 'customer' ? 'text-violet-700' : 'hover:text-stone-900'
              }`}
            >
              <span>Customer & Account</span>
              {renderSortIcon('customer')}
            </button>

            <div className="text-left text-stone-600">
              Category
            </div>

            <button
              onClick={() => onSort('amount')}
              aria-sort={getAriaSort('amount')}
              className={`flex items-center justify-end gap-1.5 transition-colors cursor-pointer group text-right ${
                sortBy === 'amount' ? 'text-violet-700' : 'hover:text-stone-900'
              }`}
            >
              <span>Total (USD)</span>
              {renderSortIcon('amount')}
            </button>

            <button
              onClick={() => onSort('priority')}
              aria-sort={getAriaSort('priority')}
              className={`flex items-center justify-center gap-1 transition-colors cursor-pointer group text-center ${
                sortBy === 'priority' ? 'text-violet-700' : 'hover:text-stone-900'
              }`}
            >
              <span>Priority</span>
              {renderSortIcon('priority')}
            </button>

            <button
              onClick={() => onSort('status')}
              aria-sort={getAriaSort('status')}
              className={`flex items-center justify-center gap-1.5 transition-colors cursor-pointer group text-center ${
                sortBy === 'status' ? 'text-violet-700' : 'hover:text-stone-900'
              }`}
            >
              <span>Status</span>
              {renderSortIcon('status')}
            </button>

            <button
              onClick={() => onSort('createdAt')}
              aria-sort={getAriaSort('createdAt')}
              className={`flex items-center justify-end gap-1 transition-colors cursor-pointer group text-right ${
                sortBy === 'createdAt' ? 'text-violet-700' : 'hover:text-stone-900'
              }`}
            >
              <span>Date</span>
              {renderSortIcon('createdAt')}
            </button>
          </div>

          <div
            ref={parentRef}
            role="table"
            aria-label="Enterprise Orders Dataset"
            tabIndex={0}
            onFocus={() => {
              if (focusedIndex === -1 && orders.length > 0) {
                navigateRow(0);
              }
            }}
            onKeyDown={handleTableKeyDown}
            className="h-[560px] overflow-y-auto overscroll-contain overflow-x-hidden relative focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 min-w-[960px]"
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const order = orders[virtualRow.index];
                if (!order) return null;

                const isSelected = selectedId === order.id;
                const isFocused = focusedIndex === virtualRow.index;
                const statusConfig = STATUS_BADGES[order.status];
                const priorityConfig = PRIORITY_BADGES[order.priority];

                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={order.id}
                    role="row"
                    data-row-index={virtualRow.index}
                    tabIndex={-1}
                    aria-selected={isSelected}
                    onClick={() => {
                      setFocusedIndex(virtualRow.index);
                      onSelectOrder(order.id);
                    }}
                    onFocus={() => {
                      setFocusedIndex(virtualRow.index);
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={`grid grid-cols-[135px_minmax(180px,1.4fr)_minmax(130px,1fr)_120px_100px_125px_105px] gap-4 px-5 items-center border-b border-stone-100 cursor-pointer transition-colors text-sm ${
                      isSelected
                        ? 'bg-violet-100/90 border-l-4 border-l-violet-600'
                        : isFocused
                        ? 'bg-violet-50/85'
                        : 'hover:bg-stone-50/70'
                    } ${isFocused ? 'ring-2 ring-inset ring-violet-500 z-10 shadow-sm' : ''} focus-visible:outline-none`}
                  >
                    <div className="flex items-center">
                      <span className="font-mono text-xs font-semibold text-stone-800 tracking-tight">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div className="flex flex-col justify-center min-w-0 pr-1">
                      <span className="text-xs sm:text-sm font-semibold text-stone-900 truncate flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-stone-400 shrink-0" />
                        <span className="truncate">{order.customer.company}</span>
                      </span>
                      <span className="text-[11px] text-stone-500 truncate mt-0.5">
                        {order.customer.name}
                      </span>
                    </div>

                    <div className="flex items-center text-xs text-stone-600 truncate">
                      <span className="truncate font-medium">{order.category}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-xs sm:text-sm text-stone-900 block">
                        ${order.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="block text-[10px] text-stone-400 font-mono mt-0.5">
                        {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border tracking-wider ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}
                      >
                        {priorityConfig.label}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                        <span className="truncate">{statusConfig.label}</span>
                      </span>
                    </div>

                    <div className="flex justify-end text-right">
                      <span className="text-xs text-stone-500 font-mono">
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-stone-500 font-mono text-[11px] px-2 py-0.5 select-none">
        <span className="text-stone-400">Showing {orders.length} orders in view</span>
        <div className="flex items-center gap-2">
          <span>Use [↑ / ↓] keys to navigate</span>
          <span className="text-stone-300">•</span>
          <span>[Enter] opens details</span>
        </div>
      </div>
    </div>
  );
}
