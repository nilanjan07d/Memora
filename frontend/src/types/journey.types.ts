import { User } from "./auth.types";

// ===============================
// Journey
// ===============================

export interface Journey {
  _id: string;

  title: string;
  description: string;

  coverImage?: string;
  location?: string;

  startDate: string;
  endDate: string;

  ownerId: User | string;

  members: { userId: User | string; role: 'admin' | 'member' | 'viewer'; joinedAt: string }[];

  memoryCount?: number;

  isPublic: boolean;

  createdAt: string;
  updatedAt: string;
}

// ===============================
// Create Journey
// ===============================

export interface CreateJourneyData {
  title: string;
  description: string;

  location?: string;

  startDate: string;
  endDate: string;

  isPublic?: boolean;
}

// ===============================
// Update Journey
// ===============================

export interface UpdateJourneyData {
  title?: string;
  description?: string;

  coverImage?: string;

  location?: string;

  startDate?: string;
  endDate?: string;

  isPublic?: boolean;
}

// ===============================
// Journey Member
// ===============================

export interface JourneyMember {
  _id: string;

  fullName: string;

  email: string;

  profilePicture?: string;
}

// ===============================
// Invite Member
// ===============================

export interface InviteMemberData {
  email: string;

  message?: string;
}

// ===============================
// Journey Filters
// ===============================

export interface JourneyFilters {
  status?: 'active' | 'completed' | 'archived';

  search?: string;

  sortBy?: 'createdAt' | 'startDate' | 'title';

  sortOrder?: 'asc' | 'desc';
}

// ===============================
// Journey Invite
// ===============================

export interface JourneyInvite {
  journeyId: string;

  email: string;

  message?: string;

  invitedAt: string;
}

// ===============================
// Journey Stats
// ===============================

export interface JourneyStats {
  memoryCount: number;

  memberCount: number;

  daysSinceStart?: number;
}

// ===============================
// Journey Store
// ===============================

export interface JourneyState {
  journeys: Journey[];

  currentJourney: Journey | null;

  isLoading: boolean;

  error: string | null;
}
