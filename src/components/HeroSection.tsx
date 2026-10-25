/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useEventContext } from '../context/EventContext';
import { Compass, Sparkles, HeartHandshake, ShieldCheck, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onFilterCategory?: (category: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onFilterCategory }) => {
  const { setActiveTab } = useEventContext();

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
      {/* Background Subtle Gradient & Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 opacity-90" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Clean unboxed kicker */}
            <div className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-amber-400">
              <Compass className="w-3.5 h-3.5" />
              <span>Global Luxury Event Architecture</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Curated 2026-2027</span>
            </div>

            {/* Exact Required Hero Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
              WORLD TOP DESTINATIONS
            </h1>

            {/* Exact Required Subheading */}
            <p className="text-lg sm:text-xl text-slate-300 font-light max-w-xl leading-relaxed">
              Explore the World. Celebrate Your Moments. Create Memories That Last Forever.
            </p>

            {/* Required Primary Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const explorerElem = document.getElementById('destination-explorer-section');
                  if (explorerElem) {
                    explorerElem.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveTab('destinations');
                  }
                }}
                className="px-5 py-3 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Compass className="w-4 h-4 text-slate-950" />
                <span>Explore Destinations</span>
              </button>

              <button
                onClick={() => setActiveTab('ai-planner')}
                className="px-5 py-3 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Plan Your Dream Event</span>
              </button>

              <button
                onClick={() => {
                  if (onFilterCategory) {
                    onFilterCategory('Indian Wedding Destinations');
                  }
                  const explorerElem = document.getElementById('destination-explorer-section');
                  if (explorerElem) {
                    explorerElem.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                <span>Discover Wedding Venues</span>
              </button>
            </div>

            {/* Quantitative Proof Strip */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="text-2xl font-bold font-serif text-white tabular-nums">30+</div>
                <div className="text-xs text-slate-400">Curated World Landmarks</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-serif text-amber-400 tabular-nums">100%</div>
                <div className="text-xs text-slate-400">Integer Minor-Unit Budget Math</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-serif text-white tabular-nums">7 Tiers</div>
                <div className="text-xs text-slate-400">Weddings, Galas & Summits</div>
              </div>
            </div>
          </div>

          {/* Right Column: Destination Visual Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group bg-slate-900">
              <img
                src="/src/assets/images/world_destinations_collage_1792901780838.jpg"
                alt="World Top Destinations Collage featuring Paris, Santorini, Taj Mahal, Maldives, and Swiss Alps"
                className="w-full h-[360px] sm:h-[420px] lg:h-[460px] object-cover transition-transform duration-700 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              {/* Subtle Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

              {/* Bottom Caption Pill-Free Bar */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium text-white">Paris · Santorini · Taj Mahal · Maldives · Swiss Alps</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Venue Guides</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
