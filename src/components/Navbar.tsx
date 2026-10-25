/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useEventContext, AppTab } from '../context/EventContext';
import { Currency } from '../types';
import { Sparkles, Calendar, Globe, Palette, DollarSign, Users, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, activeCurrency, setActiveCurrency, events, activeEventId, setActiveEventId } =
    useEventContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currencies: Currency[] = ['INR', 'USD', 'EUR', 'GBP', 'AED'];

  const navItems: { tab: AppTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'destinations', label: 'Destinations', icon: <Globe className="w-4 h-4" /> },
    { tab: 'ai-planner', label: 'AI Planner', icon: <Sparkles className="w-4 h-4" /> },
    { tab: 'events', label: 'My Events', icon: <Calendar className="w-4 h-4" /> },
    { tab: 'theme-studio', label: 'Theme Studio', icon: <Palette className="w-4 h-4" /> },
    { tab: 'budget', label: 'Budget & Tasks', icon: <DollarSign className="w-4 h-4" /> },
    { tab: 'vendors', label: 'Vendors', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('destinations')}
            className="text-left group flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-serif text-lg font-bold shadow-sm">
              E
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors whitespace-nowrap">
                AI Event Planner Pro
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Main Navigation">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              aria-current={activeTab === item.tab ? 'page' : undefined}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 relative focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-hidden rounded-md px-1 ${
                activeTab === item.tab
                  ? 'text-slate-950 font-semibold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {item.label}
              {activeTab === item.tab && (
                <span className="absolute bottom-[-18px] left-0 right-0 h-0.5 bg-slate-900" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions (Currency & Primary CTA) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Currency Selector */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium text-slate-600">
            {currencies.map((curr) => (
              <button
                key={curr}
                onClick={() => setActiveCurrency(curr)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeCurrency === curr
                    ? 'bg-white text-slate-950 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
                title={`Switch currency to ${curr}`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Quick Event Switcher if multiple */}
          {events.length > 1 && (
            <select
              aria-label="Select active event"
              value={activeEventId || ''}
              onChange={(e) => setActiveEventId(e.target.value)}
              className="hidden md:block text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900 max-w-[140px] truncate"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          )}

          {/* Primary Action Button */}
          <button
            onClick={() => setActiveTab('ai-planner')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Plan Event</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-950 rounded-lg hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-medium text-slate-500">Currency</span>
            <div className="flex gap-1">
              {currencies.map((curr) => (
                <button
                  key={curr}
                  onClick={() => setActiveCurrency(curr)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    activeCurrency === curr ? 'bg-slate-900 text-white font-medium' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 pt-1">
            {navItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => {
                  setActiveTab(item.tab);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-sm text-left ${
                  activeTab === item.tab
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
