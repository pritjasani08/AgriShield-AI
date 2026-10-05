import { ApiClient } from "../lib/api";

export class AuthService {
  static async login(credentials: { email?: string; mobile?: string; password: string }) {
    return ApiClient.post<{ user: any; token: string }>("/auth/login", credentials);
  }

  static async signup(data: any) {
    return ApiClient.post<{ user: any; token: string }>("/auth/signup", data);
  }

  static async me() {
    // Backend returns the user object as `data` in the ApiResponse envelope
    const user = await ApiClient.get<any>("/auth/me");
    return user;
  }

  static async logout() {
    return ApiClient.post<{ success: boolean }>("/auth/logout");
  }
}
