import axios, { AxiosInstance } from "axios";
import { ApiResponse, PaginatedResponse } from "@types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://test.62344037.xyz/api";

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Recuperar token del localStorage si existe
    this.token = localStorage.getItem("token");
    if (this.token) {
      this.client.defaults.headers.common["Authorization"] =
        `Bearer ${this.token}`;
    }

    // Interceptor para agregar token a cada request
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Interceptor para manejar errores
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const isPreview = localStorage.getItem("token") === "preview-token";
        if (error.response?.status === 401 && !isPreview) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          window.location.href = `${import.meta.env.BASE_URL}login`;
        }
        return Promise.reject(error);
      },
    );
  }

  private normalizeResponse<T>(payload: ApiResponse<T> | T): ApiResponse<T> {
    if (
      payload &&
      typeof payload === "object" &&
      ("success" in payload || "data" in payload)
    ) {
      return payload as ApiResponse<T>;
    }

    return {
      success: true,
      data: payload as T,
    };
  }

  private normalizePaginatedResponse<T>(
    payload: PaginatedResponse<T> | T[],
  ): PaginatedResponse<T> {
    if (
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      "pagination" in payload
    ) {
      return payload as PaginatedResponse<T>;
    }

    const data = Array.isArray(payload) ? payload : [];
    return {
      success: true,
      data,
      pagination: {
        total: data.length,
        page: 1,
        limit: data.length,
        pages: 1,
      },
    };
  }

  setToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    delete this.client.defaults.headers.common["Authorization"];
  }

  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params });
    return this.normalizeResponse<T>(response.data);
  }

  async getPaginated<T>(
    url: string,
    params?: any,
  ): Promise<PaginatedResponse<T>> {
    const response = await this.client.get(url, { params });
    return this.normalizePaginatedResponse<T>(response.data);
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data);
    return this.normalizeResponse<T>(response.data);
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data);
    return this.normalizeResponse<T>(response.data);
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data);
    return this.normalizeResponse<T>(response.data);
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url);
    return this.normalizeResponse<T>(response.data);
  }

  // Subida de archivos (multipart). Se usa fetch nativo para que el navegador
  // fije el boundary correcto, igual que en el panel anterior.
  async uploadFile<T>(
    url: string,
    file: File,
    field = "imagen",
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(field, file);
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Error al subir el archivo.");
    }
    const payload = await response.json();
    return this.normalizeResponse<T>(payload);
  }
}

export const apiClient = new ApiClient();
