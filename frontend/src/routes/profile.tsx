import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  Pencil,
  Phone,
  Smartphone,
  Sprout,
  Wheat,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { AuthGuard, PanelSection } from "@/components/shield-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useAppState, profileFullName, type Profile } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Farmer Profile & Mobile App — AgriShield AI" }],
  }),
  component: () => (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  ),
});

const FIELDS: Array<{ key: keyof Profile; label: string; type?: string }> = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "phone", label: "Mobile Number" },
  { key: "village", label: "Village Name" },
  { key: "district", label: "District" },
  { key: "state", label: "State" },
  { key: "farmName", label: "Farm Name" },
  { key: "farmSize", label: "Farm Size (Acres)", type: "number" },
  { key: "primaryCrop", label: "Primary Crop" },
];

function ProfilePage() {
  const { profile, updateProfile, systemOn, setSystemOn, settings, updateSettings, logout: appLogout } =
    useAppState();
  const { logout: authLogout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile | null>(null);
  const navigate = useNavigate();

  if (!profile) {
    return (
      <AppShell title="Profile" subtitle="Loading profile...">
        <div className="flex h-[400px] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  const activeDraft = draft || profile;

  return (
    <AppShell
      title="Profile & Farm Settings"
      subtitle="Manage your identity, farm details, and mobile app companion"
    >
      <div className="mx-auto max-w-[1400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-8">
            {/* Identity Card */}
            <div className="relative overflow-hidden rounded-[2rem] p-8 bg-white border border-border shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none opacity-50" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <span className="grid size-24 shrink-0 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 font-display text-4xl font-bold tracking-tight">
                  {profile.firstName.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-3xl font-bold text-foreground mb-1">
                    {profileFullName(profile)}
                  </h2>
                  <p className="text-base font-medium text-muted-foreground flex items-center gap-1.5 mb-4">
                    <MapPin className="size-4" /> {profile.village}, {profile.district},{" "}
                    {profile.state}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-surface px-3 py-1.5 rounded-lg border border-border text-foreground">
                      <Sprout className="size-4 text-primary" /> {profile.farmName}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-surface px-3 py-1.5 rounded-lg border border-border text-foreground">
                      <Wheat className="size-4 text-warning" /> {profile.primaryCrop}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-surface px-3 py-1.5 rounded-lg border border-border text-foreground">
                      <Phone className="size-4 text-primary" /> {profile.phone}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col gap-3 mt-4 md:mt-0 ml-auto">
                  <Button
                    variant={editing ? "outline" : "default"}
                    className="rounded-xl font-bold shadow-sm"
                    onClick={() => {
                      setDraft(profile);
                      setEditing((v) => !v);
                    }}
                  >
                    <Pencil className="size-4 mr-2" />
                    {editing ? "Cancel Edit" : "Edit Profile"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl font-bold text-destructive hover:bg-destructive/10 border-border"
                    onClick={async () => {
                      try {
                        await authLogout();
                      } catch {
                        /* token already cleared client-side */
                      }
                      appLogout();
                      toast.success("Logged out");
                      navigate({ to: "/auth" });
                    }}
                  >
                    <LogOut className="size-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>

            {/* Farm Details Form */}
            <PanelSection
              title={editing ? "Update Farm Information" : "Farm Specifications"}
              description="Used for community alerts and accurate district risk mapping"
              className="p-6 md:p-8"
            >
              {editing ? (
                <form
                  className="grid gap-5 sm:grid-cols-2 mt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (activeDraft) updateProfile(activeDraft);
                    setEditing(false);
                    toast.success("Profile Updated", {
                      icon: <CheckCircle2 className="size-5 text-primary" />,
                    });
                  }}
                >
                  {FIELDS.map(({ key, label, type }) => (
                    <div key={key} className="space-y-2">
                      <Label
                        htmlFor={key}
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                      >
                        {label}
                      </Label>
                      <Input
                        id={key}
                        type={type}
                        value={activeDraft[key] ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (key === "farmSize") {
                            setDraft((d) => ({
                              ...(d || profile),
                              farmSize: raw === "" ? null : Number(raw),
                            } as Profile));
                          } else {
                            setDraft((d) => ({ ...(d || profile), [key]: raw } as Profile));
                          }
                        }}
                        className="h-12 rounded-xl bg-surface border-border shadow-sm px-4 font-medium focus-visible:ring-primary/20"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2 flex justify-end mt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <dl className="grid gap-4 sm:grid-cols-2 mt-4">
                  {FIELDS.map(({ key, label }) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-border/60 bg-surface/40 p-4 transition-colors hover:bg-surface/80"
                    >
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        {label}
                      </dt>
                      <dd className="text-base font-bold text-foreground">
                        {key === "farmSize" && !profile[key] ? "—" : profile[key]}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </PanelSection>
          </div>

          {/* Mobile Preview */}
          <PanelSection
            title="Mobile Companion App"
            description="Preview of the iOS/Android app UI"
            right={<Smartphone className="size-5 text-muted-foreground" />}
            className="p-6 md:p-8 flex flex-col items-center bg-transparent border-none shadow-none"
          >
            <div className="relative mx-auto w-full max-w-[320px] rounded-[3rem] border-8 border-slate-900 bg-white p-4 shadow-2xl h-[640px] flex flex-col overflow-hidden">
              {/* iPhone Dynamic Island */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-slate-900 rounded-b-3xl z-20" />

              <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-4 space-y-4">
                {/* Mobile Header */}
                <div className="text-center mb-6">
                  <h3 className="font-display font-bold text-lg text-slate-800">AgriShield AI</h3>
                  <p className="text-xs text-slate-500 font-medium">Farm Companion</p>
                </div>

                {/* Mobile Status Widget */}
                <div
                  className={cn(
                    "rounded-2xl p-4 text-center transition-colors shadow-sm",
                    systemOn
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-red-50 border border-red-200",
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] uppercase tracking-widest font-bold mb-1",
                      systemOn ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    System Status
                  </p>
                  <p
                    className={cn(
                      "font-display text-2xl font-bold",
                      systemOn ? "text-emerald-700" : "text-red-700",
                    )}
                  >
                    {systemOn ? "Active Shield" : "Paused"}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-600 bg-white/50 py-1.5 px-3 rounded-lg border border-black/5">
                    <span>Monitoring</span>
                    <Switch
                      checked={systemOn}
                      onCheckedChange={setSystemOn}
                      className="scale-75 origin-right data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </div>

                {/* Mobile Active Alerts */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                    Recent Detections
                  </p>
                  <p className="text-xs text-slate-500 text-center py-2">No recent alerts</p>
                </div>

                {/* Mobile Community */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                    Village Network
                  </p>
                  <p className="text-xs text-slate-500 text-center py-2">No network alerts</p>
                </div>
              </div>
            </div>
            <p className="mt-6 text-center text-sm font-medium text-muted-foreground px-4">
              Push notifications, background detection and emergency SOS ship with the native iOS
              and Android builds.
            </p>
          </PanelSection>
        </div>
      </div>
    </AppShell>
  );
}
