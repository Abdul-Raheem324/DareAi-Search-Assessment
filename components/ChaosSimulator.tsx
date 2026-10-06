'use client';

import React, { useEffect } from 'react';
import { RequestLogEntry } from '@/lib/types';
import {
  Zap,
  Activity,
  AlertOctagon,
  Clock,
  Radio,
  Trash2,
  PlayCircle,
  Wifi,
  Ban,
  CheckCircle2,
  X,
  Info
} from 'lucide-react';

interface ChaosSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  latency: number | undefined;
  onLatencyChange: (latency: number | undefined) => void;
  failRate: number;
  onFailRateChange: (rate: number) => void;
  onTriggerRaceDemo: () => void;
  onForceFailNext: () => void;
  forceFailActive: boolean;
  requestLogs: RequestLogEntry[];
  onClearLogs: () => void;
  raceDemoMessage?: string | null;
}

export function ChaosSimulator({
  isOpen,
  onClose,
  latency,
  onLatencyChange,
  failRate,
  onFailRateChange,
  onTriggerRaceDemo,
  onForceFailNext,
  forceFailActive,
  requestLogs,
  onClearLogs,
  raceDemoMessage,
}: ChaosSimulatorProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const okCount = requestLogs.filter((l) => l.status === 'success').length;
  const cancelledCount = requestLogs.filter((l) => l.status === 'cancelled').length;
  const failedCount = requestLogs.filter((l) => l.status === 'error').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chaos-lab-title"
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
    >
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-white shadow-2xl z-10 flex flex-col h-full border-l border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-start justify-between gap-4 bg-stone-50/80">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 border border-violet-200 shrink-0 mt-0.5">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <h2 id="chaos-lab-title" className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>Network Chaos & Concurrency Lab</span>
              </h2>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Test slow network conditions (200ms–3s), 1-in-10 simulated failures, and AbortController race cancellation live.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Chaos Simulator"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#faf9f6] border border-stone-200 text-stone-700 font-mono shadow-2xs">
              <Clock className="h-3.5 w-3.5 text-violet-600" />
              <span>
                Mode:{' '}
                <strong className="text-stone-900">
                  {latency === undefined ? 'Default (200ms–3s)' : `${latency}ms fixed`}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#faf9f6] border border-stone-200 text-stone-700 font-mono shadow-2xs">
              <AlertOctagon className="h-3.5 w-3.5 text-rose-500" />
              <span>
                Failure Rate:{' '}
                <strong className="text-stone-900">{(failRate * 100).toFixed(0)}%</strong>
              </span>
            </div>
          </div>

          <div className="bg-[#faf9f6] p-4 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-violet-600" />
                <span>Simulated Latency:</span>
              </span>
              <span className="font-mono text-violet-700 font-semibold text-xs">
                {latency === undefined ? 'Random 200–3000ms (Spec Default)' : `${latency}ms fixed`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => onLatencyChange(undefined)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                  latency === undefined
                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs font-semibold'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                Default (200ms-3s)
              </button>
              <button
                onClick={() => onLatencyChange(100)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                  latency === 100
                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs font-semibold'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                100ms
              </button>
              <button
                onClick={() => onLatencyChange(1500)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                  latency === 1500
                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs font-semibold'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                1.5s
              </button>
              <button
                onClick={() => onLatencyChange(3000)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                  latency === 3000
                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs font-semibold'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                3.0s
              </button>
            </div>
          </div>

          <div className="bg-[#faf9f6] p-4 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <AlertOctagon className="h-3.5 w-3.5 text-rose-500" />
                <span>Simulated Failure Rate:</span>
              </span>
              <span className="font-mono text-rose-600 font-semibold text-xs">{(failRate * 100).toFixed(0)}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onFailRateChange(0.1)}
                className={`py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                  failRate === 0.1
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-semibold'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                10% (1-in-10 Default)
              </button>
              <button
                onClick={() => onFailRateChange(0)}
                className={`py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                  failRate === 0
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                0% (Disabled)
              </button>
              <button
                onClick={() => onFailRateChange(0.3)}
                className={`py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                  failRate === 0.3
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-semibold'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                30% (High)
              </button>
            </div>
          </div>

          <div className="bg-[#faf9f6] p-4 rounded-xl border border-stone-200 space-y-3">
            <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Interactive Stress Tests:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={onForceFailNext}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                  forceFailActive
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse shadow-sm'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
                }`}
              >
                <AlertOctagon className="h-3.5 w-3.5" />
                <span>{forceFailActive ? 'Next Call Will 500!' : 'Force 500 Error'}</span>
              </button>

              <button
                onClick={onTriggerRaceDemo}
                className="py-2 px-3 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-sm shadow-violet-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                <span>Test Race Cancellation</span>
              </button>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              <strong>Test Race Cancellation:</strong> Dispatches a slow query (2.8s) followed by a fast query (200ms). The AbortController cancels the slow request, ensuring the stale response is ignored and only the newer fast response updates the table.
            </p>

            {raceDemoMessage && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-violet-50 border border-violet-200 text-violet-900 text-xs animate-in fade-in duration-200">
                <Info className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{raceDemoMessage}</span>
              </div>
            )}
          </div>

          <div className="bg-[#faf9f6] rounded-xl p-4 border border-stone-200">
            <div className="flex items-center justify-between text-xs mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-violet-600" />
                <span className="font-semibold text-stone-900 text-xs">Live Request Stream (Telemetry)</span>
                <span className="text-stone-500 font-mono text-[11px]">
                  ({okCount} ok, {cancelledCount} cancelled, {failedCount} failed)
                </span>
              </div>
              {requestLogs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
              {requestLogs.length === 0 ? (
                <div className="text-stone-400 py-4 text-center italic text-xs">
                  No network requests dispatched yet. Type in search or toggle filters to view live telemetry.
                </div>
              ) : (
                requestLogs.slice(0, 15).map((log) => (
                  <div
                    key={log.id}
                    className={`flex flex-col gap-1 p-2.5 rounded-lg border bg-white shadow-2xs transition-colors ${
                      log.status === 'success'
                        ? 'border-emerald-200 text-stone-800'
                        : log.status === 'cancelled'
                        ? 'border-amber-200 text-stone-800 bg-amber-50/20'
                        : log.status === 'error'
                        ? 'border-rose-200 text-stone-800 bg-rose-50/20'
                        : 'border-violet-200 text-stone-800 animate-pulse'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                      <div className="flex items-center gap-2 truncate">
                        {log.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                        {log.status === 'cancelled' && <Ban className="h-3.5 w-3.5 shrink-0 text-amber-600" />}
                        {log.status === 'error' && <AlertOctagon className="h-3.5 w-3.5 shrink-0 text-rose-600" />}
                        {log.status === 'pending' && <Activity className="h-3.5 w-3.5 shrink-0 text-violet-600 animate-spin" />}
                        <span className="truncate text-stone-800 font-semibold">{log.query}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {typeof log.latencyMs === 'number' && (
                          <span className="text-stone-500 font-mono text-[10px]">{log.latencyMs}ms</span>
                        )}
                        <span
                          className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border uppercase tracking-wider ${
                            log.status === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : log.status === 'cancelled'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : log.status === 'error'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-violet-50 text-violet-700 border-violet-200'
                          }`}
                        >
                          {log.status === 'success' ? 'OK' : log.status === 'cancelled' ? 'CANCELLED' : log.status === 'error' ? 'FAILED' : 'PENDING'}
                        </span>
                      </div>
                    </div>

                    {log.errorMessage && (
                      <div className="text-[10px] text-stone-500 pl-5.5 flex items-center gap-1 font-sans">
                        <span className="font-medium text-amber-800">{log.errorMessage}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
