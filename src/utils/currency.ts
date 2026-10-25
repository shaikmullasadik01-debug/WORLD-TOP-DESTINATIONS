/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Currency } from '../types';

// Minor units per major currency unit (100 paise per Rupee, 100 cents per Dollar/Euro/Pound/AED)
export const MINOR_UNIT_SCALE = 100;

// Currency symbols
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
};

// Base exchange rates relative to INR (1 major unit of Foreign Currency = X INR)
export const INR_EXCHANGE_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 86.5,
  EUR: 93.2,
  GBP: 111.4,
  AED: 23.55,
};

/**
 * Convert an amount in minor units from one currency to another using safe integer rounding
 */
export function convertMinorAmount(
  amountMinor: number,
  from: Currency,
  to: Currency
): number {
  if (from === to || amountMinor === 0) return amountMinor;

  // Convert source minor to INR minor
  const inrMinor = from === 'INR'
    ? amountMinor
    : Math.round(amountMinor * INR_EXCHANGE_RATES[from]);

  // Convert INR minor to target minor
  if (to === 'INR') return inrMinor;
  return Math.round(inrMinor / INR_EXCHANGE_RATES[to]);
}

/**
 * Format minor amount safely as currency string
 * Supports Indian lakh/crore grouping for INR, and standard thousand grouping for others.
 */
export function formatMoney(
  amountMinor: number,
  currency: Currency = 'INR',
  compact: boolean = false
): string {
  const majorAmount = amountMinor / MINOR_UNIT_SCALE;
  const isNegative = majorAmount < 0;
  const absAmount = Math.abs(majorAmount);
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';

  if (compact) {
    if (currency === 'INR') {
      if (absAmount >= 10000000) {
        const crores = parseFloat((absAmount / 10000000).toFixed(2));
        return `${isNegative ? '-' : ''}${symbol}${crores} Cr`;
      }
      if (absAmount >= 100000) {
        const lakhs = parseFloat((absAmount / 100000).toFixed(2));
        return `${isNegative ? '-' : ''}${symbol}${lakhs} L`;
      }
      if (absAmount >= 1000) {
        const k = parseFloat((absAmount / 1000).toFixed(1));
        return `${isNegative ? '-' : ''}${symbol}${k} K`;
      }
    } else {
      if (absAmount >= 1000000) {
        const m = parseFloat((absAmount / 1000000).toFixed(2));
        return `${isNegative ? '-' : ''}${symbol}${m}M`;
      }
      if (absAmount >= 1000) {
        const k = parseFloat((absAmount / 1000).toFixed(1));
        return `${isNegative ? '-' : ''}${symbol}${k}K`;
      }
    }
  }

  // Exact localized number formatting
  let formattedNumber: string;
  if (currency === 'INR') {
    formattedNumber = absAmount.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  } else {
    formattedNumber = absAmount.toLocaleString('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }

  return `${isNegative ? '-' : ''}${symbol}${formattedNumber}`;
}

/**
 * Decimal-safe major to minor integer conversion
 */
export function toMinorUnits(majorAmount: number): number {
  if (isNaN(majorAmount)) return 0;
  return Math.round(majorAmount * MINOR_UNIT_SCALE);
}

/**
 * Convert minor integer to major floating/integer value for inputs
 */
export function toMajorUnits(minorAmount: number): number {
  if (isNaN(minorAmount)) return 0;
  return Math.round(minorAmount) / MINOR_UNIT_SCALE;
}

/**
 * Calculate sum of minor units array preventing overflow and float issues
 */
export function sumMinor(amountsMinor: number[]): number {
  return amountsMinor.reduce((acc, curr) => acc + (isNaN(curr) ? 0 : Math.round(curr)), 0);
}

/**
 * Calculate percentage consumed safely
 */
export function calculateBudgetPercentage(actualMinor: number, totalMinor: number): number {
  if (totalMinor <= 0) return 0;
  const pct = Math.round((actualMinor / totalMinor) * 100);
  return Math.max(0, pct);
}
