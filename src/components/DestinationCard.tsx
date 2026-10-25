/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Destination } from '../types';
import { useEventContext } from '../context/EventContext';
import { formatMoney } from '../utils/currency';
import { Heart, MapPin, Calendar, Compass, Sparkles } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
  onOpenDetails: (destination: Destination) => void;
  onPlanHere: (destination: Destination) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onOpenDetails,
  onPlanHere,
}) => {
  const { favoriteDestinationIds, toggleFavoriteDestination, activeCurrency } = useEventContext();
  const [imageError, setImageError] = useState(false);

  const isFavorite = favoriteDestinationIds.includes(destination.id);

  // Formatted cost estimate
  const minCostFormatted = activeCurrency === 'INR'
    ? formatMoney(destination.estimatedEventBudgetRange.minINR * 100, 'INR', true)
    : formatMoney(destination.estimatedEventBudgetRange.minUSD * 100, 'USD', true);

  const maxCostFormatted = activeCurrency === 'INR'
    ? formatMoney(destination.estimatedEventBudgetRange.maxINR * 100, 'INR', true)
    : formatMoney(destination.estimatedEventBudgetRange.maxUSD * 100, 'USD', true);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col h-full text-left">
      {/* Image Container with Fallback */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
        {!imageError ? (
          <img
            src={destination.image}
            alt={`${destination.name}, ${destination.country}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-4 text-center">
            <Compass className="w-8 h-8 mb-2 text-slate-500" />
            <span className="text-sm font-serif text-white">{destination.name}</span>
            <span className="text-xs">{destination.country}</span>
          </div>
        )}

        {/* Gradient Scrim for readable contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteDestination(destination.id);
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-black/30 hover:bg-black/50 text-white/90'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Overlaid Bottom Title */}
        <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{destination.country}</span>
            <span aria-hidden="true">·</span>
            <span>{destination.region}</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-white tracking-tight mt-0.5">
            {destination.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Zero-Pill Unboxed Metadata Line */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-800">{destination.category}</span>
            <span aria-hidden="true">·</span>
            <span>Tier {destination.estimatedCostTier}</span>
            <span aria-hidden="true">·</span>
            <span>Up to {destination.guestCapacityRange.max} guests</span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {destination.headline}
          </p>

          {/* Cost & Best Season Box */}
          <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Est. Event Budget:</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {minCostFormatted} - {maxCostFormatted}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Best: {destination.bestSeason}</span>
            </div>
          </div>

          {/* Recommended Events Text */}
          <div className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">Recommended for: </span>
            <span className="capitalize">
              {destination.recommendedEvents.join(' · ')}
            </span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => onOpenDetails(destination)}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center whitespace-nowrap"
          >
            View Details
          </button>
          <button
            onClick={() => onPlanHere(destination)}
            className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Plan Here</span>
          </button>
        </div>
      </div>
    </div>
  );
};
