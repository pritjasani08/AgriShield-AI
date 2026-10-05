import { ApiClient } from "../lib/api";

export class CommunityService {
  static async getPosts(): Promise<any[]> {
    const data = await ApiClient.get<any[]>("/community/posts");
    return Array.isArray(data) ? data : [];
  }
}
