import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { authService } from "../services/auth.service";
import { tokenManager } from "../api/client";

import {
  LoginCredentials,
  RegisterData,
  User,
} from "../types/auth.types";

interface AuthState {
  user: User | null;
  token: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;

  updateUser: (user: Partial<User>) => void;

  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ==========================
      // LOGIN
      // ==========================

      login: async (credentials) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const response = await authService.login(credentials);

          await tokenManager.setToken(response.token);

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Login failed",
          });

          throw error;
        }
      },

      // ==========================
      // REGISTER
      // ==========================

      register: async (data) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const response = await authService.register(data);

          await tokenManager.setToken(response.token);

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Registration failed",
          });

          throw error;
        }
      },

      // ==========================
      // LOAD USER
      // ==========================

      loadUser: async () => {
        try {
          const token = await tokenManager.getToken();

          if (!token) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });

            return;
          }

          const response = await authService.getCurrentUser();

          set({
            user: response.user,
            token,
            isAuthenticated: true,
          });
        } catch {
          await tokenManager.removeToken();

          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      // ==========================
      // LOGOUT
      // ==========================

      logout: async () => {
        await tokenManager.removeToken();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // ==========================
      // UPDATE USER
      // ==========================

      updateUser: (userData) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...userData,
              }
            : null,
        }));
      },

      clearError: () =>
        set({
          error: null,
        }),
    }),

    {
      name: "auth-storage",

      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);