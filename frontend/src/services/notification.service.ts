import { apiClient } from '../api/client';
export const notificationService = {
  getAll: () => apiClient.get('/notifications'),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  respond: (id: string, action: 'accept' | 'reject') => apiClient.post(`/notifications/${id}/respond`, { action }),
};
