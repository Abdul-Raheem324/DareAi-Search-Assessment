'use client';

import React, { useState } from 'react';
import { Database, Share2, Check, Sliders, Zap, Activity } from 'lucide-react';

interface HeaderProps {
  totalRecords: number;
  filteredRecords?: number;
  isFetching: boolean;
  chaosOpen: boolean;
  onToggleChaos: () => void;
  requestCount: number;
  getShareableUrl?: () => string;
}

export function Header({
  totalRecords,
  filteredRecords,
  isFetching,
  chaosOpen,
  onToggleChaos,
  requestCount,
  getShareableUrl,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = getShareableUrl ? getShareableUrl() : window.location.href;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f6]/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-violet-400 text-white shadow-lg shadow-violet-500/25">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 flex items-center gap-2">
              <span>NEXUS</span>
              <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-violet-100 text-violet-700 border border-violet-200">
                DATA EXPLORER
              </span>
            </h1>
            {isFetching && (
              <span className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                <Activity className="h-3 w-3 animate-spin" />
                <span>Fetching</span>
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 hidden sm:block">
            {totalRecords ? `${totalRecords.toLocaleString()} Indexed Records` : 'Indexing records...'}
            {typeof filteredRecords === 'number' && filteredRecords !== totalRecords && (
              <span className="text-violet-600"> • {filteredRecords.toLocaleString()} matching</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onToggleChaos}
          aria-expanded={chaosOpen}
          aria-label="Toggle Chaos and Network Simulator Panel"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all border cursor-pointer ${
            chaosOpen
              ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-200'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-sm'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span className="hidden sm:inline">Network & Chaos Lab</span>
          <span className="sm:hidden">Lab</span>
          {requestCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-200">
              {requestCount}
            </span>
          )}
        </button>

        <button
          onClick={handleShare}
          aria-label="Copy current view URL to clipboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4 text-stone-400" />
              <span className="hidden sm:inline">Share View</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}

