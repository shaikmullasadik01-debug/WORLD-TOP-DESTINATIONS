/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Destination } from '../types';
import { useEventContext } from '../context/EventContext';
import { formatMoney } from '../utils/currency';
import {
  X,
  MapPin,
  Calendar,
  Sparkles,
  Heart,
  ShieldCheck,
  Building,
  Plane,
  Compass,
  UtensilsCrossed,
} from 'lucide-react';

interface DestinationModalProps {
  destination: Destination | null;
  onClose: () => void;
  onPlanEvent: (destination: Destination) => void;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  onClose,
  onPlanEvent,
}) => {
  const { favoriteDestinationIds, toggleFavoriteDestination, activeCurrency } = useEventContext();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!destination) return null;

  const isFavorite = favoriteDestinationIds.includes(destination.id);
  const allImages = [destination.image, ...destination.gallery];

  const minCostFormatted = activeCurrency === 'INR'
    ? formatMoney(destination.estimatedEventBudgetRange.minINR * 100, 'INR')
    : formatMoney(destination.estimatedEventBudgetRange.minUSD * 100, 'USD');

  const maxCostFormatted = activeCurrency === 'INR'
    ? formatMoney(destination.estimatedEventBudgetRange.maxINR * 100, 'INR')
    : formatMoney(destination.estimatedEventBudgetRange.maxUSD * 100, 'USD');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 text-left my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors backdrop-blur-md"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery / Main Image */}
        <div className="relative h-72 sm:h-96 w-full bg-slate-950 overflow-hidden">
          <img
            src={allImages[activeImageIndex]}
            alt={destination.name}
            className="w-full h-full object-cover transition-all duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

          {/* Top Favorite Toggle */}
          <button
            onClick={() => toggleFavoriteDestination(destination.id)}
            className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-colors ${
              isFavorite ? 'bg-rose-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            <span>{isFavorite ? 'Saved in Favorites' : 'Save to Favorites'}</span>
          </button>

          {/* Bottom Heading */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
              <MapPin className="w-3.5 h-3.5" />
              <span>{destination.country}</span>
              <span aria-hidden="true">·</span>
              <span>{destination.region}</span>
              <span aria-hidden="true">·</span>
              <span>{destination.category}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              {destination.name}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl font-light">
              {destination.headline}
            </p>
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-2 z-10">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-transform ${
                    activeImageIndex === idx ? 'border-amber-400 scale-105' : 'border-white/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block">Estimated Budget</span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">
                {minCostFormatted} - {maxCostFormatted}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Best Season</span>
              <span className="text-sm font-semibold text-slate-900 truncate block">
                {destination.bestSeason}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Guest Capacity</span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">
                {destination.guestCapacityRange.min} - {destination.guestCapacityRange.max} guests
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Affordability Tier</span>
              <span className="text-sm font-semibold text-slate-900">
                Tier {destination.estimatedCostTier}
              </span>
            </div>
          </div>

          {/* Overview & Atmosphere */}
          <div className="space-y-3">
            <h3 className="text-lg font-serif font-bold text-slate-900">
              Atmosphere & Architectural Setting
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {destination.description}
            </p>
          </div>

          {/* Verified Venue Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-600" />
                <span>Verified Iconic Venue Options</span>
              </h3>
              <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Capacities</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {destination.verifiedVenues.map((venue, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-1.5"
                >
                  <div className="font-semibold text-sm text-slate-900">{venue.name}</div>
                  <div className="text-xs text-slate-500">{venue.type} · Up to {venue.capacity} guests</div>
                  <div className="text-xs font-medium text-amber-700 tabular-nums">
                    Est: {venue.priceEstimate}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two-Column Guidance: Logistics & Culture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Travel & Accommodation */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Plane className="w-4 h-4 text-slate-700" />
                <span>Travel & Accommodation Guide</span>
              </div>
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  <strong className="text-slate-800">Flights & Transit: </strong>
                  {destination.travelPlanningTips}
                </p>
                <p>
                  <strong className="text-slate-800">Lodging: </strong>
                  {destination.accommodationGuide}
                </p>
              </div>
            </div>

            {/* Weather & Cultural Considerations */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <UtensilsCrossed className="w-4 h-4 text-slate-700" />
                <span>Local Considerations & Weather</span>
              </div>
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  <strong className="text-slate-800">Climate: </strong>
                  {destination.weatherNotes}
                </p>
                <div>
                  <strong className="text-slate-800 block mb-1">Cultural Etiquette & Traditions:</strong>
                  <ul className="list-disc pl-4 space-y-1">
                    {destination.localCulturalTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer CTA */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>Coordinates: {destination.coordinates.lat.toFixed(4)}°, {destination.coordinates.lng.toFixed(4)}°</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onPlanEvent(destination);
                  onClose();
                }}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Plan an Event in {destination.name}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
