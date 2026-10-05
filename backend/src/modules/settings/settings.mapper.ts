import { RawSettingsEntity, SettingsDto, Theme, Language, VoiceLanguage, NotificationMode } from './settings.types';

export class SettingsMapper {
  static toDto(raw: RawSettingsEntity): SettingsDto {
    return {
      id: raw.id,
      userId: raw.user_id,
      language: raw.language as Language,
      notificationEnabled: raw.notification_enabled,
      notificationMode: (raw.notification_mode || (raw.notification_enabled ? 'all' : 'off')) as NotificationMode,
      voiceAlertEnabled: raw.voice_alert_enabled,
      voiceLanguage: raw.voice_language as VoiceLanguage,
      alertVolume: raw.alert_volume,
      securitySystemEnabled: raw.security_system_enabled,
      theme: raw.theme as Theme,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }
}
