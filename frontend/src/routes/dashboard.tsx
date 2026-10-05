import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Camera,
  History,
  ShieldCheck,
  AlertTriangle,
  Map,
  Users,
  Settings as SettingsIcon,
  BarChart3,
  Bell,
  ArrowRight,
  Lightbulb,
  CloudSun,
  Activity,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { AppShell } from "@/components/AppShell";
import { AuthGuard, PanelSection, RiskPill } from "@/components/shield-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppState } from "@/lib/app-state";
import { useDashboard } from "@/hooks/useDashboard";
import { Loader2 } from "lucide-react";
import { BarChart, Bar } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Farm Dashboard — AgriShield AI" }],
  }),
  component: () => (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  ),
});

const QUICK_ACTIONS = [
  { to: "/detection", label: "Live Cameras", icon: Camera },
  { to: "/heatmap", label: "Zone Heatmap", icon: Map },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

function Dashboard() {
  const { systemOn, profile } = useAppState();
  const { data, isLoading } = useDashboard();

  if (isLoading || !data || !profile) {
    return (
      <AppShell title={profile?.farmName || "Dashboard"} subtitle="Loading dashboard...">
        <div className="grid min-h-[60vh] place-items-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const todayTotal = data.distribution.reduce((s: number, a: { value: number }) => s + a.value, 0); // Approx
  const weekTotal =
    data.distribution.reduce((s: number, a: { value: number }) => s + a.value, 0) * 4; // Approx
  const distribution = data.distribution;
  const DAILY_TREND = data.dailyTrend;
  const WEEKLY_ACTIVITY = data.weeklyActivity;
  const MONTHLY_ACTIVITY = data.monthlyActivity;
  const RECENT_ALERTS = data.recentAlerts || [];

  const latestAlert = RECENT_ALERTS?.[0];
  const statusBg = systemOn ? "bg-primary/15" : "bg-destructive/15";
  const statusIcon = systemOn ? (
    <ShieldCheck className="size-6 text-primary" />
  ) : (
    <AlertTriangle className="size-6 text-destructive" />
  );
  const statusTitle = systemOn ? "System Armed" : "System Offline";
  const statusDesc = systemOn
    ? "All cameras are active and AI is monitoring the perimeter."
    : "Monitoring is paused. AI detections are currently disabled.";
  const statusColor = systemOn ? "text-primary" : "text-destructive";

  return (
    <AppShell
      title={`Good Evening, ${profile.firstName || "Farmer"}`}
      subtitle={new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    >
      <div className="mx-auto max-w-[1200px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* HERO SECTION (Layer 1 - Critical) */}
        <section className="flex flex-col xl:flex-row gap-6">
          {/* Main Status Hero */}
          <div className="panel flex-[2] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden bg-white">
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-6">
                <div
                  className={`p-4 rounded-3xl ${statusBg} shadow-lg shadow-${statusBg}/30 transition-transform hover:scale-105 duration-300`}
                >
                  {statusIcon}
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Farm Status
                  </p>
                  <h2
                    className={`font-display text-4xl md:text-5xl font-bold tracking-tight ${statusColor}`}
                  >
                    {statusTitle}
                  </h2>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-2xl border border-accent/20">
                <CloudSun className="size-6 text-accent" />
                <div>
                  <p className="text-sm font-bold text-foreground">24°C, Clear</p>
                  <p className="text-xs text-muted-foreground font-medium">Optimal conditions</p>
                </div>
              </div>
            </div>

            <div className="mt-10 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <p className="text-muted-foreground text-base md:text-lg max-w-lg font-medium leading-relaxed">
                {statusDesc}
              </p>

              <Button
                asChild
                size="lg"
                className="rounded-2xl px-6 font-semibold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all duration-300"
              >
                <Link to="/detection">
                  View Live Feed
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Today's Snapshot (Layer 2) */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="panel p-6 flex-1 flex flex-col justify-center bg-gradient-to-br from-white to-surface-2 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Activity className="size-32" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Today's Activity
              </p>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-6xl font-bold tracking-tighter text-foreground">
                  {todayTotal}
                </span>
                <span className="text-lg font-medium text-muted-foreground">intrusions</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <RiskPill level="low" />
                <span className="text-xs font-semibold text-muted-foreground">
                  Overall Risk Level
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
          {/* LEFT COLUMN - Primary Monitoring */}
          <div className="space-y-8">
            {/* Cinematic Live Camera Preview */}
            <PanelSection
              title="Perimeter Vision"
              right={
                <Badge
                  variant="outline"
                  className="gap-2 border-primary/20 bg-primary/5 text-primary rounded-full px-3 py-1 font-bold"
                >
                  <span className="size-2 rounded-full bg-primary animate-pulse" /> Live Analysis
                </Badge>
              }
            >
              <div className="group relative overflow-hidden rounded-[2rem] border border-border shadow-2xl shadow-black/5 bg-black mt-2">
                <div className="aspect-[21/9] w-full overflow-hidden relative">
                  <img
                    src="/agrishield_boar.png"
                    alt="Farm Feed"
                    className="w-full h-full object-cover opacity-90 transition-transform duration-[10s] ease-out group-hover:scale-105"
                  />

                  {/* Subtle Gradient Overlay for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Premium Glass HUD */}
                  <div className="absolute top-6 left-6">
                    <div className="backdrop-blur-xl bg-white/10 px-4 py-2 rounded-2xl border border-white/20 text-white shadow-lg">
                      <p className="text-xs font-bold tracking-wider opacity-80">NORTH BOUNDARY</p>
                      <p className="font-display text-lg font-bold">CAM-01 Edge</p>
                    </div>
                  </div>

                  {systemOn && (
                    <div className="absolute bottom-6 left-6">
                      <div className="backdrop-blur-xl bg-primary/20 px-4 py-2 rounded-2xl border border-primary/30 text-white flex items-center gap-3 shadow-lg">
                        <ShieldCheck className="size-5" />
                        <div>
                          <p className="text-xs font-bold tracking-wider opacity-80">AI ENGINE</p>
                          <p className="font-semibold text-sm">Actively Scanning • 99% Conf</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PanelSection>

            {/* Smart Assistant Recommendations */}
            <div className="panel p-6 sm:p-8 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent relative overflow-hidden">
              <div className="flex gap-5 relative z-10">
                <div className="shrink-0 mt-1">
                  <div className="p-3 bg-white rounded-full shadow-sm border border-border text-primary">
                    <Lightbulb className="size-6" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    AI Farming Assistant
                  </h3>
                  <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-2xl">
                    Based on regional data, wild boar activity peaks between 8 PM and 11 PM tonight.
                    I recommend verifying that the deterrent sirens on the North and West boundaries
                    are fully operational before dusk.
                  </p>
                  <Button
                    variant="link"
                    className="px-0 h-auto text-primary font-bold hover:no-underline hover:opacity-80"
                  >
                    Verify Deterrent Settings <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Context & Data (Layer 2 & 3) */}
          <div className="space-y-8">
            {/* Friendly Recent Alert */}
            <PanelSection title="Recent Activity">
              {latestAlert ? (
                <div className="group rounded-3xl border border-border bg-white p-5 hover:border-warning/30 transition-colors shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 rounded-2xl bg-warning/15 p-3 text-warning">
                      <Bell className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                        <strong className="text-foreground font-bold">
                          {latestAlert.description}
                        </strong>{" "}
                        at {latestAlert.time}.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 h-9 text-xs font-bold rounded-xl w-full group-hover:bg-warning/5 group-hover:text-warning group-hover:border-warning/20 transition-all"
                      >
                        Review Event Recording
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground font-medium text-sm bg-surface-2 rounded-3xl">
                  No recent alerts.
                </div>
              )}
            </PanelSection>

            {/* Premium Activity Trend */}
            <PanelSection
              title="Weekly Trend"
              right={
                <Link to="/analytics" className="text-xs font-bold text-primary hover:underline">
                  View All
                </Link>
              }
            >
              <div className="h-48 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DAILY_TREND}>
                    <defs>
                      <linearGradient id="colorIntrusions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                        fontWeight: 600,
                        padding: "12px 16px",
                      }}
                      itemStyle={{ color: "var(--primary)" }}
                    />
                    <Area
                      type="monotoneX"
                      dataKey="intrusions"
                      stroke="var(--primary)"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorIntrusions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </PanelSection>

            {/* Elegant Distribution Donut */}
            <PanelSection title="Animal Distribution">
              <div className="flex items-center gap-6 mt-2">
                <div className="h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={36}
                        outerRadius={52}
                        paddingAngle={6}
                        cornerRadius={8}
                        stroke="none"
                      >
                        {distribution.map((_: any, i: number) => (
                          <Cell
                            key={i}
                            fill={
                              i === 0
                                ? "var(--warning)"
                                : i === 1
                                  ? "var(--primary)"
                                  : "var(--accent)"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Recent Activity</h3>
                  <p className="text-sm mt-1 text-muted-foreground leading-relaxed">
                    {latestAlert?.description} ({latestAlert?.time})
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">
                      View Recording
                    </Button>
                  </div>
                </div>
              </div>
            </PanelSection>

            {/* Recommendations / Assistant */}
            <PanelSection title="Smart Recommendations" className="bg-primary/5 border-primary/10">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <Lightbulb className="size-5 text-primary" />
                </div>
                <div className="space-y-3 text-sm">
                  <p className="text-foreground">
                    Based on regional activity, wild boars are highly active between 8 PM and 11 PM.
                  </p>
                  <p className="text-muted-foreground">
                    We recommend verifying your deterrent systems are fully operational on the North
                    and West boundaries before dusk.
                  </p>
                  <Button variant="link" className="px-0 h-auto text-primary font-semibold">
                    Review Deterrent Settings <ArrowRight className="ml-1 size-3" />
                  </Button>
                </div>
              </div>
            </PanelSection>

            <PanelSection
              title="Detection overview"
              description="Today and weekly counts per agricultural species"
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {distribution.map((a: any) => (
                  <div
                    key={a.name}
                    className="rounded-xl border border-border bg-surface/60 p-3.5 transition-all hover:border-primary/40 hover:bg-surface/80"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium text-sm">{a.name}</span>
                      <RiskPill level="medium" />
                    </div>
                    <div className="mt-3.5 flex items-end gap-5">
                      <span>
                        <span className="block font-display text-xl font-bold">
                          {Math.floor(a.value / 4)}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          today
                        </span>
                      </span>
                      <span>
                        <span className="block font-display text-xl font-bold text-muted-foreground">
                          {a.value}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          this week
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </PanelSection>
          </div>
        </div>

        {/* Right Side: System Logs & Recent Alerts */}
        <div className="flex flex-col gap-6">
          <PanelSection title="Edge Hardware Health" description="Integrated IoT protection stats">
            <div className="relative overflow-hidden rounded-xl border border-border bg-background/55 p-4">
              <ul className="relative space-y-3.5 text-xs">
                {[
                  ["System status", systemOn ? "🟢 Active & Guarding" : "🔴 Paused / Disabled"],
                  ["Camera connection", "Connected · CAM-01 North"],
                  ["Local detection engine", systemOn ? "Running · 24 fps" : "Idle (Switch off)"],
                  ["Active deterrent hardware", systemOn ? "Ready · Strobe Horn Node" : "Disabled"],
                  ["Last sync time", "2 seconds ago"],
                ].map(([k, v]) => (
                  <li
                    key={k}
                    className="flex items-center justify-between gap-3 pb-2 border-b border-border/40 last:pb-0 last:border-b-0"
                  >
                    <span className="flex items-center gap-2">
                      <Camera className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-xs font-medium">{k}</span>
                    </span>
                    <span className="text-xs">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </PanelSection>

          <PanelSection
            title="Recent alerts"
            description="Latest five detections across Gujarat zones"
            right={
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                <Link to="/history">View all</Link>
              </Button>
            }
          >
            <ul className="divide-y divide-border">
              {RECENT_ALERTS.map((d: any) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-3 text-xs">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-foreground">
                      {d.description || d.message || d.animal}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {d.time || d.timestamp}
                    </span>
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      d.level === "Critical" || d.alert === "Triggered"
                        ? "border-destructive/40 bg-destructive/10 text-destructive text-[10px] font-bold"
                        : "border-border text-muted-foreground text-[10px]"
                    }
                  >
                    {d.level || d.alert}
                  </Badge>
                </li>
              ))}
            </ul>
          </PanelSection>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <PanelSection title="Daily detection trend" description="Intrusions per day this week">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_TREND}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  itemStyle={{ color: "var(--popover-foreground)" }}
                  labelStyle={{ color: "var(--popover-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="intrusions"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PanelSection>

        <PanelSection title="Weekly activity" description="Intrusions vs successfully deterred">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_ACTIVITY}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  itemStyle={{ color: "var(--popover-foreground)" }}
                  labelStyle={{ color: "var(--popover-foreground)" }}
                />
                <Bar dataKey="intrusions" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="deterred" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelSection>
      </div>
    </AppShell>
  );
}
