'use client';

import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@/lib/types';
import { STATUS_BADGES, PRIORITY_BADGES } from '@/lib/badgeConfig';
import { fetchOrderById } from '@/lib/apiClient';
import {
  X,
  Copy,
  Check,
  Building2,
  Mail,
  Phone,
  Truck,
  CreditCard,
  Calendar,
  ShieldCheck,
  Package,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface DetailDrawerProps {
  orderId: string | null;
  onClose: () => void;
  cachedOrder?: Order | null;
}

export function DetailDrawer({ orderId, onClose, cachedOrder }: DetailDrawerProps) {
  const [order, setOrder] = useState<Order | null>(cachedOrder || null);
  const [loading, setLoading] = useState<boolean>(!cachedOrder && !!orderId);
  const [error, setError] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const statusConfig = order ? STATUS_BADGES[order.status] : null;
  const priorityConfig = order ? PRIORITY_BADGES[order.priority] : null;

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }

    if (cachedOrder && (cachedOrder.id === orderId || cachedOrder.orderNumber === orderId)) {
      setOrder(cachedOrder);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    fetchOrderById(orderId, controller.signal)
      .then((data) => {
        if (!isCancelled) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled && err.name !== 'AbortError') {
          setError(err.message || 'Failed to load order details');
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [orderId, cachedOrder]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (orderId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orderId, onClose]);

  if (!orderId) return null;

  const handleCopyTracking = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleCopyId = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="relative w-full max-w-2xl bg-white border-l border-stone-200 shadow-2xl z-10 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 border border-violet-200 text-violet-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="drawer-title" className="text-base font-bold text-stone-900 font-mono">
                  {order ? order.orderNumber : 'Loading Order...'}
                </h2>
                {order && statusConfig && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                    <span>{statusConfig.label}</span>
                  </span>
                )}
                {order && (
                  <button
                    onClick={handleCopyId}
                    aria-label="Copy order number"
                    className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors cursor-pointer"
                  >
                    {copiedId ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-stone-400">Deep-linked Record Detail</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close detail drawer (Esc)"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-stone-400">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <span className="text-sm">Fetching order record...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {order && !loading && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] text-stone-400 block mb-1.5 font-medium">Status</span>
                  {statusConfig && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                      <span>{statusConfig.label}</span>
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] text-stone-400 block mb-1.5 font-medium">Total Value</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-stone-900">
                    ${order.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] text-stone-400 block mb-1.5 font-medium">Priority</span>
                  {priorityConfig && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border tracking-wider uppercase ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}
                    >
                      {priorityConfig.label}
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] text-stone-400 block mb-1.5 font-medium">Region</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                    {order.region}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-violet-500" />
                  <span>Customer & Account Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-stone-400 block">Organization</span>
                    <strong className="text-stone-800 font-medium">{order.customer.company}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-stone-400 block">Contact Person</span>
                    <span className="text-stone-700">{order.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-stone-400" />
                    <span className="text-stone-600 text-xs truncate">{order.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-stone-400" />
                    <span className="text-stone-600 text-xs">{order.customer.phone}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white">
                <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-violet-500" />
                    <span>Line Items Breakdown ({order.items.length})</span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                    <span>Category:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                      {order.category}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-stone-100 text-xs">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-stone-800">{item.name}</div>
                        <div className="font-mono text-[11px] text-stone-400">SKU: {item.sku}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-semibold text-stone-700">
                          ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {item.qty} × ${item.unitPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-teal-500" />
                    <span>Logistics & Fulfillment</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-stone-400 block">Carrier</span>
                      <span className="text-stone-700 font-medium">{order.carrier}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Tracking Number</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="px-2 py-0.5 rounded bg-stone-100 text-violet-700 font-mono text-[11px] border border-stone-200">
                          {order.trackingNumber}
                        </code>
                        <button
                          onClick={handleCopyTracking}
                          aria-label="Copy tracking code"
                          className="p-1 rounded text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                        >
                          {copiedTracking ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-violet-500" />
                    <span>Settlement & Dates</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-stone-400 block">Payment Method</span>
                      <span className="text-stone-700 font-medium">{order.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Created Timestamp</span>
                      <span className="text-stone-500 font-mono">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Audit Trail & Ledger Events</span>
                </h4>
                <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {order.auditTrail.map((log) => (
                    <div key={log.id} className="relative pl-6 text-xs">
                      <div className="absolute left-1 top-1.5 h-2 w-2 rounded-full bg-violet-500 ring-4 ring-white" />
                      <div className="font-semibold text-stone-700">{log.action}</div>
                      <div className="text-stone-400 text-[11px]">
                        {log.actor} • {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      {log.note && (
                        <div className="text-stone-400 text-[11px] italic mt-0.5">{log.note}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-400">Press ESC or click backdrop to close</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}
