/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EventType =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'engagement'
  | 'corporate'
  | 'festival'
  | 'community';

export type DestinationRegion =
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'Africa'
  | 'Other';

export type DestinationCategory =
  | 'Beaches and Islands'
  | 'Luxury Resorts'
  | 'Romantic Getaways'
  | 'Mountains and Nature'
  | 'Historic Landmarks'
  | 'Modern Cities'
  | 'Adventure Destinations'
  | 'Indian Wedding Destinations';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: DestinationRegion;
  category: DestinationCategory;
  headline: string;
  description: string;
  image: string;
  gallery: string[];
  estimatedCostTier: '$' | '$$' | '$$$' | '$$$$' | '$$$$$';
  estimatedEventBudgetRange: {
    minINR: number;
    maxINR: number;
    minUSD: number;
    maxUSD: number;
  };
  bestSeason: string;
  weatherNotes: string;
  recommendedEvents: EventType[];
  guestCapacityRange: {
    min: number;
    max: number;
  };
  venueTypes: string[];
  localCulturalTips: string[];
  accommodationGuide: string;
  travelPlanningTips: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  verifiedVenues: {
    name: string;
    type: string;
    capacity: number;
    priceEstimate: string;
  }[];
}

export type ExpenseCategory =
  | 'venue'
  | 'catering'
  | 'decoration'
  | 'photography'
  | 'entertainment'
  | 'travel'
  | 'accommodation'
  | 'invitations'
  | 'gifts'
  | 'equipment'
  | 'taxes_fees'
  | 'contingency';

export interface BudgetItem {
  id: string;
  category: ExpenseCategory;
  name: string;
  estimatedMinor: number; // In minor units (e.g. paise for INR, cents for USD)
  actualMinor: number;
  paidMinor: number;
  vendorId?: string;
  notes?: string;
  isConfirmed: boolean;
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  category: string;
  deadlineDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  assignedTo: string;
  status: TaskStatus;
  dependencies?: string[];
}

export type VendorStatus = 'inquired' | 'quoted' | 'booked' | 'paid';

export interface VendorContractChecklist {
  id: string;
  item: string;
  completed: boolean;
}

export interface VendorItem {
  id: string;
  name: string;
  category: ExpenseCategory | 'dj' | 'security' | 'stylist' | 'transport';
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  quoteMinor: number;
  paidMinor: number;
  status: VendorStatus;
  isVerified: boolean;
  notes: string;
  contractChecklist: VendorContractChecklist[];
}

export interface WeddingGuest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'invited' | 'attending' | 'declined';
  partySize: number;
  dietary: string;
  tableNumber?: string;
  roomAssigned?: string;
}

export interface CorporateSpeaker {
  id: string;
  name: string;
  topic: string;
  track: string;
  timeSlot: string;
  status: 'confirmed' | 'pending';
}

export interface VolunteerAssignment {
  id: string;
  volunteerName: string;
  role: string;
  shift: string;
  contactPhone: string;
  status: 'assigned' | 'checked_in';
}

export interface AIPlanSummary {
  recommendedDestinations: string[];
  costBreakdowns: {
    category: ExpenseCategory;
    estimateMinor: number;
    rationale: string;
  }[];
  assumptions: string[];
  economicalAlternative: string;
  balancedPlan: string;
  luxuryAlternative: string;
  timelineHighlights: string[];
  venueQuestions: string[];
  contingencyReserveMinor: number;
}

export interface EventPlan {
  id: string;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  destinationId: string;
  destinationName: string;
  guestCount: number;
  budgetCurrency: Currency;
  totalBudgetMinor: number;
  style: string;
  theme: string;
  culturalPreferences: string;
  dietaryPreferences: string;
  accessibilityRequirements: string;
  indoorOutdoor: 'indoor' | 'outdoor' | 'hybrid';
  status: 'planning' | 'confirmed' | 'completed';
  createdAt: string;
  updatedAt: string;

  budgetItems: BudgetItem[];
  timelineTasks: TimelineTask[];
  vendors: VendorItem[];
  savedInspirationIds: string[];

  // Event-specific details
  weddingDetails?: {
    brideGroomNames: string;
    ceremonyTimeline: string[];
    invitationWording: string;
    guests: WeddingGuest[];
  };
  birthdayDetails?: {
    celebrantName: string;
    celebrantAge: number;
    cakeFlavor: string;
    activities: string[];
  };
  corporateDetails?: {
    companyName: string;
    conferenceTracks: string[];
    speakers: CorporateSpeaker[];
    registrationChecklist: string[];
  };
  communityDetails?: {
    festivalName: string;
    safetyChecklist: string[];
    sponsorshipGoalMinor: number;
    sponsorshipRaisedMinor: number;
    volunteers: VolunteerAssignment[];
  };

  aiPlanSummary?: AIPlanSummary;
}

export interface ThemeInspiration {
  id: string;
  title: string;
  eventType: EventType;
  category: string;
  image: string;
  prompt: string;
  colorPalette: {
    name: string;
    hex: string;
  }[];
  tags: string[];
  description: string;
}
