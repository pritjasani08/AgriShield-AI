import { AuthStorage } from "./AuthStorage";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export class ApiClient {
  static async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = AuthStorage.getToken();
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = (data && data.message) || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data?.data;
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: "GET" });
  }

  static async post<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : null,
    });
  }

  static async put<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : null,
    });
  }
}
