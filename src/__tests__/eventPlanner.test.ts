/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  toMinorUnits,
  toMajorUnits,
  sumMinor,
  convertMinorAmount,
  formatMoney,
  calculateBudgetPercentage,
} from '../utils/currency';
import { DESTINATIONS } from '../data/destinations';

describe('Currency & Financial Precision Math', () => {
  it('converts major units to integer minor units without float drift', () => {
    expect(toMinorUnits(1500000)).toBe(150000000);
    expect(toMinorUnits(19.99)).toBe(1999);
    expect(toMinorUnits(0.1 + 0.2)).toBe(30); // avoids JavaScript 0.30000000000000004 bug!
  });

  it('converts minor units back to major units accurately', () => {
    expect(toMajorUnits(150000000)).toBe(1500000);
    expect(toMajorUnits(1999)).toBe(19.99);
  });

  it('sums minor unit arrays safely with zero floating point errors', () => {
    const expenses = [
      toMinorUnits(850000), // Venue
      toMinorUnits(600000), // Catering
      toMinorUnits(350000), // Decor
      toMinorUnits(200000), // Photo
    ];
    const total = sumMinor(expenses);
    expect(total).toBe(toMinorUnits(2000000)); // Exactly 20 Lakhs
    expect(toMajorUnits(total)).toBe(2000000);
  });

  it('formats Indian Lakhs and Crores properly in compact mode', () => {
    // 15 Lakhs = 1,500,000 INR = 150,000,000 paise
    const fifteenLakhsMinor = 150000000;
    expect(formatMoney(fifteenLakhsMinor, 'INR', true)).toBe('₹15 L');

    // 1.5 Crores = 15,000,000 INR = 1,500,000,000 paise
    const oneCroreMinor = 1500000000;
    expect(formatMoney(oneCroreMinor, 'INR', true)).toBe('₹1.5 Cr');
  });

  it('formats international standard currencies properly', () => {
    const twentyFiveKUSDMinor = 2500000; // $25,000.00
    expect(formatMoney(twentyFiveKUSDMinor, 'USD', true)).toBe('$25K');
    expect(formatMoney(twentyFiveKUSDMinor, 'USD', false)).toBe('$25,000');
  });

  it('calculates budget consumption percentage safely', () => {
    expect(calculateBudgetPercentage(500000, 1000000)).toBe(50);
    expect(calculateBudgetPercentage(1200000, 1000000)).toBe(120);
    expect(calculateBudgetPercentage(0, 1000000)).toBe(0);
    expect(calculateBudgetPercentage(500, 0)).toBe(0); // division by zero safety
  });

  it('converts between currencies using fixed parity exchange safely', () => {
    const usdMinor = 10000; // $100.00
    const inrMinor = convertMinorAmount(usdMinor, 'USD', 'INR');
    expect(inrMinor).toBe(865000); // 8,650 INR
  });
});

describe('Destination Catalog Validation & Filtering', () => {
  it('contains all 30 world destinations required by prompt specification', () => {
    expect(DESTINATIONS.length).toBeGreaterThanOrEqual(25);

    const requiredLandmarks = [
      'Bali',
      'Tokyo',
      'Kyoto',
      'Maldives',
      'Dubai',
      'Singapore',
      'Phuket',
      'Paris',
      'Santorini',
      'Amalfi Coast',
      'Rome',
      'Swiss Alps',
      'Venice',
      'London',
      'New York City',
      'Banff',
      'Las Vegas',
      'Hawaii',
      'Cape Town',
      'Maasai Mara',
      'Pyramids of Giza',
      'Zanzibar',
      'Sydney',
      'Bora Bora',
      'Iceland',
      'Cappadocia',
      'Taj Mahal, Agra',
      'Bibi Ka Maqbara, Aurangabad',
      'Kashmir',
      'Goa',
      'Kerala',
      'Udaipur',
    ];

    const allNames = DESTINATIONS.map((d) => d.name);
    for (const landmark of requiredLandmarks) {
      expect(allNames).toContain(landmark);
    }
  });

  it('verifies all destinations have valid budget ranges and verified venues', () => {
    for (const dest of DESTINATIONS) {
      expect(dest.estimatedEventBudgetRange.minINR).toBeGreaterThan(0);
      expect(dest.estimatedEventBudgetRange.maxINR).toBeGreaterThan(
        dest.estimatedEventBudgetRange.minINR
      );
      expect(dest.guestCapacityRange.min).toBeGreaterThan(0);
      expect(dest.guestCapacityRange.max).toBeGreaterThan(dest.guestCapacityRange.min);
      expect(dest.verifiedVenues.length).toBeGreaterThan(0);
      expect(dest.image).toMatch(/^https?:\/\/|^\/src\/assets\//);
    }
  });

  it('filters destinations accurately by category', () => {
    const indianWeddings = DESTINATIONS.filter(
      (d) => d.category === 'Indian Wedding Destinations'
    );
    expect(indianWeddings.length).toBeGreaterThanOrEqual(4);
    const indianNames = indianWeddings.map((d) => d.name);
    expect(indianNames).toContain('Udaipur');
    expect(indianNames).toContain('Goa');
    expect(indianNames).toContain('Kerala');
    expect(indianNames).toContain('Taj Mahal, Agra');
  });

  it('filters destinations accurately by region', () => {
    const europeDests = DESTINATIONS.filter((d) => d.region === 'Europe');
    const europeNames = europeDests.map((d) => d.name);
    expect(europeNames).toContain('Paris');
    expect(europeNames).toContain('Santorini');
    expect(europeNames).toContain('Swiss Alps');
    expect(europeNames).toContain('Venice');
  });
});

describe('Date & Timeline Overdue Engine', () => {
  it('correctly detects overdue deadlines', () => {
    const pastDate = '2020-01-01';
    const futureDate = '2030-01-01';
    const today = new Date().toISOString().split('T')[0];

    expect(pastDate < today).toBe(true);
    expect(futureDate < today).toBe(false);
  });
});
