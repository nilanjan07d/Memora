import { User } from "./auth.types";
import { Memory } from "./memory.types";

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

  owner: User | string;

  members: User[];

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
// Journey Store
// ===============================

export interface JourneyState {
  journeys: Journey[];

  currentJourney: Journey | null;

  isLoading: boolean;

  error: string | null;
}