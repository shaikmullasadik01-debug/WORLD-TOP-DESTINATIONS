/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { THEME_INSPIRATIONS } from '../data/inspirations';
import { ThemeInspiration, EventType } from '../types';
import { useEventContext } from '../context/EventContext';
import {
  Palette,
  Sparkles,
  Copy,
  Check,
  Heart,
  BookmarkPlus,
  Compass,
  Layers,
  Wand2,
} from 'lucide-react';

export const ThemeStudio: React.FC = () => {
  const { activeEvent, updateEvent } = useEventContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Custom AI Theme Generator State
  const [customDestination, setCustomDestination] = useState(
    activeEvent ? activeEvent.destinationName : 'Udaipur, India'
  );
  const [customEventType, setCustomEventType] = useState<EventType>(
    activeEvent ? activeEvent.type : 'wedding'
  );
  const [customVibe, setCustomVibe] = useState('Opulent sunset romance with fairy light chandeliers');
  const [generatedPromptResult, setGeneratedPromptResult] = useState<string | null>(null);

  const categories = [
    'All',
    'Royal Wedding Themes',
    'Luxury Wedding Stages',
    'Beach Weddings',
    'Garden Ceremonies',
    'Modern Cities',
    'Mountains and Nature',
  ];

  const filteredThemes = selectedCategory === 'All'
    ? THEME_INSPIRATIONS
    : THEME_INSPIRATIONS.filter((t) => t.category === selectedCategory);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleCopyPrompt = (theme: ThemeInspiration) => {
    navigator.clipboard.writeText(theme.prompt);
    setCopiedPromptId(theme.id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleSaveToMoodboard = (theme: ThemeInspiration) => {
    if (!activeEvent) return;
    const currentSaved = activeEvent.savedInspirationIds || [];
    if (!currentSaved.includes(theme.id)) {
      updateEvent(activeEvent.id, {
        savedInspirationIds: [...currentSaved, theme.id],
      });
    }
  };

  const handleGenerateCustomPrompt = () => {
    const prompt = `Architectural luxury ${customEventType} stage and decor in ${customDestination}, featuring ${customVibe}, abundant cascading floral arrangements, warm ambient golden illumination, cinematic composition, 8k commercial quality`;
    setGeneratedPromptResult(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-amber-600 mb-1 flex items-center gap-1.5">
            <Palette className="w-4 h-4" />
            <span>Visual Concept & Scenography Studio</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            AI Image & Theme Inspiration Studio
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Curated scenography, floral mandaps, fairy light canopies, and tested prompts designed
            for luxury wedding stages, beachfront galas, and imperial palace banquets.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Custom Theme Prompt Generator Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <Wand2 className="w-4 h-4" />
            <span>AI Scenography Prompt Synthesizer</span>
          </div>
          <span className="text-xs text-slate-400">Tailored to Destination & Vibe</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Destination</label>
            <input
              type="text"
              value={customDestination}
              onChange={(e) => setCustomDestination(e.target.value)}
              placeholder="e.g. Amalfi Coast, Italy"
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Event Type</label>
            <select
              value={customEventType}
              onChange={(e) => setCustomEventType(e.target.value as EventType)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white capitalize focus:outline-hidden focus:ring-1 focus:ring-amber-400"
            >
              <option value="wedding">Wedding</option>
              <option value="birthday">Birthday</option>
              <option value="anniversary">Anniversary</option>
              <option value="corporate">Corporate Gala</option>
              <option value="festival">Festival</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Theme Atmosphere & Florals</label>
            <input
              type="text"
              value={customVibe}
              onChange={(e) => setCustomVibe(e.target.value)}
              placeholder="e.g. White orchids, crystal chandeliers, sunset ocean view"
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={handleGenerateCustomPrompt}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synthesize Theme Concept</span>
          </button>

          {generatedPromptResult && (
            <div className="flex-1 bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-200 flex items-center justify-between gap-3">
              <span className="truncate italic">"{generatedPromptResult}"</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPromptResult);
                  setCopiedPromptId('custom');
                  setTimeout(() => setCopiedPromptId(null), 2000);
                }}
                className="shrink-0 p-1.5 text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                {copiedPromptId === 'custom' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPromptId === 'custom' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Curated Inspiration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredThemes.map((theme) => {
          const isSaved = activeEvent?.savedInspirationIds?.includes(theme.id);

          return (
            <div
              key={theme.id}
              className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Frame */}
                <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={theme.image}
                    alt={theme.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Category Kicker */}
                  <div className="absolute top-3 left-4 text-xs font-semibold text-amber-300 backdrop-blur-md bg-black/40 px-2.5 py-1 rounded-full">
                    {theme.category}
                  </div>

                  {/* Bookmark / Save to active event */}
                  {activeEvent && (
                    <button
                      onClick={() => handleSaveToMoodboard(theme)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                        isSaved ? 'bg-amber-400 text-slate-950' : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                      title={isSaved ? 'Saved in active event moodboard' : 'Save to active event'}
                    >
                      <BookmarkPlus className="w-4 h-4" />
                    </button>
                  )}

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-xl font-serif font-bold tracking-tight">
                      {theme.title}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {theme.description}
                  </p>

                  {/* Color Palette Swatches */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Color Palette (Click to copy hex)
                    </span>
                    <div className="flex items-center gap-2">
                      {theme.colorPalette.map((color, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCopyHex(color.hex)}
                          className="group/swatch relative flex-1 h-9 rounded-xl border border-black/10 transition-transform hover:scale-105 shadow-2xs"
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name}: ${color.hex}`}
                        >
                          <span className="opacity-0 group-hover/swatch:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded-md whitespace-nowrap pointer-events-none z-20">
                            {copiedHex === color.hex ? 'Copied!' : `${color.name} ${color.hex}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Generation Prompt Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-slate-700">Art Generation Prompt</span>
                      <button
                        onClick={() => handleCopyPrompt(theme)}
                        className="flex items-center gap-1 text-slate-600 hover:text-slate-950 font-medium"
                      >
                        {copiedPromptId === theme.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-slate-600 text-xs italic line-clamp-3 leading-relaxed">
                      "{theme.prompt}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 flex items-center justify-between text-xs text-slate-400">
                <span className="capitalize">Fit for {theme.eventType}</span>
                {isSaved && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved to Moodboard
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
