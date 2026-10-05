import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  MapPinned,
  Radio,
  Send,
  Timer,
  Users,
  Megaphone,
  BellRing,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { AuthGuard, PanelSection, RiskPill, StatCard } from "@/components/shield-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { animalByName } from "@/lib/agrishield-data";
import { useAppState } from "@/lib/app-state";
import { useCommunity } from "@/hooks/useCommunity";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [{ title: "Village Safety Network — AgriShield AI" }],
  }),
  component: () => (
    <AuthGuard>
      <CommunityPage />
    </AuthGuard>
  ),
});

function CommunityPage() {
  const { profile } = useAppState();
  const { data: communityFeed, isLoading } = useCommunity();

  if (isLoading || !communityFeed || !profile) {
    return (
      <AppShell title="Village Safety Network" subtitle={`Loading community feed...`}>
        <div className="flex h-[400px] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  // Filter nearby (in the mock, just use the feed itself or a subset)
  const nearby = communityFeed.filter((p: any) => p.severity !== "low").slice(0, 3);

  return (
    <AppShell
      title="Village Safety Network"
      subtitle={`Collaborative threat detection for the ${profile.village} cluster`}
      actions={
        <Button
          size="lg"
          className="rounded-full shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform font-bold"
          onClick={() =>
            toast.success("Broadcast Sent", {
              description: "12 nearby farms notified about activity at your fence line.",
            })
          }
        >
          <Megaphone className="size-4 mr-2" />
          Broadcast Alert
        </Button>
      }
    >
      <div className="mx-auto max-w-[1400px] animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Connected Farms"
            value={14}
            hint="Active within 5 km"
            icon={<Users className="size-5" />}
          />
          <StatCard
            label="Shared Alerts Today"
            value={9}
            hint="6 high severity"
            tone="warning"
            icon={<BellRing className="size-5" />}
          />
          <StatCard
            label="Nearest Threat"
            value="700 m"
            hint="Wild boar, moving south-east"
            tone="danger"
            icon={<MapPin className="size-5" />}
          />
          <StatCard
            label="Avg. Warning Lead"
            value="11 min"
            hint="Before arrival at your fence"
            tone="primary"
            icon={<Timer className="size-5" />}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Main Feed */}
          <PanelSection
            title="Live Community Feed"
            description="Real-time reports from neighbouring farms"
            className="p-4 sm:p-6 bg-transparent border-none shadow-none"
          >
            <ul className="space-y-4">
              {communityFeed.map((p: any) => {
                const a = animalByName(p.animal || 'Wild Boar');
                return (
                  <li
                    key={p.id}
                    className="rounded-[2rem] border border-border bg-white p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex flex-col sm:flex-row gap-5">
                      {/* Avatar / Icon */}
                      <div className="flex-shrink-0 size-16 rounded-[1.5rem] bg-surface flex items-center justify-center text-4xl shadow-inner border border-border/50 group-hover:scale-105 transition-transform">
                        {a.emoji}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-display text-lg font-bold text-foreground truncate">
                                {p.farmer || p.userName}
                              </span>
                              <RiskPill level={p.severity} />
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <MapPin className="size-3" /> {p.farm || "Farm"} · {p.village || "Village"}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-muted-foreground bg-surface px-3 py-1 rounded-full">
                            {p.time || new Date(p.createdAt || Date.now()).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="mt-4 p-4 bg-surface/50 rounded-2xl border border-border border-dashed flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="font-bold text-foreground block mb-1 text-base">
                              {p.animal || p.animalType || "Unknown"} Detected
                            </span>
                            <span className="text-muted-foreground text-sm font-medium">
                              Moving {p.direction?.toLowerCase() || "unknown direction"} · {p.distance} away
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                            <Badge
                              variant="secondary"
                              className="gap-1.5 rounded-full px-3 py-1 bg-white"
                            >
                              <ArrowDownRight className="size-3.5 text-primary" />
                              {p.notified || p.likesCount || 0} Notified
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="gap-1.5 rounded-full px-3 py-1 bg-white"
                            >
                              <Timer className="size-3.5 text-warning" />
                              ETA {p.eta || "N/A"}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl font-bold hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                            onClick={() =>
                              toast.success("Acknowledged", {
                                description: `${p.farmer || p.userName} notified that you are on alert.`,
                              })
                            }
                          >
                            Acknowledge Alert
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </PanelSection>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <PanelSection
              title="Immediate Proximity Alerts"
              description="High-risk threats heading toward your boundary"
              className="p-6 md:p-8"
            >
              <ul className="space-y-4 mt-2">
                {nearby.map((p: any) => (
                  <li
                    key={p.id}
                    className="rounded-[1.5rem] border border-destructive/20 bg-destructive/5 p-5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />

                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <p className="flex items-center gap-2 font-display text-xl font-bold text-foreground tracking-tight">
                        {animalByName(p.animal || p.animalType || 'Wild Boar').emoji} {p.animal || p.animalType || 'Wild Boar'}
                      </p>
                      <RiskPill level={p.severity} />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4 relative z-10">
                      <span className="flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-lg border border-border/50">
                        <MapPin className="size-3.5" /> {p.distance}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-lg border border-border/50">
                        <Timer className="size-3.5" /> {p.eta || "N/A"}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className="w-full rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-transform relative z-10"
                      onClick={() =>
                        toast.success("Deterrents Armed", {
                          description: `${animalByName(p.animal || p.animalType || 'Wild Boar').deterrents.join(" + ")} ready on the ${p.direction?.toLowerCase() || p.side?.toLowerCase() || 'perimeter'} line.`,
                        })
                      }
                    >
                      <ShieldAlert className="size-4 mr-2" />
                      Arm Deterrents
                    </Button>
                  </li>
                ))}
              </ul>
            </PanelSection>

            <PanelSection
              title="Relay Chain Mechanics"
              description="How AgriShield protects the cluster"
              className="p-6 md:p-8 flex-1"
            >
              <div className="mt-4">
                <ol className="relative border-l-2 border-primary/20 ml-3 space-y-6">
                  {[
                    ["Farm A detects wild boar", "8:10 PM · 97% AI Confidence"],
                    ["AgriShield relays to cluster", "8:10 PM · 12 farms in 5 km radius"],
                    ["Farm B notified instantly", "8:11 PM · Voice alert in Gujarati"],
                    ["Deterrents auto-activated", "8:11 PM · Siren + Flash Lights"],
                  ].map(([t, s], i) => (
                    <li key={t} className="pl-6 relative">
                      <span
                        className={cn(
                          "absolute -left-[9px] top-1 rounded-full ring-4 ring-white flex items-center justify-center size-4",
                          i === 3 ? "bg-primary" : "bg-primary/40",
                        )}
                      >
                        {i === 3 && (
                          <div className="size-1.5 bg-white rounded-full animate-pulse" />
                        )}
                      </span>
                      <p className="font-bold text-sm text-foreground">{t}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">{s}</p>
                      {i === 3 && (
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                          <Radio className="size-3.5 animate-pulse" /> Chain Complete
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-xs font-bold text-muted-foreground bg-surface/50 p-3 rounded-xl">
                <MapPinned className="size-4 text-primary" />
                Cluster Radius: 5 km · {profile.village}, {profile.district}
              </div>
            </PanelSection>
          </div>
        </div>
      </div>
    </AppShell>
  );
}