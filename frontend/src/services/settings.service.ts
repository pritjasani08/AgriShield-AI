import { ApiClient } from "../lib/api";
import { Settings } from "../lib/app-state";

type NotificationMode = "all" | "high" | "off";

type BackendSettings = {
  language?: string;
  notificationEnabled?: boolean;
  notificationMode?: NotificationMode;
  voiceAlertEnabled?: boolean;
  voiceLanguage?: string;
  alertVolume?: number;
  securitySystemEnabled?: boolean;
  theme?: string;
};

const LANG_TO_CODE: Record<string, string> = { English: "en", Hindi: "hi", Gujarati: "gu" };
const CODE_TO_LANG: Record<string, string> = { en: "English", hi: "Hindi", gu: "Gujarati" };

export class SettingsService {
  static async getSettings(): Promise<Settings> {
    return SettingsService.fromDto(await ApiClient.get<BackendSettings>("/settings"));
  }

  static async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const updated = await ApiClient.put<BackendSettings>(
      "/settings",
      SettingsService.toDto(settings),
    );
    return SettingsService.fromDto(updated);
  }

  private static fromDto(s: BackendSettings): Settings {
    return {
      language: CODE_TO_LANG[s.language ?? ""] ?? "English",
      voiceLanguage: CODE_TO_LANG[s.voiceLanguage ?? ""] ?? "English",
      notifications: s.notificationMode ?? (s.notificationEnabled === false ? "off" : "all"),
      volume: s.alertVolume ?? 70,
      voiceAlerts: s.voiceAlertEnabled ?? true,
    };
  }

  private static toDto(settings: Partial<Settings>): Record<string, unknown> {
    const dto: Record<string, unknown> = {};
    if (settings.language !== undefined) {
      dto["language"] = LANG_TO_CODE[settings.language] ?? "en";
    }
    if (settings.voiceLanguage !== undefined) {
      dto["voiceLanguage"] = LANG_TO_CODE[settings.voiceLanguage] ?? "en";
    }
    if (settings.notifications !== undefined) {
      dto["notificationMode"] = settings.notifications;
      dto["notificationEnabled"] = settings.notifications !== "off";
    }
    if (settings.volume !== undefined) {
      dto["alertVolume"] = settings.volume;
    }
    if (settings.voiceAlerts !== undefined) {
      dto["voiceAlertEnabled"] = settings.voiceAlerts;
    }
    return dto;
  }
}
