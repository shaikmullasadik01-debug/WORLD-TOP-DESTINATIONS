/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useEventContext } from '../context/EventContext';
import { BudgetManager } from './BudgetManager';
import { TimelineManager } from './TimelineManager';
import { VendorManager } from './VendorManager';
import { ExportDossierModal } from './ExportDossierModal';
import { WeddingGuest, CorporateSpeaker, VolunteerAssignment } from '../types';
import { formatMoney } from '../utils/currency';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Heart,
  Briefcase,
  Cake,
  Flag,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const EventWorkspace: React.FC = () => {
  const {
    events,
    activeEventId,
    setActiveEventId,
    activeEvent,
    activeCurrency,
    totalEstimatedMinor,
    totalActualMinor,
    remainingBudgetMinor,
    percentSpent,
    completedTasksCount,
    totalTasksCount,
    updateEvent,
    deleteEvent,
    setActiveTab,
  } = useEventContext();

  const [workspaceTab, setWorkspaceTab] = useState<
    'overview' | 'budget' | 'timeline' | 'vendors' | 'specialized'
  >('overview');

  const [showExportModal, setShowExportModal] = useState(false);

  // Specialized Planner Sub-states
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestDietary, setNewGuestDietary] = useState('Vegetarian');
  const [newGuestPartySize, setNewGuestPartySize] = useState(1);
  const [newGuestTable, setNewGuestTable] = useState('Table 1');

  if (!activeEvent) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <h3 className="text-xl font-serif font-bold text-slate-900">No Events in Workspace</h3>
        <p className="text-xs text-slate-500">
          Create an event using the AI Planner or start with our curated templates.
        </p>
        <button
          onClick={() => setActiveTab('ai-planner')}
          className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl"
        >
          Launch AI Planner
        </button>
      </div>
    );
  }

  // Countdown Calculation
  const daysUntilEvent = useMemo(() => {
    const target = new Date(activeEvent.date).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  }, [activeEvent.date]);

  // Guest Management handlers for Weddings
  const handleAddWeddingGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const currentGuests = activeEvent.weddingDetails?.guests || [];
    const newGuest: WeddingGuest = {
      id: `guest-${Date.now()}`,
      name: newGuestName.trim(),
      partySize: newGuestPartySize,
      dietary: newGuestDietary,
      tableNumber: newGuestTable,
      status: 'attending',
    };

    updateEvent(activeEvent.id, {
      weddingDetails: {
        ...(activeEvent.weddingDetails || {
          brideGroomNames: '',
          ceremonyTimeline: [],
          invitationWording: '',
          guests: [],
        }),
        guests: [...currentGuests, newGuest],
      },
    });

    setNewGuestName('');
  };

  const handleDeleteWeddingGuest = (guestId: string) => {
    const currentGuests = activeEvent.weddingDetails?.guests || [];
    updateEvent(activeEvent.id, {
      weddingDetails: {
        ...activeEvent.weddingDetails!,
        guests: currentGuests.filter((g) => g.id !== guestId),
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Event Selector Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">Workspace:</span>
          {events.map((ev) => (
            <button
              key={ev.id}
              onClick={() => setActiveEventId(ev.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                activeEventId === ev.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {ev.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Dossier</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-planner')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Active Event Banner & Countdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            {activeEvent.type === 'wedding' ? (
              <Heart className="w-3.5 h-3.5" />
            ) : activeEvent.type === 'corporate' ? (
              <Briefcase className="w-3.5 h-3.5" />
            ) : activeEvent.type === 'birthday' ? (
              <Cake className="w-3.5 h-3.5" />
            ) : (
              <Flag className="w-3.5 h-3.5" />
            )}
            <span className="capitalize">{activeEvent.type} Event Workspace</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold">Active Planning</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            {activeEvent.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeEvent.date}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeEvent.destinationName}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeEvent.guestCount} Guests</span>
            </span>
          </div>
        </div>

        {/* Countdown Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0">
          <Clock className="w-8 h-8 text-amber-600 shrink-0" />
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tabular-nums">
              {daysUntilEvent > 0 ? daysUntilEvent : 0}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {daysUntilEvent > 0 ? 'Days Until Celebration' : 'Event Day / Completed'}
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-0 scrollbar-none">
        {[
          { id: 'overview', label: 'Executive Overview' },
          { id: 'specialized', label: `${activeEvent.type.charAt(0).toUpperCase() + activeEvent.type.slice(1)} Specialization` },
          { id: 'budget', label: 'Budget & Finances' },
          { id: 'timeline', label: `Timeline (${completedTasksCount}/${totalTasksCount})` },
          { id: 'vendors', label: `Vendors (${activeEvent.vendors.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setWorkspaceTab(tab.id as any)}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              workspaceTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {workspaceTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 block">Total Budget Committed</span>
              <div className="text-xl font-bold font-serif text-slate-900 tabular-nums">
                {formatMoney(totalActualMinor, activeCurrency)}
              </div>
              <span className="text-xs text-slate-500">
                Of {formatMoney(activeEvent.totalBudgetMinor, activeCurrency)} ({percentSpent}%)
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 block">Milestones Completed</span>
              <div className="text-xl font-bold font-serif text-slate-900 tabular-nums">
                {completedTasksCount} / {totalTasksCount}
              </div>
              <span className="text-xs text-slate-500">
                {totalTasksCount - completedTasksCount} pending items
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 block">Confirmed Vendors</span>
              <div className="text-xl font-bold font-serif text-slate-900 tabular-nums">
                {activeEvent.vendors.length} Partners
              </div>
              <span className="text-xs text-slate-500">Decor, Catering, Venue</span>
            </div>
          </div>

          {/* Theme & Logistics Summary */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900">
              Style, Cultural & Dietary Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-900 block">Style & Aesthetics:</span>
                <p>{activeEvent.style} · Palette: {activeEvent.theme}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-900 block">Cultural Rituals:</span>
                <p>{activeEvent.culturalPreferences || 'Standard international ceremony protocol'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-900 block">Food & Dietary:</span>
                <p>{activeEvent.dietaryPreferences || 'Standard banquet catering'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-900 block">Accessibility & Setting:</span>
                <p>{activeEvent.accessibilityRequirements || 'Standard venue accessibility'} ({activeEvent.indoorOutdoor})</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Specialized Event Modules */}
      {workspaceTab === 'specialized' && (
        <div className="space-y-6">
          {/* WEDDING MODULE */}
          {activeEvent.type === 'wedding' && (
            <div className="space-y-6">
              {/* Couple & Timeline */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Wedding Ceremony Timeline & Details
                </h3>
                {activeEvent.weddingDetails?.brideGroomNames && (
                  <div className="text-xs font-semibold text-amber-700">
                    Couple: {activeEvent.weddingDetails.brideGroomNames}
                  </div>
                )}
                <div className="space-y-2">
                  {(activeEvent.weddingDetails?.ceremonyTimeline || [
                    '09:00 AM - Bridal suite preparation & photographer arrival',
                    '03:00 PM - Guest welcome drinks & acoustic prelude',
                    '04:30 PM - Ceremony vows & exchange of rings / garlands',
                    '06:00 PM - Sunset cocktail hour & live entertainment',
                    '07:30 PM - Grand dinner reception & speeches',
                  ]).map((t, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                      {t}
                    </div>
                  ))}
                </div>

                {/* Invitation wording */}
                {activeEvent.weddingDetails?.invitationWording && (
                  <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
                    <span className="font-bold block">Digital Invitation Wording:</span>
                    <p className="italic">"{activeEvent.weddingDetails.invitationWording}"</p>
                  </div>
                )}
              </div>

              {/* Guest List & Table Seating */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Guest List, RSVP & Table Seating
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {activeEvent.weddingDetails?.guests?.length || 0} RSVPs logged
                  </span>
                </div>

                {/* Add Guest Form */}
                <form onSubmit={handleAddWeddingGuest} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Guest / Family Name..."
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newGuestPartySize}
                      onChange={(e) => setNewGuestPartySize(parseInt(e.target.value) || 1)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                      title="Party Size"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Table (e.g. Table 1)"
                      value={newGuestTable}
                      onChange={(e) => setNewGuestTable(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="p-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Guest</span>
                  </button>
                </form>

                {/* Guest Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Guest / Family Name</th>
                        <th className="py-2.5 px-3 text-center">Party Size</th>
                        <th className="py-2.5 px-3">Table Seating</th>
                        <th className="py-2.5 px-3">Dietary</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(activeEvent.weddingDetails?.guests || []).map((g) => (
                        <tr key={g.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{g.name}</td>
                          <td className="py-2.5 px-3 text-center tabular-nums">{g.partySize}</td>
                          <td className="py-2.5 px-3 text-slate-600">{g.tableNumber || 'Unassigned'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{g.dietary}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteWeddingGuest(g.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CORPORATE MODULE */}
          {activeEvent.type === 'corporate' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Keynote Speakers & Conference Tracks
                </h3>
                <div className="space-y-3">
                  {(activeEvent.corporateDetails?.speakers || []).map((sp) => (
                    <div key={sp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 text-sm">{sp.name}</span>
                        <div className="text-slate-600">{sp.topic}</div>
                        <div className="text-slate-400 font-medium">Track: {sp.track}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-800">{sp.timeSlot}</span>
                        <span className="block text-emerald-700 capitalize font-medium">{sp.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* OTHER EVENT TYPES */}
          {activeEvent.type !== 'wedding' && activeEvent.type !== 'corporate' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-lg text-slate-900 capitalize">
                {activeEvent.type} Specific Program & Activities
              </h3>
              <p className="text-xs text-slate-600">
                Curated schedules and specialty checklists for this celebration in {activeEvent.destinationName}.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2">
                <span className="font-semibold text-slate-900 block">Activity Schedule</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>04:00 PM - Welcome refreshments and guest registration</li>
                  <li>05:30 PM - Primary celebratory remarks and entertainment</li>
                  <li>07:00 PM - Gala banquet and celebration toast</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Budget Manager */}
      {workspaceTab === 'budget' && <BudgetManager />}

      {/* Tab 4: Timeline Manager */}
      {workspaceTab === 'timeline' && <TimelineManager />}

      {/* Tab 5: Vendor Manager */}
      {workspaceTab === 'vendors' && <VendorManager />}

      {/* Export Dossier Modal */}
      {showExportModal && <ExportDossierModal onClose={() => setShowExportModal(false)} />}
    </div>
  );
};
