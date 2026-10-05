import { AuthStorage } from "./AuthStorage";
import {
  ANIMALS,
  DAILY_TREND,
  WEEKLY_ACTIVITY,
  MONTHLY_ACTIVITY,
  RECENT_ALERTS,
  PEAK_HOURS,
} from "./agrishield-data";

let envApiUrl = import.meta.env['VITE_API_URL'];
const isBrowser = typeof window !== 'undefined';

if (isBrowser && envApiUrl && envApiUrl.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  envApiUrl = undefined; // Force dynamic fallback on mobile
}
const BASE_URL = envApiUrl || (isBrowser ? `http://${window.location.hostname}:5000/api` : 'http://localhost:5000/api');

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

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = 'API request failed';
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMessage = errData.message;
          }
        } catch (e) {
          // ignore JSON parse error on failed request
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data !== undefined ? data.data : data;
    } catch (err) {
      console.warn(`[ApiClient] Failed to fetch ${endpoint}, falling back to mock data.`);
      
      // If auth route fails, throw immediately so UI shows error instead of mocking
      if (endpoint.includes('/auth/')) {
        throw err;
      }


      


      if (endpoint.includes("/auth/me")) {
        return { id: "test-user", name: "Guest User" } as any;
      }

      if (endpoint.includes("/community")) {
        return [
          {
            id: "1",
            user: "Farmer John",
            message: "Wild boars spotted near north fence.",
            time: "2h ago",
            likes: 12,
          },
          {
            id: "2",
            user: "AgriTech Admin",
            message: "System update scheduled for tonight.",
            time: "5h ago",
            likes: 45,
          },
        ] as any;
      }

      // Default mock fallback
      return [] as any;
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: "GET" });
  }

  static async post<T>(endpoint: string, body: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  static async put<T>(endpoint: string, body: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }
}
