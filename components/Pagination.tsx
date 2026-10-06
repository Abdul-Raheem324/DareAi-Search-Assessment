'use client';

import React, { useState } from 'react';
import { PaginationMeta } from '@/lib/types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  disabled?: boolean;
}

export function Pagination({ meta, onPageChange, onPageSizeChange, disabled = false }: PaginationProps) {
  const { page, totalPages, pageSize, filteredCount, totalCount, hasNextPage, hasPrevPage } = meta;
  const [jumpPage, setJumpPage] = useState('');

  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, filteredCount);

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const target = parseInt(jumpPage, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
      setJumpPage('');
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 py-3.5 px-4 rounded-xl bg-white border border-stone-200 shadow-sm text-xs text-stone-600 transition-opacity ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-2">
        <span>
          Showing <strong className="text-stone-900">{filteredCount > 0 ? startRecord : 0}</strong>–
          <strong className="text-stone-900">{endRecord}</strong> of{' '}
          <strong className="text-violet-600">{filteredCount.toLocaleString()}</strong> results
        </span>
        {filteredCount !== totalCount && (
          <span className="text-stone-400 hidden sm:inline">
            (filtered from {totalCount.toLocaleString()} total)
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-stone-400">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            aria-label="Items per page"
            className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-stone-700 text-xs focus:ring-1 focus:ring-violet-400 focus:outline-none cursor-pointer shadow-sm"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={!hasPrevPage}
            aria-label="First page"
            className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shadow-sm"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevPage}
            aria-label="Previous page"
            className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shadow-sm"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <span className="px-3 py-1 font-mono text-xs text-stone-700 font-semibold bg-stone-50 rounded-md border border-stone-200">
            {page} / {totalPages || 1}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            aria-label="Next page"
            className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shadow-sm"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            aria-label="Last page"
            className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shadow-sm"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={handleJumpSubmit} className="hidden md:flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            max={totalPages}
            placeholder="Go to"
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            aria-label="Jump to page number"
            className="w-16 px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs focus:ring-1 focus:ring-violet-400 focus:outline-none shadow-sm"
          />
          <button
            type="submit"
            className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-600 text-xs font-medium cursor-pointer"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
}

