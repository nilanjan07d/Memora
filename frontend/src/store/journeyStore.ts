import { create } from "zustand";

import { journeyService } from "../services/journey.service";

import {
  Journey,
  JourneyState,
  InviteMemberData,
} from "../types/journey.types";

interface JourneyStore extends JourneyState {
  fetchJourneys: () => Promise<void>;

  fetchJourney: (id: string) => Promise<void>;

  createJourney: (data: FormData) => Promise<Journey>;

  updateJourney: (
    id: string,
    data: Partial<Journey>
  ) => Promise<void>;

  deleteJourney: (id: string) => Promise<void>;

  inviteMember: (
    journeyId: string,
    email: string,
    message?: string
  ) => Promise<void>;

  removeMember: (
    journeyId: string,
    userId: string
  ) => Promise<void>;

  clearCurrentJourney: () => void;

  clearError: () => void;
}

export const useJourneyStore =
  create<JourneyStore>((set, get) => ({
    // ======================================
    // STATE
    // ======================================

    journeys: [],

    currentJourney: null,

    isLoading: false,

    error: null,

    // ======================================
    // FETCH ALL JOURNEYS
    // ======================================

    fetchJourneys: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response: any =
          await journeyService.getAll();

        set({
          journeys: Array.isArray(response.data)
            ? response.data
            : [],

          isLoading: false,
        });
      } catch (error: any) {
        set({
          journeys: [],

          isLoading: false,

          error:
            error.message ??
            "Failed to load journeys",
        });
      }
    },

    // ======================================
    // FETCH SINGLE JOURNEY
    // ======================================

    fetchJourney: async (id: string) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response: any =
          await journeyService.getOne(id);

        const journey =
          response.data?.data ??
          response.data?.journey ??
          response.data;

        set({
          currentJourney: journey,

          isLoading: false,
        });
      } catch (error: any) {
        set({
          currentJourney: null,

          isLoading: false,

          error:
            error.message ??
            "Failed to load journey",
        });
      }
    },
        // ======================================
    // CREATE JOURNEY
    // ======================================

    createJourney: async (data: FormData) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response: any =
          await journeyService.create(data);

        const newJourney =
          response.data?.data ??
          response.data?.journey ??
          response.data;
        set((state) => ({
          journeys: [newJourney, ...state.journeys],
          currentJourney: newJourney,
          isLoading: false,
        }));

        return newJourney;
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error.message ??
            "Failed to create journey",
        });

        throw error;
      }
    },

    // ======================================
    // UPDATE JOURNEY
    // ======================================

    updateJourney: async (
      id: string,
      data: Partial<Journey>
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response: any =
          await journeyService.update(id, data);

        const updatedJourney = response.data;

        set((state) => ({
          journeys: state.journeys.map((journey) =>
            journey._id === id
              ? updatedJourney
              : journey
          ),

          currentJourney:
            state.currentJourney?._id === id
              ? updatedJourney
              : state.currentJourney,

          isLoading: false,
        }));
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error.message ??
            "Failed to update journey",
        });

        throw error;
      }
    },

    // ======================================
    // DELETE JOURNEY
    // ======================================

    deleteJourney: async (id: string) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        await journeyService.delete(id);

        set((state) => ({
          journeys: state.journeys.filter(
            (journey) => journey._id !== id
          ),

          currentJourney:
            state.currentJourney?._id === id
              ? null
              : state.currentJourney,

          isLoading: false,
        }));
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error.message ??
            "Failed to delete journey",
        });

        throw error;
      }
    },

    // ======================================
    // INVITE MEMBER
    // ======================================

    inviteMember: async (
      journeyId: string,
      email: string,
      message?: string
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        await journeyService.inviteMember(
          journeyId,
          email,
          message
        );

        await get().fetchJourney(journeyId);

        set({
          isLoading: false,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error.message ??
            "Failed to invite member",
        });

        throw error;
      }
    },

    // ======================================
    // REMOVE MEMBER
    // ======================================

    removeMember: async (
      journeyId: string,
      userId: string
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        await journeyService.removeMember(
          journeyId,
          userId
        );

        await get().fetchJourney(journeyId);

        set({
          isLoading: false,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error.message ??
            "Failed to remove member",
        });

        throw error;
      }
    },

    // ======================================
    // UTILITIES
    // ======================================

    clearCurrentJourney: () => {
      set({
        currentJourney: null,
      });
    },

    clearError: () => {
      set({
        error: null,
      });
    },
  }));