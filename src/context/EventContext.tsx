/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  EventPlan,
  BudgetItem,
  TimelineTask,
  VendorItem,
  Destination,
  Currency,
} from '../types';
import { INITIAL_EVENTS } from '../data/initialData';
import { sumMinor } from '../utils/currency';

export type AppTab =
  | 'destinations'
  | 'ai-planner'
  | 'events'
  | 'theme-studio'
  | 'budget'
  | 'timeline'
  | 'vendors';

interface EventContextType {
  events: EventPlan[];
  activeEventId: string | null;
  activeEvent: EventPlan | null;
  favoriteDestinationIds: string[];
  recentDestinationIds: string[];
  activeCurrency: Currency;
  activeTab: AppTab;
  selectedDestinationModal: Destination | null;

  setActiveTab: (tab: AppTab) => void;
  setActiveEventId: (id: string) => void;
  setActiveCurrency: (currency: Currency) => void;
  setSelectedDestinationModal: (dest: Destination | null) => void;
  toggleFavoriteDestination: (destinationId: string) => void;
  recordRecentDestination: (destinationId: string) => void;

  createEvent: (eventData: Partial<EventPlan>) => string;
  updateEvent: (eventId: string, updates: Partial<EventPlan>) => void;
  deleteEvent: (eventId: string) => void;

