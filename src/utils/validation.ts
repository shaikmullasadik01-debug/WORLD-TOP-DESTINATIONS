/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventType, ExpenseCategory, TaskPriority, VendorStatus } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Sanitize plain text input: strip HTML tags and dangerous characters, trim, and cap length.
 */
export function sanitizeText(input: unknown, maxLength = 250): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip full HTML/script tags
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate email format with standard RFC regex
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim().length === 0) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number format (allows all standard international formats)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || phone.trim().length === 0) return true; // Optional field
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?([-\s./()0-9]){6,20}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Validate event planning parameters
 */
export function validateEventParameters(params: {
  title?: string;
  eventType: string;
  destination: string;
  date: string;
  guestCount: number;
  totalBudgetMinor: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const validEventTypes: EventType[] = [
    'wedding',
    'birthday',
    'anniversary',
    'engagement',
    'corporate',
    'festival',
    'community',
  ];

  if (!validEventTypes.includes(params.eventType.toLowerCase() as EventType)) {
    errors.eventType = 'Please select a supported event type.';
  }

  if (!params.destination || params.destination.trim().length < 2) {
    errors.destination = 'Destination name is required.';
  }

  if (!params.date || isNaN(Date.parse(params.date))) {
    errors.date = 'A valid future event date is required.';
  }

  if (isNaN(params.guestCount) || params.guestCount < 1 || params.guestCount > 50000) {
    errors.guestCount = 'Guest count must be between 1 and 50,000.';
  }

  if (
    isNaN(params.totalBudgetMinor) ||
    params.totalBudgetMinor < 10000 || // < 100 currency units
    params.totalBudgetMinor > 500000000000 // > 5 Billion
  ) {
    errors.totalBudgetMinor = 'Budget amount must be within realistic planning limits.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate single budget expense entry
 */
export function validateBudgetItemInput(params: {
  name: string;
  category: string;
  estimatedMinor: number;
  actualMinor: number;
  paidMinor: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!params.name || params.name.trim().length < 2) {
    errors.name = 'Item name must be at least 2 characters long.';
  }

  if (params.estimatedMinor < 0 || isNaN(params.estimatedMinor)) {
    errors.estimatedMinor = 'Estimated amount cannot be negative.';
  }

  if (params.actualMinor < 0 || isNaN(params.actualMinor)) {
    errors.actualMinor = 'Actual amount cannot be negative.';
  }

  if (params.paidMinor < 0 || isNaN(params.paidMinor)) {
    errors.paidMinor = 'Paid amount cannot be negative.';
  }

  if (params.paidMinor > params.actualMinor && params.actualMinor > 0) {
    errors.paidMinor = 'Paid amount cannot exceed total actual cost.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
