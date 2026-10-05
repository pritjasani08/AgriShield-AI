import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ProfileService } from "../services/profile.service";
import { SettingsService } from "../services/settings.service";
import { useAuth } from "@/hooks/useAuth";
import { AuthStorage } from "@/lib/AuthStorage";

export type Profile = {
  id?: string;
  email?: string;
  firstName: string;
  lastName: string;
  role?: string;
  phone?: string;
  village?: string;
  district?: string;
  state?: string;
  farmName?: string;
  farmSize?: number | null;
  primaryCrop?: string;
  profileImageUrl?: string;
  createdAt?: string;
};

export function profileFullName(profile: Profile | null | undefined): string {
  if (!profile) return "";
  return [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
}

export type Settings = {
  language: string;
  voiceLanguage: string;
  notifications: "all" | "high" | "off";
  volume: number;
  voiceAlerts: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  language: "English",
  voiceLanguage: "Gujarati",
  notifications: "all",
  volume: 70,
  voiceAlerts: true,
};

type AppState = {
  ready: boolean;
  authed: boolean;
  profile: Profile | null;
  settings: Settings;
  systemOn: boolean;
  offSince: number | null;
  login: (profile?: Partial<Profile>) => void;
  logout: () => void;
  updateProfile: (p: Partial<Profile>) => void;
  updateSettings: (s: Partial<Settings>) => void;
  setSystemOn: (on: boolean) => void;
};

const Ctx = createContext<AppState | null>(null);
const KEY = "agrishield-state-v1";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { isAuthed } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [systemOn, setSystem] = useState(true);
  const [offSince, setOffSince] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      if (typeof parsed.systemOn === "boolean") setSystem(parsed.systemOn);
      if (parsed.offSince) setOffSince(parsed.offSince);
    } catch {
      /* ignore */
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ profile, settings, systemOn, offSince }),
      );
    } catch {
      /* ignore */
    }
  }, [ready, profile, settings, systemOn, offSince]);

  useEffect(() => {
    if (ready && !AuthStorage.getToken()) {
      setProfile(null);
      setSettings(DEFAULT_SETTINGS);
    }
  }, [ready]);

  useEffect(() => {
    if (ready && isAuthed) {
      ProfileService.getProfile().then(p => {
        if (p) setProfile((prev) => ({ ...prev, ...p } as Profile));
      }).catch(() => {});
      SettingsService.getSettings().then(s => {
        if (s) setSettings((prev) => ({ ...prev, ...s }));
      }).catch(() => {});
    }
  }, [ready, isAuthed]);

  const setSystemOn = useCallback((on: boolean) => {
    setSystem(on);
    setOffSince(on ? null : Date.now());
  }, []);

  const value = useMemo<AppState>(
    () => ({
      ready,
      authed: isAuthed,
      profile,
      settings,
      systemOn,
      offSince,
      login: (p) => {
        if (p) setProfile((prev) => ({ ...prev, ...p } as Profile));
      },
      logout: () => {
        setProfile(null);
        setSettings(DEFAULT_SETTINGS);
      },
      updateProfile: (p) => {
        setProfile((prev) => ({ ...prev, ...p } as Profile));
        ProfileService.updateProfile(p).catch(() => {});
      },
      updateSettings: (s) => {
        setSettings((prev) => ({ ...prev, ...s }));
        SettingsService.updateSettings(s).catch(() => {});
      },
      setSystemOn,
    }),
    [ready, isAuthed, profile, settings, systemOn, offSince, setSystemOn],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}

export function speakAlert(text: string, lang: string, volume: number) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "Hindi" ? "hi-IN" : lang === "Gujarati" ? "gu-IN" : "en-IN";
  utter.volume = Math.min(1, Math.max(0, volume / 100));
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}
