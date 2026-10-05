import { ApiClient } from "../lib/api";
import { Profile } from "../lib/app-state";

const UPDATE_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "village",
  "district",
  "state",
  "farmName",
  "farmSize",
  "primaryCrop",
] as const;

export class ProfileService {
  static async getProfile(): Promise<Profile> {
    return ApiClient.get<Profile>("/profile");
  }

  static async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    const dto: Record<string, unknown> = {};
    for (const key of UPDATE_FIELDS) {
      if (profile[key] !== undefined) dto[key] = profile[key];
    }
    return ApiClient.put<Profile>("/profile", dto);
  }
}
