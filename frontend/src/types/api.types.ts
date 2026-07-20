// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: number;
  timestamp: string;
  path?: string;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  path?: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T = any> {
  data: T;
  message: string;
  status: number;
  timestamp: string;
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ============================================
// UPLOAD TYPES
// ============================================

export interface UploadResponse {
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

// ============================================
// SEARCH TYPES
// ============================================

export interface SearchResult {
  id: number;
  type: 'journey' | 'memory' | 'user';
  title: string;
  description?: string;
  image?: string;
  url: string;
  relevance: number;
}

export interface SearchParams {
  query: string;
  type?: 'journey' | 'memory' | 'user' | 'all';
  limit?: number;
  page?: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: number;
  type: 'memory_added' | 'member_joined' | 'comment' | 'like' | 'mention' | 'invite';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

export interface NotificationSettings {
  newMemory: boolean;
  newMember: boolean;
  comments: boolean;
  likes: boolean;
  mentions: boolean;
  invites: boolean;
  weeklyDigest: boolean;
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface WebhookEvent {
  event: string;
  data: Record<string, any>;
  timestamp: string;
  signature?: string;
}

// ============================================
// HEALTH CHECK
// ============================================

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  timestamp: string;
  services?: {
    database: 'up' | 'down';
    cache: 'up' | 'down';
    storage: 'up' | 'down';
  };
  version: string;
}

// ============================================
// METADATA
// ============================================

export interface Metadata {
  total: number;
  filtered: number;
  queryTime: number;
  cacheHit: boolean;
}

export interface ErrorMetadata {
  code: string;
  details?: Record<string, any>;
  stack?: string;
}