import { apiClient } from "../api/client";
import {
  LoginCredentials,
  RegisterData,
  User,
} from "../types/auth.types";

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export const authService = {
  // Login
  async login(
    credentials: LoginCredentials
  ): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
  },

  // Register
  async register(
    data: RegisterData
  ): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>(
      "/auth/register",
      data
    );
  },

  // Current User
  async getCurrentUser(): Promise<{
    success: boolean;
    user: User;
  }> {
    return await apiClient.get("/auth/me");
  },

  // Update Profile
  async updateProfile(
    data: Partial<User>
  ): Promise<{
    success: boolean;
    user: User;
  }> {
    return await apiClient.put(
      "/auth/update",
      data
    );
  },

  // Local Logout
  async logout() {
    return Promise.resolve();
  },
};