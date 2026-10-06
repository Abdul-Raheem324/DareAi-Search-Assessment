import { OrderStatus, OrderPriority } from './types';

export interface BadgeStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot?: string;
}

export const STATUS_BADGES: Record<OrderStatus, BadgeStyle> = {
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
  processing: {
    label: 'Processing',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  in_transit: {
    label: 'In Transit',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
    border: 'border-violet-200',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
    border: 'border-sky-200',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    border: 'border-rose-200',
  },
  refunded: {
    label: 'Refunded',
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    dot: 'bg-stone-400',
    border: 'border-stone-200',
  },
};

export const PRIORITY_BADGES: Record<OrderPriority, BadgeStyle> = {
  critical: {
    label: 'CRITICAL',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  high: {
    label: 'HIGH',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  medium: {
    label: 'MED',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
  low: {
    label: 'LOW',
    bg: 'bg-stone-100',
    text: 'text-stone-500',
    border: 'border-stone-200',
  },
};
