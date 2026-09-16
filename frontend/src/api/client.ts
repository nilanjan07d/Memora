import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';

const API_TIMEOUT = 30000;
const TOKEN_KEY = 'memora_token';
// Keep the existing production endpoint. Local Expo can point at the same API.
const getBaseURL = () => 'https://memora-7o48.onrender.com/api/v1';

export const tokenManager = {
  async getToken(): Promise<string | null> { try { return await SecureStore.getItemAsync(TOKEN_KEY); } catch { return null; } },
  async setToken(token: string) { await SecureStore.setItemAsync(TOKEN_KEY, token); },
  async removeToken() { await SecureStore.deleteItemAsync(TOKEN_KEY); },
};

export class ApiError extends Error { constructor(public status: number, message: string, public data?: unknown) { super(message); this.name = 'ApiError'; } }
const asApiError = (error: AxiosError): ApiError => {
  if (error.response) return new ApiError(error.response.status, (error.response.data as { message?: string })?.message || error.message, error.response.data);
  return new ApiError(0, error.request ? 'Unable to reach the server. Check your connection and try again.' : error.message || 'Something went wrong.');
};

class ApiClient {
  private client: AxiosInstance;
  constructor() {
    this.client = axios.create({ baseURL: getBaseURL(), timeout: API_TIMEOUT, headers: { Accept: 'application/json', 'Content-Type': 'application/json' } });
    this.client.interceptors.request.use(async (config) => { const token = await tokenManager.getToken(); if (token) config.headers.Authorization = `Bearer ${token}`; config.headers['X-Platform'] = Platform.OS; return config; });
    this.client.interceptors.response.use((response) => response, async (error: AxiosError) => {
      const message = (error.response?.data as { message?: string })?.message || '';
      const url = error.config?.url || '';
      if (error.response?.status === 401 && !url.includes('/auth/login') && /not authorized|token|account is deactivated/i.test(message)) { await tokenManager.removeToken(); router.replace('/(auth)/login'); }
      return Promise.reject(asApiError(error));
    });
  }
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> { return (await this.client.get<T>(url, config)).data; }
  async post<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> { return (await this.client.post<T>(url, data, config)).data; }
  async put<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> { return (await this.client.put<T>(url, data, config)).data; }
  async patch<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> { return (await this.client.patch<T>(url, data, config)).data; }
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> { return (await this.client.delete<T>(url, config)).data; }
  async upload<T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> { return (await this.client.post<T>(url, formData, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: (event) => { if (event.total) onProgress?.(Math.round(event.loaded * 100 / event.total)); } })).data; }
  static getErrorMessage(error: unknown) { return error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Something went wrong.'; }
}
export const apiClient = new ApiClient();
export type { AxiosRequestConfig, AxiosResponse, AxiosError };
