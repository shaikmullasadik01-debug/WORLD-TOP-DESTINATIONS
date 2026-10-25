/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DESTINATIONS } from './src/data/destinations.js';
import { sanitizeText, validateEventParameters } from './src/utils/validation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable gzip/brotli response compression for ultra-efficient payloads
app.use(compression());

// Security Headers Middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:;"
  );
  next();
});

// JSON Body Parser with strict 1mb limit
app.use(express.json({ limit: '1mb' }));

// In-Memory Rate Limiting (Protects AI endpoints against denial-of-service/rapid loop abuse)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 40; // up to 40 AI queries per minute per IP

function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: 'Rate limit exceeded. Please wait a moment before sending more requests.',
    });
    return;
  }

  record.count += 1;
  next();
}

// Initialize GoogleGenAI server-side client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check with cache-busting
app.get('/api/health', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Destinations catalog endpoint with caching header for high performance
app.get('/api/destinations', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.json({
    destinations: DESTINATIONS,
    total: DESTINATIONS.length,
  });
});

// Deterministic intelligent event planner generator for guaranteed offline/demo reliability
export function generateSmartEventPlanFallback(params: {
  eventType: string;
  destination: string;
  date?: string;
  guestCount: number;
  totalBudgetMinor: number;
  currency: string;
  style?: string;
  theme?: string;
  culturalPreferences?: string;
  dietaryPreferences?: string;
  indoorOutdoor?: string;
}) {
  const { eventType, destination, guestCount, totalBudgetMinor } = params;
  const isWedding = eventType.toLowerCase().includes('wedding');
  const isCorporate = eventType.toLowerCase().includes('corporate');
  const isBirthday = eventType.toLowerCase().includes('birthday');
  const isCommunity = eventType.toLowerCase().includes('community') || eventType.toLowerCase().includes('festival');

  // Realistic category percentages
  let splits: { category: string; pct: number; label: string; rationale: string }[];
  if (isWedding) {
    splits = [
      { category: 'venue', pct: 0.34, label: 'Prime Venue Buyout & Grounds', rationale: `Curated buyout in ${destination} with private arrival pavilions and sound curfew clearance.` },
      { category: 'catering', pct: 0.25, label: 'Gourmet Multi-Course Banquet', rationale: `Multi-course banquet for ${guestCount} guests, signature welcome drinks, and culinary live counters.` },
      { category: 'decoration', pct: 0.14, label: 'Floral Scenography & Mandap / Stage', rationale: `Architectural stage design, seasonal fresh florals, and fairy light ambient canopies.` },
      { category: 'photography', pct: 0.09, label: 'Cinematography & Master Album', rationale: `Multi-camera 4K cinematography, drone aerials, and documentary photojournalism.` },
      { category: 'entertainment', pct: 0.06, label: 'Live Musicians, Sound & DJ Rig', rationale: `Traditional welcoming ensemble transitioning to evening dancefloor acoustics.` },
      { category: 'travel', pct: 0.05, label: 'VIP Guest Shuttles & Logistics', rationale: `Airport transfers and local coordinated private ferries or vans.` },
      { category: 'contingency', pct: 0.07, label: 'Contingency & Seasonal Weather Buffer', rationale: `Essential 7% buffer reserved for unexpected weather adaptations or sudden guest surges.` },
    ];
  } else if (isCorporate) {
    splits = [
      { category: 'venue', pct: 0.38, label: 'Convention Hall & Breakout Rooms', rationale: `High-bandwidth ballroom and multi-track presentation suites in ${destination}.` },
      { category: 'catering', pct: 0.26, label: 'Executive Luncheons & Gala Dinner', rationale: `Continuous networking coffee lounges, lunch buffet, and evening cocktail reception.` },
      { category: 'equipment', pct: 0.18, label: 'LED Video Walls & Audio Engineering', rationale: `Keynote stage LED wall, live stream broadcast rigging, and interpretation equipment.` },
      { category: 'travel', pct: 0.08, label: 'Keynote Speaker Hospitality & Shuttles', rationale: `Airport VIP transfers and speaker accommodation blocks.` },
      { category: 'contingency', pct: 0.10, label: 'Technical & Production Reserve', rationale: `Reserved for emergency live stream bandwidth or last-minute rider modifications.` },
    ];
  } else if (isBirthday) {
    splits = [
      { category: 'venue', pct: 0.35, label: 'Private Villa / Party Pavilion', rationale: `Exclusive celebratory venue space in ${destination}.` },
      { category: 'catering', pct: 0.28, label: 'Chef-Curated Feast & Specialty Cake', rationale: `Gourmet dinner, custom multi-tier cake, and artisanal mocktails/cocktails.` },
      { category: 'decoration', pct: 0.16, label: 'Themed Decor & Photo Installations', rationale: `Immersive backdrop, balloon/floral arches, and customized ambient lighting.` },
      { category: 'entertainment', pct: 0.10, label: 'DJ, Live Band & Interactive Activities', rationale: `Sound setup, party host, and games tailored to celebrant preferences.` },
      { category: 'photography', pct: 0.05, label: 'Highlight Reel & Portrait Photography', rationale: `Coverage of arrival moments, toasts, and cake cutting.` },
      { category: 'contingency', pct: 0.06, label: 'Contingency Reserve', rationale: `Covers overtime fees or sudden party additions.` },
    ];
  } else if (isCommunity) {
    splits = [
      { category: 'venue', pct: 0.30, label: 'Public Grounds & Permitted Pavilions', rationale: `Community park or municipal amphitheater permit and security bonding.` },
      { category: 'equipment', pct: 0.25, label: 'Staging, Audio PA & Lighting Truss', rationale: `High-capacity public address audio, stage riser, and crowd control stanchions.` },
      { category: 'catering', pct: 0.20, label: 'Community Food Stations & Hydration', rationale: `Accessible food truck bays, refreshment distribution, and volunteer catering.` },
      { category: 'decoration', pct: 0.10, label: 'Wayfinding, Banners & Festoon Lighting', rationale: `Accessibility signage, entrance arches, and weather-resistant festoon lights.` },
      { category: 'taxes_fees', pct: 0.07, label: 'Municipal Permits, Safety & First Aid', rationale: `Paramedic first-aid post, fire extinguisher certifications, and city permits.` },
      { category: 'contingency', pct: 0.08, label: 'Weather & Emergency Reserve', rationale: `Emergency tents and temporary ground matting in case of inclement weather.` },
    ];
  } else {
    splits = [
      { category: 'venue', pct: 0.35, label: 'Private Event Pavilion or Villa', rationale: `Exclusive celebratory venue space in ${destination}.` },
      { category: 'catering', pct: 0.28, label: 'Chef-Curated Dinner & Specialty Toast', rationale: `Gourmet dinner and craft beverages.` },
      { category: 'decoration', pct: 0.15, label: 'Theme Styling, Lighting & Centerpieces', rationale: `Customized scenic backdrop, ambient lighting, and floral table settings.` },
      { category: 'entertainment', pct: 0.10, label: 'DJ, Live Band or Host', rationale: `Curated entertainment and guest activities.` },
      { category: 'photography', pct: 0.06, label: 'Event Photography & Highlight Reel', rationale: `High-resolution coverage of speeches and guest portraits.` },
      { category: 'contingency', pct: 0.06, label: 'Miscellaneous & Contingency', rationale: `Reserved for overtime fees or unexpected guest additions.` },
    ];
  }

  // Calculate integer minor amounts ensuring the sum matches totalBudgetMinor
  let allocatedSum = 0;
  const costBreakdowns = splits.map((item, index) => {
    let itemMinor: number;
    if (index === splits.length - 1) {
      itemMinor = Math.max(0, totalBudgetMinor - allocatedSum);
    } else {
      itemMinor = Math.round(totalBudgetMinor * item.pct);
      allocatedSum += itemMinor;
    }
    return {
      category: item.category,
      name: item.label,
      estimateMinor: itemMinor,
      rationale: item.rationale,
    };
  });

  const contingencyItem = costBreakdowns.find((c) => c.category === 'contingency');
  const contingencyReserveMinor = contingencyItem ? contingencyItem.estimateMinor : Math.round(totalBudgetMinor * 0.07);

  return {
    recommendedDestinations: [destination, 'Bali, Indonesia', 'Santorini, Greece', 'Goa, India'],
    costBreakdowns,
    assumptions: [
      `Budget scaled for an estimated ${guestCount} guests in ${destination}.`,
      `Estimates assume mid-to-high season booking rates with recommended 6-month advance reservation.`,
      `Local hospitality service fees and regional value-added taxes are accounted for within individual line items.`,
      `Travel and hotel bookings assume centralized airport pickup routes.`,
    ],
    economicalAlternative: `Host in an adjacent scenic locale or select an off-peak weekday date (can reduce venue and vendor costs by up to 25-30%).`,
    balancedPlan: `Reserve a premier destination venue in ${destination} for the core ceremony, combined with nearby boutique villas for guest accommodations.`,
    luxuryAlternative: `Full multi-day private buyout with customized drone light show, helicopter arrivals, and Michelin-starred guest chef curation.`,
    timelineHighlights: [
      '6 Months Before: Secure venue contract and confirm legal permits or sound curfew policies.',
      '4 Months Before: Finalize catering menu tastings, floral mockups, and send digital RSVPs.',
      '2 Months Before: Lock in photographer shot list, entertainment riders, and guest transport.',
      '2 Weeks Before: Conduct final technical run-through and confirm venue contingency indoor space.',
    ],
    venueQuestions: [
      'What are the exact outdoor sound amplification curfew hours at this venue?',
      'Is external catering permitted, or does the venue require exclusive in-house culinary providers?',
      'What covered or indoor contingency facilities are available at no extra charge in case of weather changes?',
      'What are the power generator specifications and load capacities for heavy lighting or A/V rigs?',
      'What is the deposit schedule and cancellation / postponement policy?',
    ],
    contingencyReserveMinor,
  };
}

