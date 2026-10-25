/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DESTINATIONS } from '../data/destinations';
import { Destination, DestinationRegion, DestinationCategory, EventType, SortOption } from '../types';
import { DestinationCard } from './DestinationCard';
import { useEventContext } from '../context/EventContext';
import { Search, SlidersHorizontal, Heart, Clock, X, RotateCcw } from 'lucide-react';

interface DestinationExplorerProps {
  onPlanHere: (destination: Destination) => void;
  onOpenDetails: (destination: Destination) => void;
  initialCategory?: string;
}

export const DestinationExplorer: React.FC<DestinationExplorerProps> = ({
  onPlanHere,
  onOpenDetails,
  initialCategory = 'All',
}) => {
  const { favoriteDestinationIds, recentDestinationIds, recordRecentDestination } = useEventContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedEventType, setSelectedEventType] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [selectedSetting, setSelectedSetting] = useState<string>('All');
  const [selectedAccessibility, setSelectedAccessibility] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const countries = useMemo(() => {
    const list = Array.from(new Set(DESTINATIONS.map((d) => d.country))).sort();
    return ['All', ...list];
  }, []);

  const regions: (DestinationRegion | 'All')[] = [
    'All',
    'Asia',
    'Europe',
    'North America',
    'Africa',
    'Other',
  ];

  const categories: (DestinationCategory | 'All')[] = [
    'All',
    'Beaches and Islands',
    'Luxury Resorts',
    'Romantic Getaways',
    'Mountains and Nature',
    'Historic Landmarks',
    'Modern Cities',
    'Adventure Destinations',
    'Indian Wedding Destinations',
  ];

  const eventTypes: (EventType | 'All')[] = [
    'All',
    'wedding',
    'birthday',
    'anniversary',
    'engagement',
    'corporate',
    'festival',
    'community',
  ];

  // Filtering logic
  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter((dest) => {
      // Favorites filter
      if (showOnlyFavorites && !favoriteDestinationIds.includes(dest.id)) {
        return false;
      }

      // Recent filter
      if (showRecent && !recentDestinationIds.includes(dest.id)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = dest.name.toLowerCase().includes(query);
        const matchesCountry = dest.country.toLowerCase().includes(query);
        const matchesDesc = dest.description.toLowerCase().includes(query);
        const matchesVenue = dest.venueTypes.some((v) => v.toLowerCase().includes(query));
        if (!matchesName && !matchesCountry && !matchesDesc && !matchesVenue) {
          return false;
        }
      }

      // Region filter
      if (selectedRegion !== 'All' && dest.region !== selectedRegion) {
        return false;
      }

      // Country filter
      if (selectedCountry !== 'All' && dest.country !== selectedCountry) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && dest.category !== selectedCategory) {
        return false;
      }

      // Event type filter
      if (
        selectedEventType !== 'All' &&
        !dest.recommendedEvents.includes(selectedEventType.toLowerCase() as EventType)
      ) {
        return false;
      }

      // Tier filter
      if (selectedTier !== 'All' && dest.estimatedCostTier !== selectedTier) {
        return false;
      }

      // Guest Capacity filter
      if (selectedCapacity !== 'All') {
        const maxCap = dest.guestCapacityRange.max;
        if (selectedCapacity === 'intimate' && maxCap > 100) return false;
        if (selectedCapacity === 'mid' && (maxCap < 100 || dest.guestCapacityRange.min > 300)) return false;
        if (selectedCapacity === 'grand' && (maxCap < 300 || dest.guestCapacityRange.min > 600)) return false;
        if (selectedCapacity === 'mega' && maxCap < 600) return false;
      }

      // Preferred Season filter
      if (selectedSeason !== 'All') {
        const seasonLower = dest.bestSeason.toLowerCase();
        const querySeason = selectedSeason.toLowerCase();
        if (!seasonLower.includes(querySeason) && !seasonLower.includes('year-round')) {
          return false;
        }
      }

      // Indoor / Outdoor filter
      if (selectedSetting !== 'All') {
        const venuesLower = dest.venueTypes.map((v) => v.toLowerCase()).join(' ');
        if (selectedSetting === 'outdoor' && !venuesLower.includes('beach') && !venuesLower.includes('lawn') && !venuesLower.includes('terrace') && !venuesLower.includes('cliff') && !venuesLower.includes('deck')) {
          return false;
        }
        if (selectedSetting === 'indoor' && !venuesLower.includes('ballroom') && !venuesLower.includes('palace') && !venuesLower.includes('hall') && !venuesLower.includes('glasshouse')) {
          return false;
        }
      }

      // Accessibility filter
      if (selectedAccessibility === 'accessible') {
        // Luxury resorts and five-star landmark hotels have verified step-free wheelchair accessibility
        const isAccessible = dest.category === 'Luxury Resorts' || dest.category === 'Modern Cities' || dest.venueTypes.some(v => v.toLowerCase().includes('ballroom') || v.toLowerCase().includes('resort'));
        if (!isAccessible) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'budget_asc') return a.estimatedEventBudgetRange.minINR - b.estimatedEventBudgetRange.minINR;
      if (sortBy === 'budget_desc') return b.estimatedEventBudgetRange.maxINR - a.estimatedEventBudgetRange.maxINR;
      return 0; // recommended
    });
  }, [
    searchQuery,
    selectedRegion,
    selectedCountry,
    selectedCategory,
    selectedEventType,
    selectedTier,
    selectedCapacity,
    selectedSeason,
    selectedSetting,
    selectedAccessibility,
    sortBy,
    showOnlyFavorites,
    showRecent,
    favoriteDestinationIds,
    recentDestinationIds,
  ]);

  const handleCardClick = (destination: Destination) => {
    recordRecentDestination(destination.id);
    onOpenDetails(destination);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All');
    setSelectedCountry('All');
    setSelectedCategory('All');
    setSelectedEventType('All');
    setSelectedTier('All');
    setSelectedCapacity('All');
    setSelectedSeason('All');
    setSelectedSetting('All');
    setSelectedAccessibility('All');
    setShowOnlyFavorites(false);
    setShowRecent(false);
    setSortBy('recommended');
  };

  const activeFiltersCount =
    (selectedRegion !== 'All' ? 1 : 0) +
    (selectedCountry !== 'All' ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedEventType !== 'All' ? 1 : 0) +
    (selectedTier !== 'All' ? 1 : 0) +
    (selectedCapacity !== 'All' ? 1 : 0) +
    (selectedSeason !== 'All' ? 1 : 0) +
    (selectedSetting !== 'All' ? 1 : 0) +
    (selectedAccessibility !== 'All' ? 1 : 0) +
    (showOnlyFavorites ? 1 : 0) +
    (showRecent ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <section id="destination-explorer-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 text-left">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">
            Global Destination Catalog
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Curated World Destinations
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Explore 30+ breathtaking destinations across Asia, Europe, the Americas, Africa, and beyond.
          </p>
        </div>

        {/* Quick Toggles: Favorites & Recents */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowOnlyFavorites(!showOnlyFavorites);
              if (showRecent) setShowRecent(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              showOnlyFavorites
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-current text-rose-500' : 'text-slate-400'}`} />
            <span>Favorites ({favoriteDestinationIds.length})</span>
          </button>

          <button
            onClick={() => {
              setShowRecent(!showRecent);
              if (showOnlyFavorites) setShowOnlyFavorites(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              showRecent
                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Recently Viewed</span>
          </button>

          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`md:hidden px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              activeFiltersCount > 0 ? 'bg-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters ({activeFiltersCount})</span>
          </button>
        </div>
      </div>

      {/* Primary Search and Region Filter Bar */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, country, or venue style (e.g. Santorini, Cliffside, Udaipur, Palace)..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="w-full sm:w-auto shrink-0 flex items-center gap-2 text-xs">
            <span className="text-slate-500 whitespace-nowrap">Sort by:</span>
            <select
              aria-label="Sort destinations"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="recommended">Featured / Curated</option>
              <option value="budget_asc">Lowest Budget First</option>
              <option value="budget_desc">Highest Budget First</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Region Segmented Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-left">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline whitespace-nowrap">Region:</span>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedRegion === region
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-left">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline whitespace-nowrap">Style:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300'
                  : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Extended Filters (Desktop always, Mobile via toggle) */}
        <div className={`${showFiltersPanel ? 'block' : 'hidden md:block'} p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4 text-left`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Country Filter */}
            <div>
              <label htmlFor="filter-country" className="block text-slate-600 font-semibold mb-1">Country</label>
              <select
                id="filter-country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Countries' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type Filter */}
            <div>
              <label htmlFor="filter-event-type" className="block text-slate-600 font-semibold mb-1">Event Type</label>
              <select
                id="filter-event-type"
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 capitalize"
              >
                {eventTypes.map((et) => (
                  <option key={et} value={et}>
                    {et === 'All' ? 'All Event Types' : et}
                  </option>
                ))}
              </select>
            </div>

            {/* Guest Capacity Filter */}
            <div>
              <label htmlFor="filter-capacity" className="block text-slate-600 font-semibold mb-1">Guest Capacity</label>
              <select
                id="filter-capacity"
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="All">All Capacities</option>
                <option value="intimate">Intimate (Up to 100)</option>
                <option value="mid">Mid-Size (100 - 300)</option>
                <option value="grand">Grand Gala (300 - 600)</option>
                <option value="mega">Mega / Festival (600+)</option>
              </select>
            </div>

            {/* Preferred Season Filter */}
            <div>
              <label htmlFor="filter-season" className="block text-slate-600 font-semibold mb-1">Preferred Season</label>
              <select
                id="filter-season"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="All">All Seasons</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="autumn">Autumn / Fall</option>
                <option value="winter">Winter</option>
                <option value="year-round">Year-Round</option>
              </select>
            </div>

            {/* Setting: Indoor / Outdoor */}
            <div>
              <label htmlFor="filter-setting" className="block text-slate-600 font-semibold mb-1">Venue Setting</label>
              <select
                id="filter-setting"
                value={selectedSetting}
                onChange={(e) => setSelectedSetting(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="All">Indoor & Outdoor</option>
                <option value="outdoor">Pure Outdoor / Beach / Lawn</option>
                <option value="indoor">Indoor Ballrooms & Palaces</option>
              </select>
            </div>

            {/* Accessibility Filter */}
            <div>
              <label htmlFor="filter-accessibility" className="block text-slate-600 font-semibold mb-1">Accessibility</label>
              <select
                id="filter-accessibility"
                value={selectedAccessibility}
                onChange={(e) => setSelectedAccessibility(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="All">All Venues</option>
                <option value="accessible">Verified Step-Free / Accessible</option>
              </select>
            </div>
          </div>

          {/* Bottom Bar: Active Filters Count, Status, and Reset */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
            <div aria-live="polite" className="text-slate-600 font-medium">
              Showing <strong className="text-slate-900">{filteredDestinations.length}</strong> of {DESTINATIONS.length} world destinations
              {activeFiltersCount > 0 && ` (${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''})`}
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Destination Cards */}
      <div className="mt-8">
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onOpenDetails={handleCardClick}
                onPlanHere={onPlanHere}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">
              No matching destinations found
            </h3>
            <p className="text-xs text-slate-500">
              We couldn't find any destinations matching your current combination of filters. Try broadening your criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
