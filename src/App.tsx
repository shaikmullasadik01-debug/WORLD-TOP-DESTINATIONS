/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EventProvider, useEventContext } from './context/EventContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DestinationExplorer } from './components/DestinationExplorer';
import { DestinationModal } from './components/DestinationModal';
import { AIPlannerWizard } from './components/AIPlannerWizard';
import { EventWorkspace } from './components/EventWorkspace';
import { ThemeStudio } from './components/ThemeStudio';
import { BudgetManager } from './components/BudgetManager';
import { VendorManager } from './components/VendorManager';
import { Footer } from './components/Footer';
import { Destination } from './types';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedDestinationModal,
    setSelectedDestinationModal,
  } = useEventContext();

  const [preselectedDestination, setPreselectedDestination] = useState<Destination | null>(null);
  const [explorerCategoryFilter, setExplorerCategoryFilter] = useState<string>('All');

  const handlePlanHere = (destination: Destination) => {
    setPreselectedDestination(destination);
    setActiveTab('ai-planner');
  };

  const handleHeroCategoryFilter = (category: string) => {
    setExplorerCategoryFilter(category);
    setActiveTab('destinations');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'destinations' && (
          <div>
            <HeroSection onFilterCategory={handleHeroCategoryFilter} />
            <DestinationExplorer
              onPlanHere={handlePlanHere}
              onOpenDetails={(dest) => setSelectedDestinationModal(dest)}
              initialCategory={explorerCategoryFilter}
            />
          </div>
        )}

        {activeTab === 'ai-planner' && (
          <AIPlannerWizard
            initialDestination={preselectedDestination}
            onPlanCreated={() => setActiveTab('events')}
          />
        )}

        {activeTab === 'events' && <EventWorkspace />}

        {activeTab === 'theme-studio' && <ThemeStudio />}

        {activeTab === 'budget' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="pb-6 border-b border-slate-200 mb-8 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 block mb-1">
                Financial Control & Ledger
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Budget Management
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real integer-safe minor unit accounting. Track estimates vs confirmed vendor quotations.
              </p>
            </div>
            <BudgetManager />
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="pb-6 border-b border-slate-200 mb-8 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 block mb-1">
                Contract Management
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Verified Vendor Directory
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Track deliverables, deposit schedules, and verified suppliers across all major categories.
              </p>
            </div>
            <VendorManager />
          </div>
        )}
      </main>

      {/* Global Destination Detail Modal */}
      <DestinationModal
        destination={selectedDestinationModal}
        onClose={() => setSelectedDestinationModal(null)}
        onPlanEvent={handlePlanHere}
      />

      {/* Quiet Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <EventProvider>
      <MainAppContent />
    </EventProvider>
  );
}
