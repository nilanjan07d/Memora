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
    (set) => ({
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
          const response = await authService.login({
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password,
          });

          await tokenManager.setToken(response.token);

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const message =
            error?.message || "Unable to login. Please try again.";

          set({
            isLoading: false,
            error: message,
          });

          throw new Error(message);
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
          const response = await authService.register({
            ...data,
            fullName: data.fullName.trim(),
            email: data.email.trim().toLowerCase(),
          });

          await tokenManager.setToken(response.token);

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const message =
            error?.message || "Unable to create account. Please try again.";

          set({
            isLoading: false,
            error: message,
          });

          throw new Error(message);
        }
      },

      // ==========================
      // RESTORE SESSION
      // ==========================

      loadUser: async () => {
        try {
          const token = await tokenManager.getToken();

          if (!token) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });

            return;
          }

          const response = await authService.getCurrentUser();

          set({
            user: response.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          await tokenManager.removeToken();

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
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
          isLoading: false,
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

      // ==========================
      // CLEAR ERROR
      // ==========================

      clearError: () => {
        set({
          error: null,
        });
      },
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),

      // Do NOT persist the token here.
      // The actual JWT is stored securely using Expo SecureStore.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);