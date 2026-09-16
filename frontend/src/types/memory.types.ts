import { User } from "./auth.types";
import { Journey } from "./journey.types";

// ============================================
// MEMORY
// ============================================

export interface Memory {
  _id: string;

  caption: string;
  story?: string;

  imageUrl?: string;

  images?: string[];

  media?: string[];

  location?: string;

  memoryDate: string;

  journey: Journey | string;

  uploadedBy: User | string;

  // Populated virtual (see Memory.model.js) - this is what the API
  // actually fills in with uploader details, not `uploadedBy`.
  uploader?: User;

  tags: string[];

  createdAt: string;
  updatedAt: string;
}

// ============================================
// CREATE MEMORY
// ============================================

export interface CreateMemoryData {
  caption: string;

  story?: string;

  location?: string;

  memoryDate: string;

  journeyId: string;

  tags?: string[];
}

// ============================================
// UPDATE MEMORY
// ============================================

export interface UpdateMemoryData {
  caption?: string;

  story?: string;

  location?: string;

  memoryDate?: string;

  tags?: string[];
}

// ============================================
// MEMORY VARIANTS
// ============================================

export interface PhotoMemory extends Memory {
  imageUrl: string;
}

export interface StoryMemory extends Memory {
  story: string;
}

// ============================================
// MEMORY COMMENT
// ============================================

export interface MemoryComment {
  _id: string;

  memoryId: string;

  authorId: User | string;

  text: string;

  createdAt: string;
}

// ============================================
// MEMORY REACTION
// ============================================

export interface MemoryReaction {
  _id: string;

  memoryId: string;

  userId: User | string;

  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad';

  createdAt: string;
}

// ============================================
// MEMORY FILTERS
// ============================================

export interface MemoryFilters {
  journeyId?: string;

  tag?: string;

  search?: string;

  sortBy?: 'memoryDate' | 'createdAt';

  sortOrder?: 'asc' | 'desc';
}

// ============================================
// MEMORY STORE
// ============================================

export interface MemoryState {
  memories: Memory[];

  currentMemory: Memory | null;

  isLoading: boolean;

  error: string | null;
}