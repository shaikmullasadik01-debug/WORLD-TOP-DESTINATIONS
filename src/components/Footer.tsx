/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useEventContext } from '../context/EventContext';
import { Compass, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useEventContext();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Proposition */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-serif text-sm font-bold">
                E
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">
                AI Event Planner Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Explore the World. Celebrate Your Moments. Create Memories That Last Forever.
            </p>
          </div>

          {/* Destination Regions */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 block">
              Featured Continents
            </span>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => setActiveTab('destinations')} className="hover:text-white transition-colors">Asia (Bali, Tokyo, Maldives, Dubai)</button></li>
              <li><button onClick={() => setActiveTab('destinations')} className="hover:text-white transition-colors">Europe (Santorini, Paris, Amalfi, Swiss Alps)</button></li>
              <li><button onClick={() => setActiveTab('destinations')} className="hover:text-white transition-colors">North America (New York, Banff, Hawaii)</button></li>
              <li><button onClick={() => setActiveTab('destinations')} className="hover:text-white transition-colors">Africa & Iconic (Zanzibar, Taj Mahal, Udaipur)</button></li>
            </ul>
          </div>

          {/* Quick Tools */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 block">
              Planning Suites
            </span>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => setActiveTab('ai-planner')} className="hover:text-white transition-colors">AI Budget Feasibility Engine</button></li>
              <li><button onClick={() => setActiveTab('theme-studio')} className="hover:text-white transition-colors">Scenography & Mandap Studio</button></li>
              <li><button onClick={() => setActiveTab('budget')} className="hover:text-white transition-colors">Integer-Safe Currency Ledger</button></li>
              <li><button onClick={() => setActiveTab('vendors')} className="hover:text-white transition-colors">Contract Milestone Tracker</button></li>
            </ul>
          </div>

          {/* Transparency & Standards */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 block">
              Integrity & Standards
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Budget estimates are indicative guidance based on seasonal regional tariffs. Always verify final venue sound curfews, liquor permits, and local taxes directly before signing contracts.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} AI Event Planner Pro. Designed with precision architecture.
          </div>
          <div className="flex items-center gap-4">
            <span>Integer Minor-Unit Financial Engine</span>
            <span>·</span>
            <span>No Floating Point Currencies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