  // Budget operations
  addBudgetItem: (eventId: string, item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (eventId: string, itemId: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (eventId: string, itemId: string) => void;

  // Task operations
  addTask: (eventId: string, task: Omit<TimelineTask, 'id'>) => void;
  updateTask: (eventId: string, taskId: string, updates: Partial<TimelineTask>) => void;
  deleteTask: (eventId: string, taskId: string) => void;
  toggleTaskComplete: (eventId: string, taskId: string) => void;

  // Vendor operations
  addVendor: (eventId: string, vendor: Omit<VendorItem, 'id'>) => void;
  updateVendor: (eventId: string, vendorId: string, updates: Partial<VendorItem>) => void;
  deleteVendor: (eventId: string, vendorId: string) => void;

  // Computed totals for active event
  totalEstimatedMinor: number;
  totalActualMinor: number;
  totalPaidMinor: number;
  remainingBudgetMinor: number;
  isOverBudget: boolean;
  overbudgetAmountMinor: number;
  percentSpent: number;
  unpaidVendorDepositsMinor: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const STORAGE_KEY_EVENTS = 'ai_event_planner_events_v2';
const STORAGE_KEY_FAVORITES = 'ai_event_planner_favorites_v2';
const STORAGE_KEY_RECENTS = 'ai_event_planner_recents_v2';
const STORAGE_KEY_CURRENCY = 'ai_event_planner_currency_v2';

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial events from localStorage or fallback to INITIAL_EVENTS
  const [events, setEvents] = useState<EventPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed reading events from storage', e);
    }
    return INITIAL_EVENTS;
  });

  const [activeEventId, setActiveEventId] = useState<string | null>(() => {
    return events.length > 0 ? events[0].id : null;
  });

  const [favoriteDestinationIds, setFavoriteDestinationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['udaipur-india', 'santorini-greece', 'bali-indonesia'];
  });

  const [recentDestinationIds, setRecentDestinationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['udaipur-india', 'tokyo-japan', 'paris-france'];
  });

  const [activeCurrency, setActiveCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENCY) as Currency;
      if (saved) return saved;
    } catch {}
    return 'INR';
  });

  const [activeTab, setActiveTab] = useState<AppTab>('destinations');
  const [selectedDestinationModal, setSelectedDestinationModal] = useState<Destination | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error('Failed persisting events to localStorage', e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favoriteDestinationIds));
    } catch {}
  }, [favoriteDestinationIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(recentDestinationIds));
    } catch {}
  }, [recentDestinationIds]);

  const setActiveCurrency = (curr: Currency) => {
    setActiveCurrencyState(curr);
    localStorage.setItem(STORAGE_KEY_CURRENCY, curr);
  };

  const activeEvent = useMemo(() => {
    return events.find((e) => e.id === activeEventId) || events[0] || null;
  }, [events, activeEventId]);

  const toggleFavoriteDestination = (destId: string) => {
    setFavoriteDestinationIds((prev) =>
      prev.includes(destId) ? prev.filter((id) => id !== destId) : [...prev, destId]
    );
  };

  const recordRecentDestination = (destId: string) => {
    setRecentDestinationIds((prev) => {
      const filtered = prev.filter((id) => id !== destId);
      return [destId, ...filtered].slice(0, 8);
    });
  };

  // Event CRUD
  const createEvent = (data: Partial<EventPlan>): string => {
    const id = `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newEvent: EventPlan = {
      id,
      title: data.title || 'My Dream Event',
      type: data.type || 'wedding',
      date: data.date || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      destinationId: data.destinationId || 'udaipur-india',
      destinationName: data.destinationName || 'Udaipur, India',
      guestCount: data.guestCount || 100,
      budgetCurrency: data.budgetCurrency || activeCurrency,
      totalBudgetMinor: data.totalBudgetMinor || 200000000,
      style: data.style || 'Elegant Luxury',
      theme: data.theme || 'Floral Sunset',
      culturalPreferences: data.culturalPreferences || '',
      dietaryPreferences: data.dietaryPreferences || '',
      accessibilityRequirements: data.accessibilityRequirements || '',
      indoorOutdoor: data.indoorOutdoor || 'hybrid',
      status: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      budgetItems: data.budgetItems || [],
      timelineTasks: data.timelineTasks || [],
      vendors: data.vendors || [],
      savedInspirationIds: data.savedInspirationIds || [],
      weddingDetails: data.weddingDetails,
      birthdayDetails: data.birthdayDetails,
      corporateDetails: data.corporateDetails,
      communityDetails: data.communityDetails,
      aiPlanSummary: data.aiPlanSummary,
    };

    setEvents((prev) => [newEvent, ...prev]);
    setActiveEventId(id);
    return id;
  };

  const updateEvent = (eventId: string, updates: Partial<EventPlan>) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => {
      const remaining = prev.filter((e) => e.id !== eventId);
      if (activeEventId === eventId) {
        setActiveEventId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  // Budget CRUD
  const addBudgetItem = (eventId: string, item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = {
      ...item,
      id: `budget-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              budgetItems: [...e.budgetItems, newItem],
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const updateBudgetItem = (eventId: string, itemId: string, updates: Partial<BudgetItem>) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              budgetItems: e.budgetItems.map((b) => (b.id === itemId ? { ...b, ...updates } : b)),
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const deleteBudgetItem = (eventId: string, itemId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              budgetItems: e.budgetItems.filter((b) => b.id !== itemId),
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  // Task CRUD
  const addTask = (eventId: string, task: Omit<TimelineTask, 'id'>) => {
    const newTask: TimelineTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              timelineTasks: [...e.timelineTasks, newTask],
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const updateTask = (eventId: string, taskId: string, updates: Partial<TimelineTask>) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              timelineTasks: e.timelineTasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const deleteTask = (eventId: string, taskId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              timelineTasks: e.timelineTasks.filter((t) => t.id !== taskId),
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const toggleTaskComplete = (eventId: string, taskId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              timelineTasks: e.timelineTasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      status: t.status === 'completed' ? 'todo' : 'completed',
                    }
                  : t
              ),
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  // Vendor CRUD
  const addVendor = (eventId: string, vendor: Omit<VendorItem, 'id'>) => {
    const newVendor: VendorItem = {
      ...vendor,
      id: `vendor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              vendors: [...e.vendors, newVendor],
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const updateVendor = (eventId: string, vendorId: string, updates: Partial<VendorItem>) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              vendors: e.vendors.map((v) => (v.id === vendorId ? { ...v, ...updates } : v)),
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const deleteVendor = (eventId: string, vendorId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              vendors: e.vendors.filter((v) => v.id !== vendorId),
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  };

  // Active event calculations
  const totalEstimatedMinor = useMemo(() => {
    if (!activeEvent) return 0;
    return sumMinor(activeEvent.budgetItems.map((b) => b.estimatedMinor));
  }, [activeEvent]);

  const totalActualMinor = useMemo(() => {
    if (!activeEvent) return 0;
    return sumMinor(activeEvent.budgetItems.map((b) => b.actualMinor));
  }, [activeEvent]);

  const totalPaidMinor = useMemo(() => {
    if (!activeEvent) return 0;
    return sumMinor(activeEvent.budgetItems.map((b) => b.paidMinor));
  }, [activeEvent]);

  const remainingBudgetMinor = useMemo(() => {
    if (!activeEvent) return 0;
    return activeEvent.totalBudgetMinor - totalActualMinor;
  }, [activeEvent, totalActualMinor]);

  const isOverBudget = remainingBudgetMinor < 0;
  const overbudgetAmountMinor = Math.max(0, -remainingBudgetMinor);

  const percentSpent = useMemo(() => {
    if (!activeEvent || activeEvent.totalBudgetMinor <= 0) return 0;
    return Math.min(100, Math.round((totalActualMinor / activeEvent.totalBudgetMinor) * 100));
  }, [activeEvent, totalActualMinor]);

  const unpaidVendorDepositsMinor = useMemo(() => {
    if (!activeEvent) return 0;
    return sumMinor(
      activeEvent.vendors.map((v) => Math.max(0, v.quoteMinor - v.paidMinor))
    );
  }, [activeEvent]);

  const completedTasksCount = useMemo(() => {
    if (!activeEvent) return 0;
    return activeEvent.timelineTasks.filter((t) => t.status === 'completed').length;
  }, [activeEvent]);

  const totalTasksCount = useMemo(() => {
    if (!activeEvent) return 0;
    return activeEvent.timelineTasks.length;
  }, [activeEvent]);

  return (
    <EventContext.Provider
      value={{
        events,
        activeEventId,
        activeEvent,
        favoriteDestinationIds,
        recentDestinationIds,
        activeCurrency,
        activeTab,
        selectedDestinationModal,
        setActiveTab,
        setActiveEventId,
        setActiveCurrency,
        setSelectedDestinationModal,
        toggleFavoriteDestination,
        recordRecentDestination,
        createEvent,
        updateEvent,
        deleteEvent,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addVendor,
        updateVendor,
        deleteVendor,
        totalEstimatedMinor,
        totalActualMinor,
        totalPaidMinor,
        remainingBudgetMinor,
        isOverBudget,
        overbudgetAmountMinor,
        percentSpent,
        unpaidVendorDepositsMinor,
        completedTasksCount,
        totalTasksCount,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export function useEventContext() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
}
