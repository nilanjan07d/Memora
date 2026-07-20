import { apiClient } from "../api/client";
import { Journey } from "../types/journey.types";

export const journeyService = {
  async getAll() {
    return await apiClient.get("/journeys");
  },

  async getOne(id: string) {
    return await apiClient.get(`/journeys/${id}`);
  },

  async create(data: FormData) {
    return await apiClient.upload("/journeys", data);
  },

  async update(id: string, data: Partial<Journey>) {
    return await apiClient.put(`/journeys/${id}`, data);
  },

  async delete(id: string) {
    return await apiClient.delete(`/journeys/${id}`);
  },

  async inviteMember(
    journeyId: string,
    email: string,
    message?: string
  ) {
    return await apiClient.post(
      `/journeys/${journeyId}/invite`,
      {
        email,
        message,
      }
    );
  },

  async removeMember(
    journeyId: string,
    userId: string
  ) {
    return await apiClient.delete(
      `/journeys/${journeyId}/members/${userId}`
    );
  },
};