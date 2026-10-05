import { ISettingsRepository } from './settings.repository';
import { RawSettingsEntity, UpdateSettingsDto } from './settings.types';
import { ApiError } from '../../core/utils/ApiError';
import { randomUUID } from 'crypto';

export class MockSettingsRepository implements ISettingsRepository {
  private settings: Map<string, RawSettingsEntity> = new Map();

  async getSettings(userId: string): Promise<RawSettingsEntity | null> {
    for (const setting of this.settings.values()) {
      if (setting.user_id === userId) {
        return setting;
      }
    }
    return null;
  }

  async updateSettings(userId: string, data: UpdateSettingsDto): Promise<RawSettingsEntity> {
    const current = await this.getSettings(userId);
    if (!current) {
      throw new ApiError(404, 'Settings not found');
    }

    const updated = {
      ...current,
      language: data.language !== undefined ? data.language : current.language,
      notification_enabled: data.notificationEnabled !== undefined ? data.notificationEnabled : current.notification_enabled,
      notification_mode: data.notificationMode !== undefined ? data.notificationMode : current.notification_mode,
      voice_alert_enabled: data.voiceAlertEnabled !== undefined ? data.voiceAlertEnabled : current.voice_alert_enabled,
      voice_language: data.voiceLanguage !== undefined ? data.voiceLanguage : current.voice_language,
      alert_volume: data.alertVolume !== undefined ? data.alertVolume : current.alert_volume,
      security_system_enabled: data.securitySystemEnabled !== undefined ? data.securitySystemEnabled : current.security_system_enabled,
      theme: data.theme !== undefined ? data.theme : current.theme,
      updated_at: new Date()
    };

    this.settings.set(updated.id, updated);
    return updated;
  }

  async createDefaultSettings(userId: string): Promise<RawSettingsEntity> {
    const newSettings: RawSettingsEntity = {
      id: randomUUID(),
      user_id: userId,
      language: 'en',
      notification_enabled: true,
      notification_mode: 'all',
      voice_alert_enabled: true,
      voice_language: 'en',
      alert_volume: 100,
      security_system_enabled: true,
      theme: 'light',
      created_at: new Date(),
      updated_at: new Date()
    };

    this.settings.set(newSettings.id, newSettings);
    return newSettings;
  }
}
