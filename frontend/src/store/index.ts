// ============================================
// EXPORT ALL STORES
// ============================================

export { useAuthStore } from "./authStore";
export { useJourneyStore } from "./journeyStore";
export { useMemoryStore } from "./memoryStore";
export { useUIStore } from "./uiStore";

// ============================================
// EXPORT ALL TYPES
// ============================================

export type {
  AuthResponse,
  AuthState,
  AuthValidationErrors,
  LoginCredentials,
  RegisterData,
  User,
  UserProfile
} from "../types/auth.types";

export type {
  CreateJourneyData,
  InviteMemberData,
  Journey,
  JourneyFilters,
  JourneyInvite,
  JourneyMember,
  JourneyState,
  JourneyStats,
  UpdateJourneyData
} from "../types/journey.types";

export type {
  CreateMemoryData,
  Memory,
  MemoryComment,
  MemoryFilters,
  MemoryReaction,
  MemoryState,
  PhotoMemory,
  StoryMemory,
  UpdateMemoryData
} from "../types/memory.types";

export type {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  HealthCheck,
  Notification,
  PaginatedResponse,
  PaginationParams,
  SearchParams,
  SearchResult,
  UploadProgress,
  UploadResponse
} from "../types/api.types";

// ============================================
// RE-EXPORT COMMON TYPES
// ============================================

export * from "../types/api.types";
export * from "../types/auth.types";
export * from "../types/journey.types";
export * from "../types/memory.types";