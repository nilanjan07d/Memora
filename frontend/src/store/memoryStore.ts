import { create } from "zustand";

import { memoryService } from "../services/memory.service";

import {
  Memory,
  MemoryState,
} from "../types/memory.types";

interface MemoryStore extends MemoryState {
  fetchJourneyMemories: (
    journeyId: string
  ) => Promise<void>;

  fetchMemory: (
    id: string
  ) => Promise<void>;

  addMemory: (
    journeyId: string,
    data: FormData
  ) => Promise<Memory>;

  updateMemory: (
    id: string,
    data: Partial<Memory>
  ) => Promise<void>;

  deleteMemory: (
    id: string
  ) => Promise<void>;

  clearCurrentMemory: () => void;

  clearError: () => void;
}

export const useMemoryStore =
  create<MemoryStore>((set, get) => ({
    // ======================================
    // STATE
    // ======================================

    memories: [],

    currentMemory: null,

    isLoading: false,

    error: null,

    // ======================================
    // FETCH JOURNEY MEMORIES
    // ======================================

    fetchJourneyMemories: async (
      journeyId: string
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response: any =
          await memoryService.getJourneyMemories(
            journeyId
          );

        set({
          memories: Array.isArray(response.data)
            ? response.data
            : [],

          isLoading: false,
        });
      } catch (error: any) {
        set({
          memories: [],

          isLoading: false,

          error:
            error.message ??
            "Failed to load memories",
        });

        throw error;
      }
    },

    // ======================================
    // FETCH SINGLE MEMORY
    // ======================================

    fetchMemory: async (
      id: string
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response: any =
          await memoryService.getOne(id);

        set({
          currentMemory: response.data,

          isLoading: false,
        });
      } catch (error: any) {
        set({
          currentMemory: null,

          isLoading: false,

          error:
            error.message ??
            "Failed to load memory",
        });

        throw error;
      }
    },
        // ======================================
    // ADD MEMORY
    // ======================================

    addMemory: async (
      journeyId: string,
      data: FormData
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response: any =
          await memoryService.create(
            journeyId,
            data
          );

        const newMemory = response.data;

        set((state) => ({
          memories: [newMemory, ...state.memories],

          currentMemory: newMemory,

          isLoading: false,
        }));

        return newMemory;
      } catch (error: any) {
        set({
          isLoading: false,

          error:
            error.message ??
            "Failed to create memory",
        });

        throw error;
      }
    },

    // ======================================
    // UPDATE MEMORY
    // ======================================

    updateMemory: async (
      id: string,
      data: Partial<Memory>
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response: any =
          await memoryService.update(
            id,
            data
          );

        const updatedMemory = response.data;

        set((state) => ({
          memories: state.memories.map((memory) =>
            memory._id === id
              ? updatedMemory
              : memory
          ),

          currentMemory:
            state.currentMemory?._id === id
              ? updatedMemory
              : state.currentMemory,

          isLoading: false,
        }));
      } catch (error: any) {
        set({
          isLoading: false,

          error:
            error.message ??
            "Failed to update memory",
        });

        throw error;
      }
    },

    // ======================================
    // DELETE MEMORY
    // ======================================

    deleteMemory: async (
      id: string
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        await memoryService.delete(id);

        set((state) => ({
          memories: state.memories.filter(
            (memory) =>
              memory._id !== id
          ),

          currentMemory:
            state.currentMemory?._id === id
              ? null
              : state.currentMemory,

          isLoading: false,
        }));
      } catch (error: any) {
        set({
          isLoading: false,

          error:
            error.message ??
            "Failed to delete memory",
        });

        throw error;
      }
    },

    // ======================================
    // UTILITIES
    // ======================================

    clearCurrentMemory: () => {
      set({
        currentMemory: null,
      });
    },

    clearError: () => {
      set({
        error: null,
      });
    },
  }));