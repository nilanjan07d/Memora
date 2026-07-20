// ============================================
// USER TYPES
// ============================================

export interface User {
  _id: string;
  fullName: string;
  email: string;
  username?: string;
  profilePicture: string;
  bio: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  fullName: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  journeyCount: number;
  memoryCount: number;
  memberCount: number;
  createdAt: Date;
}

// ============================================
// AUTH TYPES
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// ============================================
// PASSWORD RESET
// ============================================

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
  confirm_password: string;
}

// ============================================
// SOCIAL AUTH
// ============================================

export interface GoogleAuthData {
  id_token: string;
  access_token?: string;
}

export interface AppleAuthData {
  identity_token: string;
  authorization_code: string;
}

// ============================================
// AUTH STATE
// ============================================

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// VALIDATION
// ============================================

export interface AuthValidationErrors {
  email?: string;
  password?: string;
  fullName?: string;
  username?: string;
  confirmPassword?: string;
}

// ============================================
// EMAIL VERIFICATION
// ============================================

export interface VerifyEmailData {
  token: string;
}

export interface ResendVerificationData {
  email: string;
}