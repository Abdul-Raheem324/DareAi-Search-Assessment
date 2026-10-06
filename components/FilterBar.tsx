'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  OrderStatus,
  OrderPriority,
  OrderRegion,
  OrderCategory,
} from '@/lib/types';
import { Filter, X, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  status: OrderStatus[];
  priority: OrderPriority[];
  region: OrderRegion[];
  category: OrderCategory[];
  onToggleStatus: (status: OrderStatus) => void;
  onTogglePriority: (priority: OrderPriority) => void;
  onToggleRegion: (region: OrderRegion) => void;
  onToggleCategory: (category: OrderCategory) => void;
  onReset: () => void;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; dot: string; activeBg: string; activeBorder: string; text: string }
> = {
  delivered: {
    label: 'Delivered',
    dot: 'bg-emerald-500',
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-emerald-300',
    text: 'text-emerald-700',
  },
  processing: {
    label: 'Processing',
    dot: 'bg-amber-500',
    activeBg: 'bg-amber-50',
    activeBorder: 'border-amber-300',
    text: 'text-amber-700',
  },
  in_transit: {
    label: 'In Transit',
    dot: 'bg-violet-500',
    activeBg: 'bg-violet-50',
    activeBorder: 'border-violet-300',
    text: 'text-violet-700',
  },
  pending: {
    label: 'Pending',
    dot: 'bg-sky-500',
    activeBg: 'bg-sky-50',
    activeBorder: 'border-sky-300',
    text: 'text-sky-700',
  },
  cancelled: {
    label: 'Cancelled',
    dot: 'bg-rose-500',
    activeBg: 'bg-rose-50',
    activeBorder: 'border-rose-300',
    text: 'text-rose-700',
  },
  refunded: {
    label: 'Refunded',
    dot: 'bg-stone-400',
    activeBg: 'bg-stone-100',
    activeBorder: 'border-stone-300',
    text: 'text-stone-600',
  },
};

const PRIORITY_OPTIONS: OrderPriority[] = ['critical', 'high', 'medium', 'low'];
const REGION_OPTIONS: OrderRegion[] = ['North America', 'EMEA', 'APAC', 'LATAM'];
const CATEGORY_OPTIONS: OrderCategory[] = [
  'Cloud Infrastructure',
  'AI Hardware',
  'Security Suite',
  'Enterprise Licenses',
  'Dedicated Transit',
];

export function FilterBar({
  status,
  priority,
  region,
  category,
  onToggleStatus,
  onTogglePriority,
  onToggleRegion,
  onToggleCategory,
  onReset,
}: FilterBarProps) {
  const activeFiltersCount = status.length + priority.length + region.length + category.length;
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    }

    if (categoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [categoryOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setCategoryOpen(false);
      }
    }

    if (categoryOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [categoryOpen]);

  return (
    <div className="flex flex-col gap-3 py-3 border-y border-stone-200">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Status:</span>
          </span>

          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((st) => {
            const config = STATUS_CONFIG[st];
            const isSelected = status.includes(st);

            return (
              <button
                key={st}
                onClick={() => onToggleStatus(st)}
                aria-pressed={isSelected}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                  isSelected
                    ? `${config.activeBg} ${config.activeBorder} ${config.text} shadow-sm`
                    : 'bg-white border-stone-200 text-stone-500 hover:text-stone-800 hover:border-stone-300 shadow-sm'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
          >
            <X className="h-3 w-3" />
            <span>Clear Filters ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-stone-500 font-medium">Priority:</span>
          <div className="flex items-center gap-1">
            {PRIORITY_OPTIONS.map((p) => {
              const isSelected = priority.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => onTogglePriority(p)}
                  aria-pressed={isSelected}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-all border cursor-pointer ${
                    isSelected
                      ? p === 'critical'
                        ? 'bg-rose-100 text-rose-700 border-rose-300'
                        : p === 'high'
                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                        : 'bg-violet-100 text-violet-700 border-violet-300'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <span className="text-stone-300 hidden sm:inline">•</span>

        <div className="flex items-center gap-1.5">
          <span className="text-stone-500 font-medium">Region:</span>
          <div className="flex items-center gap-1">
            {REGION_OPTIONS.map((r) => {
              const isSelected = region.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => onToggleRegion(r)}
                  aria-pressed={isSelected}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-violet-100 text-violet-700 border-violet-300'
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <span className="text-stone-300 hidden sm:inline">•</span>

        <div className="relative inline-block" ref={categoryDropdownRef}>
          <button
            type="button"
            onClick={() => setCategoryOpen((prev) => !prev)}
            aria-expanded={categoryOpen}
            aria-haspopup="listbox"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
              category.length > 0
                ? 'bg-violet-50 border-violet-300 text-violet-800 shadow-sm'
                : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-sm'
            }`}
          >
            <span className="text-stone-500 font-normal">Category:</span>
            <span className="font-semibold text-stone-800">
              {category.length === 0 ? 'All Categories' : `${category.length} Selected`}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                categoryOpen ? 'rotate-180 text-violet-700' : 'text-stone-400'
              }`}
            />
          </button>

          {categoryOpen && (
            <div
              role="listbox"
              aria-label="Filter by Category"
              className="absolute left-0 mt-2 w-64 rounded-xl bg-white border border-stone-200 p-2.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-stone-100">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Select Categories
                </span>
                {category.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      category.forEach((c) => onToggleCategory(c));
                    }}
                    className="text-[11px] text-violet-600 hover:text-violet-800 font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto py-1">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = category.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => onToggleCategory(cat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-violet-50 text-violet-900 font-medium'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isSelected && <span className="text-[10px] leading-none font-bold">✓</span>}
                        </div>
                        <span>{cat}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-1 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-mono">
                  {category.length} of {CATEGORY_OPTIONS.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => setCategoryOpen(false)}
                  className="px-3 py-1 bg-stone-900 text-white hover:bg-stone-800 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
