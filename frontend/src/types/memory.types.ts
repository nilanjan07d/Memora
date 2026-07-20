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
// MEMORY STORE
// ============================================

export interface MemoryState {
  memories: Memory[];

  currentMemory: Memory | null;

  isLoading: boolean;

  error: string | null;
}