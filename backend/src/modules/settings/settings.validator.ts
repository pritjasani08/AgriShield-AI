import { z } from 'zod';

export const languageEnum = z.enum(['en', 'hi', 'gu', 'mr', 'te', 'ta']);
export const themeEnum = z.enum(['light', 'dark', 'system']);
export const notificationModeEnum = z.enum(['all', 'high', 'off']);

export const updateSettingsSchema = z.object({
  body: z.object({
    language: languageEnum.optional(),
    notificationEnabled: z.boolean().optional(),
    notificationMode: notificationModeEnum.optional(),
    voiceAlertEnabled: z.boolean().optional(),
    voiceLanguage: languageEnum.optional(),
    alertVolume: z.number().int().min(0, "Volume cannot be less than 0").max(100, "Volume cannot be greater than 100").optional(),
    securitySystemEnabled: z.boolean().optional(),
    theme: themeEnum.optional(),
  }).strict() // Ensure no extra fields are passed
});
