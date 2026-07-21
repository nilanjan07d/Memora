import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { router } from "expo-router";

// CONFIGURATION

const API_TIMEOUT = 30000;

const getBaseURL = () => {
  if (__DEV__) {
    // Use your computer's IP address (192.168.0.101)
    return "http://192.168.0.101:5000/api/v1";
  }
  
  return "https://api.memora.com/api/v1";
};

// TOKEN STORAGE

const TOKEN_KEY = "memora_token";

export const tokenManager = {
  async getToken(): Promise<string |null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async removeToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

// API ERROR

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);

    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

const handleApiError = (error: AxiosError): never => {
  console.log("STATUS:", error.response?.status);
  console.log("DATA:", error.response?.data);

  if (error.response) {
    throw new ApiError(
      error.response.status,
      (error.response.data as any)?.message || error.message,
      error.response.data
    );
  }

  if (error.request) {
    throw new ApiError(0, "Unable to connect to server.");
  }

  throw new ApiError(0, error.message);
};

// API CLIENT
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getBaseURL(),
      timeout: API_TIMEOUT,

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    this.initializeInterceptors();
  }

  // INTERCEPTORS

private initializeInterceptors() {
  this.client.interceptors.request.use(
    async (config) => {
      const token = await tokenManager.getToken();
      
      // Add this for debugging
      console.log('🔑 Token found:', token ? 'Yes' : 'No');
      console.log('📡 Request URL:', config.url);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to headers');
      } else {
        console.log('❌ No token available');
      }
      
      config.headers["X-Platform"] = Platform.OS;
      
      if (__DEV__) {
        console.log(
          `🚀 ${config.method?.toUpperCase()} ${config.url}`
        );
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

    this.client.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log(
            `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`
          );
        }

        return response;
      },

      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await tokenManager.removeToken();

          router.replace("/(auth)/login");
        }

        return Promise.reject(handleApiError(error));
      }
    );
  }
  // HTTP METHODS

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // FILE UPLOAD

  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      headers: {
        // React Native needs this to override the client's JSON default.
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          const progress = Math.round(
            (event.loaded * 100) / event.total
          );

          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // DOWNLOAD

  async download(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Blob>> {
    return this.client.get(url, {
      ...config,
      responseType: "blob",
    });
  }

  // UTILITIES

  static buildQueryString(params: Record<string, any>) {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    );

    return new URLSearchParams(filtered).toString();
  }

  static isSuccess(status: number) {
    return status >= 200 && status < 300;
  }

  static getErrorMessage(error: any): string {
    if (error instanceof ApiError) {
      return error.message;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.message) {
      return error.message;
    }

    return "Something went wrong.";
  }
}

// EXPORT

export const apiClient = new ApiClient();

export type {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
};
