import { apiClient } from "../api/client";
import { Memory } from "../types/memory.types";

export const memoryService = {
  async getJourneyMemories(journeyId: string) {
    return await apiClient.get(`/memories/journey/${journeyId}`);
  },

  async getOne(id: string) {
    return await apiClient.get(`/memories/${id}`);
  },

  async create(journeyId: string, data: FormData) {
    return await apiClient.upload(
      `/memories/journey/${journeyId}`,
      data
    );
  },

  async update(
    id: string,
    data: Partial<Memory>
  ) {
    return await apiClient.put(
      `/memories/${id}`,
      data
    );
  },

  async delete(id: string) {
    return await apiClient.delete(
      `/memories/${id}`
    );
  },
};