// AI Event Planner endpoint with rate limiting and strict validation
app.post('/api/ai/plan-event', rateLimiter, async (req: Request, res: Response) => {
  try {
    const rawEventType = sanitizeText(req.body.eventType, 50);
    const rawDestination = sanitizeText(req.body.destination, 100);
    const rawDate = sanitizeText(req.body.date, 30);
    const rawGuestCount = parseInt(req.body.guestCount, 10);
    const rawTotalBudgetMinor = parseInt(req.body.totalBudgetMinor, 10);
    const rawCurrency = sanitizeText(req.body.currency, 10) || 'INR';
    const rawStyle = sanitizeText(req.body.style, 150);
    const rawTheme = sanitizeText(req.body.theme, 150);
    const rawCultural = sanitizeText(req.body.culturalPreferences, 250);
    const rawDietary = sanitizeText(req.body.dietaryPreferences, 250);
    const rawTravel = sanitizeText(req.body.travelRequirements, 250);
    const rawAccommodation = sanitizeText(req.body.accommodationRequirements, 250);
    const rawAccessibility = sanitizeText(req.body.accessibilityRequirements, 250);
    const rawSetting = sanitizeText(req.body.indoorOutdoor, 20);

    const validation = validateEventParameters({
      eventType: rawEventType,
      destination: rawDestination,
      date: rawDate,
      guestCount: rawGuestCount,
      totalBudgetMinor: rawTotalBudgetMinor,
    });

    if (!validation.isValid) {
      res.status(400).json({
        error: Object.values(validation.errors).join(' '),
        errors: validation.errors,
      });
      return;
    }

    const guestCount = isNaN(rawGuestCount) || rawGuestCount < 1 ? 100 : Math.min(rawGuestCount, 50000);

    // If Gemini client is available, try generating tailored advice
    if (ai) {
      try {
        const prompt = `
You are an expert luxury event architect and budget strategist for "AI Event Planner Pro".
Generate a personalized, realistic event planning recommendation.

User Request:
- Event Type: ${rawEventType}
- Preferred Destination: ${rawDestination}
- Target Date: ${rawDate || 'Flexible'}
- Number of Guests: ${guestCount}
- Total Budget: ${rawTotalBudgetMinor / 100} ${rawCurrency}
- Style & Theme: ${rawStyle || 'Elegant'} / ${rawTheme || 'Timeless'}
- Cultural & Dietary Preferences: ${rawCultural || 'Standard'} / ${rawDietary || 'Standard'}
- Travel Requirements: ${rawTravel || 'Standard private airport shuttles and transfers'}
- Accommodation Requirements: ${rawAccommodation || 'Boutique suites and block reservations'}
- Accessibility: ${rawAccessibility || 'Standard'}
- Setting: ${rawSetting || 'hybrid'}

You must return a strictly formatted JSON object adhering to this schema:
{
  "recommendedDestinations": ["3 to 4 string destinations that fit this vibe"],
  "costBreakdowns": [
    {
      "category": "venue" | "catering" | "decoration" | "photography" | "entertainment" | "travel" | "accommodation" | "equipment" | "contingency",
      "name": "Short descriptive line item name",
      "estimateMinor": integer minor units (in ${rawCurrency} cents/paise, sum should equal ${rawTotalBudgetMinor}),
      "rationale": "Why this allocation is appropriate for ${rawDestination}"
    }
  ],
  "assumptions": ["3 to 4 bullet points explaining what is included or excluded"],
  "economicalAlternative": "Realistic way to reduce spend by 20-30%",
  "balancedPlan": "The recommended balanced luxury execution",
  "luxuryAlternative": "High-end luxury upgrade package",
  "timelineHighlights": ["4 key milestone tasks with approximate deadlines"],
  "venueQuestions": ["5 essential questions the user must ask this venue before signing"],
  "contingencyReserveMinor": integer minor units reserved for unforeseen costs
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          res.json({ success: true, plan: parsed, provider: 'gemini-3.8-flash' });
          return;
        }
      } catch (geminiError) {
        console.warn('Gemini API call returned fallback signal, activating smart deterministic engine.');
      }
    }

    // High quality deterministic fallback engine
    const smartFallback = generateSmartEventPlanFallback({
      eventType: rawEventType,
      destination: rawDestination,
      date: rawDate,
      guestCount,
      totalBudgetMinor: rawTotalBudgetMinor,
      currency: rawCurrency,
      style: rawStyle,
      theme: rawTheme,
      culturalPreferences: rawCultural,
      dietaryPreferences: rawDietary,
      indoorOutdoor: rawSetting,
    });

    res.json({
      success: true,
      plan: smartFallback,
      provider: 'smart-deterministic-planner',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Handled error in /api/ai/plan-event:', message);
    res.status(500).json({ error: 'An unexpected error occurred while generating your plan. Please try again.' });
  }
});

// AI Theme and Decor Ideas endpoint with rate limiting
app.post('/api/ai/theme-ideas', rateLimiter, async (req: Request, res: Response) => {
  try {
    const rawEventType = sanitizeText(req.body.eventType, 50) || 'wedding';
    const rawDestination = sanitizeText(req.body.destination, 100) || 'Udaipur, India';
    const rawVibe = sanitizeText(req.body.vibe, 150) || 'luxury';

    if (ai) {
      try {
        const prompt = `
Generate 3 distinct creative visual themes and decor concepts for a ${rawEventType} in ${rawDestination} with a ${rawVibe} vibe.
Return JSON array of:
[
  {
    "title": "Theme title",
    "description": "Visual atmosphere and decor details",
    "imagePrompt": "Detailed prompt for 8k architectural photograph",
    "colorPalette": [{"name": "Color name", "hex": "#HEX"}],
    "floralElements": ["Flowers or botanicals"],
    "lightingStyle": "Lighting setup description"
  }
]
`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const raw = response.text;
        if (raw) {
          res.json({ success: true, themes: JSON.parse(raw.trim()) });
          return;
        }
      } catch (geminiErr) {
        console.warn('Gemini theme generation fallback signal received.');
      }
    }

    // Smart fallback themes
    res.json({
      success: true,
      themes: [
        {
          title: `${rawDestination} Sunset Horizon`,
          description: `Terracotta tones, cascading ivory blooms, and warm hanging lanterns framing panoramic vistas.`,
          imagePrompt: `Luxury ${rawEventType} setup in ${rawDestination} at twilight, warm fairy light canopy, elegant candlelit tables, fresh white roses, 8k photo`,
          colorPalette: [
            { name: 'Warm Terracotta', hex: '#E07A5F' },
            { name: 'Sunset Amber', hex: '#F59E0B' },
            { name: 'Ivory Chiffon', hex: '#FFFFF0' },
            { name: 'Deep Sage', hex: '#4A5D4E' },
          ],
          floralElements: ['White hydrangeas', 'Blush garden roses', 'Olive branches'],
          lightingStyle: 'Dimmable fairy light drapery and floating hurricane candle lanterns',
        },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: 'Unable to synthesize theme concepts at this time.' });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Event Planner Pro] Server listening securely on port ${PORT}`);
  });
}

startServer();
