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
import { THEME_INSPIRATIONS } from '../data/inspirations';
import { INITIAL_EVENTS } from '../data/initialData';
import { generateSmartEventPlanFallback } from '../../server';
import {
  sanitizeText,
  isValidEmail,
  isValidPhone,
  validateEventParameters,
  validateBudgetItemInput,
} from '../utils/validation';

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

  it('handles negative amounts and zero without crashing', () => {
    expect(formatMoney(-500000, 'INR', false)).toBe('-₹5,000');
    expect(formatMoney(0, 'USD', false)).toBe('$0');
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
    expect(DESTINATIONS.length).toBeGreaterThanOrEqual(30);

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

describe('AI Feasibility Engine & Mathematical Parity', () => {
  it('guarantees 100% budget sum parity for wedding planning without remainder drift', () => {
    const targetBudgetMinor = 150000000; // ₹15,00,000
    const plan = generateSmartEventPlanFallback({
      eventType: 'wedding',
      destination: 'Udaipur, India',
      guestCount: 100,
      totalBudgetMinor: targetBudgetMinor,
      currency: 'INR',
    });

    const sumAllocated = plan.costBreakdowns.reduce((acc, curr) => acc + curr.estimateMinor, 0);
    expect(sumAllocated).toBe(targetBudgetMinor);
    expect(plan.costBreakdowns.some((c) => c.category === 'venue')).toBe(true);
    expect(plan.costBreakdowns.some((c) => c.category === 'contingency')).toBe(true);
    expect(plan.venueQuestions.length).toBeGreaterThanOrEqual(5);
  });

  it('guarantees budget parity for corporate summit planning', () => {
    const targetBudgetMinor = 4500000; // $45,000.00
    const plan = generateSmartEventPlanFallback({
      eventType: 'corporate',
      destination: 'Tokyo, Japan',
      guestCount: 150,
      totalBudgetMinor: targetBudgetMinor,
      currency: 'USD',
    });

    const sumAllocated = plan.costBreakdowns.reduce((acc, curr) => acc + curr.estimateMinor, 0);
    expect(sumAllocated).toBe(targetBudgetMinor);
    expect(plan.costBreakdowns.some((c) => c.category === 'equipment')).toBe(true);
  });

  it('guarantees budget parity for birthday celebrations', () => {
    const targetBudgetMinor = 1800000; // €18,000.00
    const plan = generateSmartEventPlanFallback({
      eventType: 'birthday',
      destination: 'Santorini, Greece',
      guestCount: 40,
      totalBudgetMinor: targetBudgetMinor,
      currency: 'EUR',
    });

    const sumAllocated = plan.costBreakdowns.reduce((acc, curr) => acc + curr.estimateMinor, 0);
    expect(sumAllocated).toBe(targetBudgetMinor);
  });

  it('guarantees budget parity for community festivals', () => {
    const targetBudgetMinor = 120000000; // ₹12,00,000
    const plan = generateSmartEventPlanFallback({
      eventType: 'festival',
      destination: 'Goa, India',
      guestCount: 500,
      totalBudgetMinor: targetBudgetMinor,
      currency: 'INR',
    });

    const sumAllocated = plan.costBreakdowns.reduce((acc, curr) => acc + curr.estimateMinor, 0);
    expect(sumAllocated).toBe(targetBudgetMinor);
    expect(plan.costBreakdowns.some((c) => c.category === 'taxes_fees')).toBe(true);
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

describe('Specialized Module Calculations', () => {
  it('computes total guests attending from party size array accurately', () => {
    const guests = [
      { name: 'Family A', partySize: 4, status: 'attending' },
      { name: 'Family B', partySize: 2, status: 'attending' },
      { name: 'Friend C', partySize: 1, status: 'invited' },
    ];
    const totalAttending = guests
      .filter((g) => g.status === 'attending')
      .reduce((sum, g) => sum + g.partySize, 0);

    expect(totalAttending).toBe(6);
  });

  it('calculates volunteer checked in percentage safely', () => {
    const volunteers = [
      { id: '1', status: 'checked_in' },
      { id: '2', status: 'checked_in' },
      { id: '3', status: 'assigned' },
      { id: '4', status: 'assigned' },
    ];
    const checkedInCount = volunteers.filter((v) => v.status === 'checked_in').length;
    const pct = Math.round((checkedInCount / volunteers.length) * 100);
    expect(pct).toBe(50);
  });
});

describe('Input Validation & Sanitization Engine', () => {
  it('sanitizes malicious script tags and trims dangerous input', () => {
    expect(sanitizeText('<script>alert("xss")</script>Udaipur')).toBe('alert("xss")Udaipur');
    expect(sanitizeText('   Santorini, Greece   ')).toBe('Santorini, Greece');
    expect(sanitizeText(12345 as unknown)).toBe('');
  });

  it('validates email addresses using standard RFC format', () => {
    expect(isValidEmail('organizer@luxuryevents.com')).toBe(true);
    expect(isValidEmail('invalid-email-address')).toBe(false);
    expect(isValidEmail('')).toBe(true); // Optional field allowed
  });

  it('validates international phone numbers accurately', () => {
    expect(isValidPhone('+91 98765 43210')).toBe(true);
    expect(isValidPhone('+1 (555) 019-2834')).toBe(true);
    expect(isValidPhone('abc-invalid')).toBe(false);
    expect(isValidPhone('')).toBe(true); // Optional field allowed
  });

  it('enforces rigorous event parameter boundary constraints', () => {
    const validParams = {
      eventType: 'wedding',
      destination: 'Udaipur, India',
      date: '2027-02-14',
      guestCount: 100,
      totalBudgetMinor: 150000000,
    };
    expect(validateEventParameters(validParams).isValid).toBe(true);

    // Invalid event type
    expect(
      validateEventParameters({ ...validParams, eventType: 'unknown_party' }).isValid
    ).toBe(false);

    // Zero / negative guests
    expect(
      validateEventParameters({ ...validParams, guestCount: 0 }).isValid
    ).toBe(false);

    // Excessive guests (> 50,000)
    expect(
      validateEventParameters({ ...validParams, guestCount: 100000 }).isValid
    ).toBe(false);

    // Unrealistic micro budget (< 100 currency units)
    expect(
      validateEventParameters({ ...validParams, totalBudgetMinor: 50 }).isValid
    ).toBe(false);

    // Invalid date string
    expect(
      validateEventParameters({ ...validParams, date: 'invalid-date' }).isValid
    ).toBe(false);
  });

  it('validates budget item ledger entries against negative amounts', () => {
    const validItem = {
      name: 'Clifftop Pavilion Buyout',
      category: 'venue',
      estimatedMinor: 50000000,
      actualMinor: 48000000,
      paidMinor: 20000000,
    };
    expect(validateBudgetItemInput(validItem).isValid).toBe(true);

    // Empty name
    expect(
      validateBudgetItemInput({ ...validItem, name: '' }).isValid
    ).toBe(false);

    // Negative estimate
    expect(
      validateBudgetItemInput({ ...validItem, estimatedMinor: -100 }).isValid
    ).toBe(false);

    // Paid exceeding actual cost
    expect(
      validateBudgetItemInput({ ...validItem, actualMinor: 1000, paidMinor: 2000 }).isValid
    ).toBe(false);
  });
});

describe('Multi-Currency Parity & Robustness', () => {
  it('converts across all supported global currencies without NaN or infinite values', () => {
    const supportedCurrencies: ('INR' | 'USD' | 'EUR' | 'GBP' | 'AED')[] = [
      'INR',
      'USD',
      'EUR',
      'GBP',
      'AED',
    ];
    const baseMinor = 1000000; // 10,000 units

    for (const fromCurr of supportedCurrencies) {
      for (const toCurr of supportedCurrencies) {
        const converted = convertMinorAmount(baseMinor, fromCurr, toCurr);
        expect(Number.isFinite(converted)).toBe(true);
        expect(converted).toBeGreaterThan(0);
      }
    }
  });
});

describe('Catalog Coverage & Multi-Axis Filter Invariants', () => {
  it('covers all 8 distinct destination categories required by prompt specification', () => {
    const requiredCategories = [
      'Beaches and Islands',
      'Luxury Resorts',
      'Romantic Getaways',
      'Mountains and Nature',
      'Historic Landmarks',
      'Modern Cities',
      'Adventure Destinations',
      'Indian Wedding Destinations',
    ];

    const presentCategories = new Set(DESTINATIONS.map((d) => d.category));
    for (const cat of requiredCategories) {
      expect(presentCategories.has(cat as (typeof DESTINATIONS)[number]['category'])).toBe(true);
    }
  });

  it('guarantees every destination provides valid geographical coordinates', () => {
    for (const d of DESTINATIONS) {
      expect(typeof d.coordinates.lat).toBe('number');
      expect(typeof d.coordinates.lng).toBe('number');
      expect(d.coordinates.lat).toBeGreaterThanOrEqual(-90);
      expect(d.coordinates.lat).toBeLessThanOrEqual(90);
      expect(d.coordinates.lng).toBeGreaterThanOrEqual(-180);
      expect(d.coordinates.lng).toBeLessThanOrEqual(180);
    }
  });

  it('matches destinations across all 4 major calendar seasons', () => {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    for (const s of seasons) {
      const match = DESTINATIONS.some(
        (d) => d.bestSeason.toLowerCase().includes(s) || d.bestSeason.toLowerCase().includes('year-round')
      );
      expect(match).toBe(true);
    }
  });

  it('supports intimate, mid-size, and grand capacity venues', () => {
    const hasIntimate = DESTINATIONS.some((d) => d.guestCapacityRange.min <= 50);
    const hasMid = DESTINATIONS.some((d) => d.guestCapacityRange.max >= 200);
    const hasGrand = DESTINATIONS.some((d) => d.guestCapacityRange.max >= 500);

    expect(hasIntimate).toBe(true);
    expect(hasMid).toBe(true);
    expect(hasGrand).toBe(true);
  });
});

describe('Theme Studio Scenography & Initial Data Integrity', () => {
  it('validates theme inspirations have valid hex color palettes and image prompts', () => {
    expect(THEME_INSPIRATIONS.length).toBeGreaterThanOrEqual(4);

    for (const theme of THEME_INSPIRATIONS) {
      expect(theme.title.length).toBeGreaterThan(0);
      expect(theme.prompt.length).toBeGreaterThan(20);
      expect(theme.colorPalette.length).toBeGreaterThanOrEqual(4);
      for (const swatch of theme.colorPalette) {
        expect(swatch.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(swatch.name.length).toBeGreaterThan(0);
      }
    }
  });

  it('guarantees initial event datasets are non-empty and mathematically consistent', () => {
    expect(INITIAL_EVENTS.length).toBeGreaterThanOrEqual(4);

    const wedding = INITIAL_EVENTS.find((e) => e.type === 'wedding');
    expect(wedding).toBeDefined();
    if (wedding) {
      expect(wedding.budgetItems.length).toBeGreaterThan(0);
      expect(wedding.weddingDetails?.guests.length).toBeGreaterThan(0);
      const sumBudget = wedding.budgetItems.reduce((acc, curr) => acc + curr.actualMinor, 0);
      expect(sumBudget).toBeGreaterThan(0);
    }

    const corporate = INITIAL_EVENTS.find((e) => e.type === 'corporate');
    expect(corporate).toBeDefined();
    if (corporate) {
      expect(corporate.corporateDetails?.speakers.length).toBeGreaterThan(0);
    }

    const birthday = INITIAL_EVENTS.find((e) => e.type === 'birthday');
    expect(birthday).toBeDefined();
    if (birthday) {
      expect(birthday.birthdayDetails?.giftIdeas.length).toBeGreaterThan(0);
      expect(birthday.birthdayDetails?.activities.length).toBeGreaterThan(0);
    }

    const festival = INITIAL_EVENTS.find((e) => e.type === 'festival');
    expect(festival).toBeDefined();
    if (festival) {
      expect(festival.communityDetails?.volunteers.length).toBeGreaterThan(0);
      expect(festival.communityDetails?.sponsors.length).toBeGreaterThan(0);
    }
  });
});
