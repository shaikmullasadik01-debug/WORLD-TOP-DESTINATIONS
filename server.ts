/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DESTINATIONS } from './src/data/destinations.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

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

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Destinations catalog endpoint
app.get('/api/destinations', (_req: Request, res: Response) => {
  res.json({
    destinations: DESTINATIONS,
    total: DESTINATIONS.length,
  });
});

// Fallback intelligent event planner generator for guaranteed offline/demo reliability
function generateSmartEventPlanFallback(params: {
  eventType: string;
  destination: string;
  date: string;
  guestCount: number;
  totalBudgetMinor: number;
  currency: string;
  style?: string;
  theme?: string;
  culturalPreferences?: string;
  dietaryPreferences?: string;
  indoorOutdoor?: string;
}) {
  const { eventType, destination, guestCount, totalBudgetMinor, currency, style, theme } = params;
  const isWedding = eventType.toLowerCase().includes('wedding');
  const isCorporate = eventType.toLowerCase().includes('corporate');

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
      { category: 'venue', pct: 0.38, label: 'Convention Hall & Breakout Rooms', rationale: `High-bandwidth ballroom and multi-track presentation suites.` },
      { category: 'catering', pct: 0.26, label: 'Executive Luncheons & Gala Dinner', rationale: `Continuous networking coffee lounges, lunch buffet, and evening cocktail reception.` },
      { category: 'equipment', pct: 0.18, label: 'LED Video Walls & Audio Engineering', rationale: `Keynote stage LED wall, live stream broadcast rigging, and interpretation equipment.` },
      { category: 'travel', pct: 0.08, label: 'Keynote Speaker Hospitality & Shuttles', rationale: `Airport VIP transfers and speaker accommodation blocks.` },
      { category: 'contingency', pct: 0.10, label: 'Technical & Production Reserve', rationale: `Reserved for emergency live stream bandwidth or last-minute rider modifications.` },
    ];
  } else {
    splits = [
      { category: 'venue', pct: 0.35, label: 'Private Event Pavilion or Villa', rationale: `Exclusive celebratory venue space in ${destination}.` },
      { category: 'catering', pct: 0.28, label: 'Chef-Curated Dinner & Specialty Cake', rationale: `Gourmet dinner, custom celebration dessert, and craft mocktails/cocktails.` },
      { category: 'decoration', pct: 0.15, label: 'Theme Styling, Lighting & Photo Op', rationale: `Customized scenic backdrop, ambient lighting, and floral table settings.` },
      { category: 'entertainment', pct: 0.10, label: 'DJ, Live Band or Host', rationale: `Curated entertainment and interactive guest activities.` },
      { category: 'photography', pct: 0.06, label: 'Event Photography & Highlight Reel', rationale: `High-resolution coverage of speeches, cake cutting, and guest portraits.` },
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

// AI Event Planner endpoint
app.post('/api/ai/plan-event', async (req: Request, res: Response) => {
  try {
    const {
      eventType,
      destination,
      date,
      guestCount,
      totalBudgetMinor,
      currency = 'INR',
      style,
      theme,
      culturalPreferences,
      dietaryPreferences,
      accessibilityRequirements,
      indoorOutdoor,
    } = req.body;

    if (!eventType || !destination || !totalBudgetMinor) {
      return res.status(400).json({ error: 'Missing required fields: eventType, destination, totalBudgetMinor' });
    }

    // If Gemini client is available, try generating tailored advice
    if (ai) {
      try {
        const prompt = `
You are an expert luxury event architect and budget strategist for "AI Event Planner Pro".
Generate a personalized, realistic event planning recommendation.

User Request:
- Event Type: ${eventType}
- Preferred Destination: ${destination}
- Target Date: ${date || 'Flexible'}
- Number of Guests: ${guestCount}
- Total Budget: ${totalBudgetMinor / 100} ${currency}
- Style & Theme: ${style || 'Elegant'} / ${theme || 'Timeless'}
- Cultural & Dietary Preferences: ${culturalPreferences || 'Standard'} / ${dietaryPreferences || 'Standard'}
- Accessibility: ${accessibilityRequirements || 'Standard'}
- Setting: ${indoorOutdoor || 'hybrid'}

You must return a strictly formatted JSON object adhering to this schema:
{
  "recommendedDestinations": ["3 to 4 string destinations that fit this vibe"],
  "costBreakdowns": [
    {
      "category": "venue" | "catering" | "decoration" | "photography" | "entertainment" | "travel" | "accommodation" | "equipment" | "contingency",
      "name": "Short descriptive line item name",
      "estimateMinor": integer minor units (in ${currency} cents/paise, sum should equal ${totalBudgetMinor}),
      "rationale": "Why this allocation is appropriate for ${destination}"
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
          return res.json({ success: true, plan: parsed, provider: 'gemini-3.8-flash' });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to smart deterministic engine:', geminiError);
      }
    }

    // High quality deterministic fallback engine
    const smartFallback = generateSmartEventPlanFallback({
      eventType,
      destination,
      date,
      guestCount: guestCount || 100,
      totalBudgetMinor,
      currency,
      style,
      theme,
      culturalPreferences,
      dietaryPreferences,
      indoorOutdoor,
    });

    return res.json({
      success: true,
      plan: smartFallback,
      provider: 'smart-deterministic-planner',
    });
  } catch (err: any) {
    console.error('Error in /api/ai/plan-event:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// AI Theme and Decor Ideas endpoint
app.post('/api/ai/theme-ideas', async (req: Request, res: Response) => {
  try {
    const { eventType, destination, vibe } = req.body;

    if (ai) {
      try {
        const prompt = `
Generate 3 distinct creative visual themes and decor concepts for a ${eventType} in ${destination} with a ${vibe || 'luxury'} vibe.
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
          return res.json({ success: true, themes: JSON.parse(raw.trim()) });
        }
      } catch (geminiErr) {
        console.warn('Gemini theme generation fallback:', geminiErr);
      }
    }

    // Smart fallback themes
    res.json({
      success: true,
      themes: [
        {
          title: `${destination} Sunset Horizon`,
          description: `Terracotta tones, cascading ivory blooms, and warm hanging lanterns framing panoramic vistas.`,
          imagePrompt: `Luxury ${eventType} setup in ${destination} at twilight, warm fairy light canopy, elegant candlelit tables, fresh white roses, 8k photo`,
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
    console.log(`[AI Event Planner Pro] Server listening on port ${PORT}`);
  });
}

startServer();
