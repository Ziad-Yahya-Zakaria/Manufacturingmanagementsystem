/**
 * Production Calculation Utilities
 */

import { FreshProductionItem, Product } from '@/services/types';

/**
 * Calculate total quantity from hourly production (Fresh Mode)
 */
export function calculateFreshTotalQuantity(item: FreshProductionItem): number {
  return (
    (item.hour_1 || 0) +
    (item.hour_2 || 0) +
    (item.hour_3 || 0) +
    (item.hour_4 || 0) +
    (item.hour_5 || 0) +
    (item.hour_6 || 0) +
    (item.hour_7 || 0) +
    (item.hour_8 || 0) +
    (item.hour_9 || 0) +
    (item.hour_10 || 0) +
    (item.hour_11 || 0) +
    (item.hour_12 || 0)
  );
}

/**
 * Calculate total weight from quantity and product unit weight
 */
export function calculateTotalWeight(quantity: number, unitWeight: number): number {
  return quantity * unitWeight;
}

/**
 * Format weight with 2 decimal places
 */
export function formatWeight(weight: number): string {
  return weight.toFixed(2);
}

/**
 * Format date to locale string
 */
export function formatDate(date: string | Date, locale: string = 'ar-SA'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date for ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get shift display name
 */
export function getShiftName(shift: 'morning' | 'evening', locale: 'en' | 'ar' = 'ar'): string {
  const names = {
    morning: { en: 'Morning', ar: 'صباحي' },
    evening: { en: 'Evening', ar: 'مسائي' },
  };
  return names[shift][locale];
}

/**
 * Get production type display name
 */
export function getProductionTypeName(
  type: 'FRESH' | 'FROZEN',
  locale: 'en' | 'ar' = 'ar'
): string {
  const names = {
    FRESH: { en: 'Fresh Production', ar: 'تقرير الفريش' },
    FROZEN: { en: 'Frozen Production', ar: 'تقرير المجمد' },
  };
  return names[type][locale];
}
