import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/AppShell";
import { AuthGuard, PanelSection, StatCard } from "@/components/shield-ui";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  ANIMALS,
  DETECTIONS,
  REGIONS,
  DAILY_TREND,
  WEEKLY_ACTIVITY,
  MONTHLY_ACTIVITY,
  PEAK_HOURS,
} from "@/lib/agrishield-data";
import { Activity, ShieldCheck, AlertTriangle, MapPin, Loader2 } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [{ title: "Intrusion Analytics — AgriShield AI" }],
  }),
  component: () => (
    <AuthGuard>
      <AnalyticsPage />
    </AuthGuard>
  ),
});

const COLORS = [
  "var(--primary)",
  "var(--warning)",
  "var(--accent)",
  "var(--destructive)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const tooltipStyle = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  border: "none",
  borderRadius: "16px",
  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--foreground)",
  padding: "12px 16px",
};

function AnalyticsPage() {
  const { data, isLoading, isError } = useAnalytics();

  if (isLoading) {
    return (
      <AppShell title="Intelligence & Analytics" subtitle="Loading data...">
        <div className="flex h-[50vh] items-center justify-center text-white/50">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <p>Loading analytics...</p>
        </div>
      </AppShell>
    );
  }

  if (isError || !data) {
    return (
      <AppShell title="Intelligence & Analytics" subtitle="Error">
        <div className="flex h-[50vh] flex-col items-center justify-center text-red-500/80">
          <AlertTriangle className="mb-4 h-12 w-12" />
          <p>Unable to load analytics data.</p>
        </div>
      </AppShell>
    );
  }

  const distribution = data.distribution?.length ? data.distribution : [
    { name: "Wild Boar", value: 45 },
    { name: "Nilgai", value: 30 },
    { name: "Goat", value: 15 },
    { name: "Cow", value: 10 },
  ];

  const dailyTrend = data.dailyTrend?.length ? data.dailyTrend : DAILY_TREND;
  const weeklyActivity = data.weeklyActivity?.length ? data.weeklyActivity : WEEKLY_ACTIVITY;
  const monthlyActivity = data.monthlyActivity?.length ? data.monthlyActivity : MONTHLY_ACTIVITY;
  const peakHours = data.peakHours?.length ? data.peakHours : PEAK_HOURS;

  const avgConfidence = data.avgConfidence || 0;
  const worst = { emoji: "⚠️", name: data.worstThreat?.name || "None", count: data.worstThreat?.count || 0 };
  const worstRegion = { name: data.worstRegion?.name || "Unknown", detections: data.worstRegion?.count || 0 };

  return (
    <AppShell
      title="Intelligence & Analytics"
      subtitle="Deep-dive into 30-day intrusion patterns across your district"
    >
      <div className="mx-auto max-w-[1400px] animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
        {/* Top Stats Overview */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard 
            label="Total Detections" 
            value={data.totalDetections || 0} 
            hint="All-time detections" 
            icon={<Activity className="size-5" />} 
          />
          <StatCard
            label="System Reliability"
            value={`${avgConfidence}%`}
            hint="AgriVision-v3 Confidence"
            tone="primary"
            icon={<ShieldCheck className="size-5" />}
          />
          <StatCard
            label="Highest Risk Threat"
            value={<span className="flex items-center gap-2">{worst.emoji} {worst.name}</span>}
            hint={`${worst.count} total detections`}
            tone="warning"
            icon={<AlertTriangle className="size-5" />}
          />

        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Main Trend Chart */}
          <PanelSection
            title="Activity Trend"
            description="Rolling 7-day intrusion count"
            className="lg:col-span-2 p-6 md:p-8"
          >
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)", fontWeight: 500 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)", fontWeight: 500 }}
                    dx={-10}
                  />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "var(--primary)" }} />
                  <Area
                    type="monotone"
                    dataKey="intrusions"
                    stroke="var(--primary)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </PanelSection>

          <PanelSection title="Animal Distribution" description="Weekly detection share by species">
            <div className="h-[280px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    cornerRadius={8}
                    stroke="none"
                  >
                    {distribution.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </PanelSection>

          <PanelSection
            title="Intervention Success"
            description="Intrusions vs Successfully Deterred"
          >
            <div className="h-[280px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                  />
                  <Bar
                    dataKey="deterred"
                    name="Successfully Deterred"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="intrusions"
                    name="Undeterred Intrusions"
                    fill="var(--destructive)"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PanelSection>

          <PanelSection title="Seasonal Comparison" description="Monthly activity tracking">
            <div className="h-[280px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyActivity}>
                  <defs>
                    <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                  />
                  <Bar dataKey="intrusions" fill="url(#colorMonth)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PanelSection>

          <PanelSection
            title="Risk Window"
            description="Peak detection hours (Highest risk: 8 PM - 10 PM)"
          >
            <div className="h-[280px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {peakHours.map((h: any, i: number) => (
                      <Cell
                        key={i}
                        fill={h.count > 18 ? "var(--warning)" : "var(--primary)"}
                        opacity={h.count > 18 ? 1 : 0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PanelSection>
        </div>
      </div>
    </AppShell>
  );
}
