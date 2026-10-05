import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BellRing, FileVideo, ImageUp, Loader2, Radar, Volume2, Zap, Play, UploadCloud,
  AlertTriangle, Camera, ShieldCheck, Download, Printer, Share2, MoreVertical,
  CheckCircle2, Clock, MapPin, Activity, Radio, VolumeX, Pause, RefreshCw, Send, Focus, ArrowRight, Map as MapIcon
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { AuthGuard, PanelSection, RiskPill } from "@/components/shield-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VOICE_LINES, ANIMALS } from "@/lib/agrishield-data";
import { speakAlert, useAppState } from "@/lib/app-state";
import { ApiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/detection")({
  head: () => ({
    meta: [{ title: "Live Cameras & Detection — AgriShield AI" }],
  }),
  component: () => (
    <AuthGuard>
      <DetectionPage />
    </AuthGuard>
  ),
});

type Result = {
  animal: string;
  confidence: number;
  side: string;
  time: string;
  box: { x: number; y: number; w: number; h: number };
  media: string | null;
  kind: "image" | "video";
  threatLevel: "High" | "Medium" | "Low";
};

const SIDES = ["North Fence", "East Gate", "South Canal", "West Boundary"];
const TIMELINE_STEPS = ["Upload", "Preprocess", "Inference", "Threat Calc", "Decision", "Ready"];

const RECENT_HISTORY = [
  {
    time: "01:15 AM",
    animal: "Cow",
    camera: "CAM-04",
    boundary: "West Boundary",
    confidence: 99,
    threat: "High",
    status: "Deterrent Activated",
  },
  {
    time: "12:58 AM",
    animal: "Wild Boar",
    camera: "CAM-01",
    boundary: "North Boundary",
    confidence: 96,
    threat: "High",
    status: "Siren Triggered",
  },
  {
    time: "12:20 AM",
    animal: "Nilgai",
    camera: "CAM-02",
    boundary: "East Boundary",
    confidence: 94,
    threat: "Medium",
    status: "Logged",
  },
  {
    time: "11:42 PM",
    animal: "Monkey",
    camera: "CAM-05",
    boundary: "South Boundary",
    confidence: 91,
    threat: "Low",
    status: "Flash Activated",
  },
];

function DetectionPage() {
  const { systemOn, settings } = useAppState();

  const [timelineStep, setTimelineStep] = useState(-1);
  const [result, setResult] = useState<Result | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [voiceLang, setVoiceLang] = useState(settings.voiceLanguage);
  const [running, setRunning] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [volume, setVolume] = useState(settings.volume);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const runDetection = async (kind: "image" | "video", file?: File) => {
    if (!file) return;
    
    if (!systemOn) {
      toast.error("System Offline", { description: "Turn on System Control to run detections." });
      return;
    }
    
    setResult(null);
    setTimelineStep(0);
    setRunning(true);

    const formData = new FormData();
    formData.append(kind === "video" ? "video" : "image", file);
    
    // Animate timeline while waiting
    let currentStep = 0;
    const timer = window.setInterval(() => {
      currentStep++;
      if (currentStep < 4) {
        setTimelineStep(currentStep);
      }
    }, 800);

    try {
      const endpoint = kind === "video" 
        ? `http://${window.location.hostname}:8000/predict_video` 
        : `http://${window.location.hostname}:8000/predict`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      window.clearInterval(timer);
      setTimelineStep(3); // Threat Calc
      
      if (!res.ok) {
        throw new Error("Server error");
      }
      
      const data = await res.json();
      setTimelineStep(5); // Ready
      
      if (!data.detected) {
        toast.info(data.message || "No animal detected");
        setRunning(false);
        return;
      }
      
      const now = new Date();
      setResult({
        animal: data.animal,
        confidence: data.confidence,
        side: SIDES[Math.floor(Math.random() * SIDES.length)]!,
        time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        box: { x: -100, y: -100, w: 0, h: 0 }, // Hide the CSS box since Python draws it
        media: kind === "video" ? data.video_url : data.image_base64,
        kind,
        threatLevel: "High",
      });
      
      // SAVE TO DATABASE
      const { ApiClient } = await import("../lib/api");
      ApiClient.post('/detection/save', {
        animal: data.animal,
        confidence: data.confidence / 100, // Database expects decimal
        media_url: kind === "video" ? data.video_url : data.image_base64,
        media_type: kind,
        threat_level: "High",
        side: SIDES[Math.floor(Math.random() * SIDES.length)]
      }).catch(e => console.warn("Failed to save detection to history DB:", e));
      
      setRunning(false);
      if (systemOn) {
        toast.error(`${data.animal} detected`, {
          description: `${data.confidence}% confidence`,
          icon: <BellRing className="size-5" />,
        });
        
        // Trigger hardware alert on the connected device!
        ApiClient.post('/alerts/trigger', {
          animal: data.animal,
          camera: "CAM-01",
          threatLevel: "High"
        }).catch(e => console.warn("Could not trigger hardware alert:", e));
      }
    } catch (err: any) {
      window.clearInterval(timer);
      setRunning(false);
      toast.error("Analysis Failed", { description: err.message || "Could not connect to AI server" });
    }
  };

  const handleAction = (id: string) => {
    if (id === "Download Report") {
      toast.success("Downloading PDF Report...", { description: "Report generated successfully." });
      return;
    }
    if (id === "Print Report" || id === "Share Report") {
      toast.success(`${id} Initiated`, { description: "Action triggered successfully." });
      return;
    }
    setActionLoading(id);
    setTimeout(() => {
      setActionLoading(null);
      toast.success(`${id} Triggered`, { description: "Action executed successfully." });
    }, 1500);
  };

  const animal = result
    ? {
        emoji: "⚠️",
        name: result.animal,
        severity: "high" as const,
        deterrents: ["Siren", "Flash"],
        note: "Detected via AI",
      }
    : null;
  const voiceLine = result ? `Attention! ${result.animal} detected near ${result.side}` : "";

  // Common card classes for exact consistency
  const cardClasses =
    "p-6 md:p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full";

  return (
    <AppShell title="Live Cameras & AI Analysis">
      <div className="mx-auto max-w-[1400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Strict 12-column grid. Left=8, Right=4 */}
        <div className="grid gap-8 lg:grid-cols-12 items-stretch">
          {/* ----------------- LEFT COLUMN (8 Columns) ----------------- */}
          <div className="lg:col-span-8 space-y-8 flex flex-col">
            {/* 1. UNIFIED INPUT SOURCE CARD */}
            <PanelSection
              title="Input Source"
              description="Select the feed to analyze"
              className={cardClasses}
            >
              <div className="flex flex-col flex-1 gap-6">
                {/* Tabs */}
                <Tabs defaultValue="live" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-surface/50 p-1 rounded-xl h-12 border border-border">
                    <TabsTrigger
                      value="live"
                      className="rounded-lg font-bold h-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Live Feed
                    </TabsTrigger>
                    <TabsTrigger
                      value="video"
                      className="rounded-lg font-bold h-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Video Clip
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="rounded-lg font-bold h-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Still Image
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="image" className="mt-4 m-0 p-0">
                    {!systemOn ? (
                      <div className="flex w-full h-[120px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface/50 text-muted-foreground opacity-70">
                        <Activity className="size-6 mb-2 opacity-50" />
                        <p className="text-sm font-bold">System is Offline</p>
                        <p className="text-xs">Enable System Control in the sidebar</p>
                      </div>
                    ) : (
                      <>
                        <input ref={imageInput} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) runDetection("image", f); }} />
                        <UploadDrop icon={<ImageUp className="size-6" />} label="Upload Image" hint="Drag & drop a photo (JPG/PNG)" onClick={() => imageInput.current?.click()} />
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="video" className="mt-4 m-0 p-0">
                    {!systemOn ? (
                      <div className="flex w-full h-[120px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface/50 text-muted-foreground opacity-70">
                        <Activity className="size-6 mb-2 opacity-50" />
                        <p className="text-sm font-bold">System is Offline</p>
                        <p className="text-xs">Enable System Control in the sidebar</p>
                      </div>
                    ) : (
                      <>
                        <input ref={videoInput} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) runDetection("video", f); }} />
                        <UploadDrop icon={<FileVideo className="size-6" />} label="Upload Video" hint="Drag & drop a clip (MP4)" onClick={() => videoInput.current?.click()} />
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="live" className="mt-4 m-0 p-0">
                    {!systemOn ? (
                      <div className="flex w-full h-[120px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface/50 text-muted-foreground opacity-70">
                        <Activity className="size-6 mb-2 opacity-50" />
                        <p className="text-sm font-bold">System is Offline</p>
                        <p className="text-xs">Enable System Control in the sidebar</p>
                      </div>
                    ) : (
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-background p-6 flex flex-col items-center text-center shadow-inner h-[120px] justify-center">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
                        <div className="relative z-10 flex items-center justify-between w-full max-w-lg mx-auto">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-full shadow-md border border-primary/10">
                              <Radar className="size-6 text-primary animate-pulse" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-display text-base font-bold text-foreground">Edge Camera Feed</h3>
                              <p className="text-xs text-muted-foreground font-medium">Real-time simulation</p>
                            </div>
                          </div>
                          <Button onClick={() => runDetection("video", new File([""], "dummy.mp4"))} disabled={running} className="rounded-xl px-6 shadow-md shadow-primary/20 h-10 font-bold">
                            {running ? <Loader2 className="size-4 animate-spin mr-2" /> : <Play className="size-4 mr-2" />}
                            {running ? "Processing..." : "Start Feed"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Timeline */}
                <div className="bg-surface/50 rounded-2xl border border-border p-4 relative">
                  <div className="flex items-center justify-between text-xs font-bold text-primary mb-3">
                    <span className="flex items-center gap-2">
                      {running ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Activity className="size-3.5" />
                      )}
                      {running
                        ? "Processing Data..."
                        : result
                          ? "Processing Complete"
                          : "System Ready"}
                    </span>
                  </div>
                  <div className="relative flex justify-between items-center px-2">
                    <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-border" />
                    <div
                      className="absolute left-4 top-1/2 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500 ease-out"
                      style={{
                        width: `calc(${(Math.max(0, timelineStep) / (TIMELINE_STEPS.length - 1)) * 100}% - 32px)`,
                      }}
                    />

                    {TIMELINE_STEPS.map((step, i) => {
                      const isCompleted = i < timelineStep || result;
                      const isActive = i === timelineStep && running;
                      return (
                        <div
                          key={step}
                          className="relative z-10 flex flex-col items-center group cursor-default"
                        >
                          <div
                            className={cn(
                              "size-3.5 rounded-full border-2 transition-all duration-300 shadow-sm",
                              isCompleted
                                ? "bg-primary border-primary scale-110"
                                : isActive
                                  ? "bg-background border-primary scale-125 pulse-dot"
                                  : "bg-background border-border",
                            )}
                          />
                          <span
                            className={cn(
                              "absolute top-5 whitespace-nowrap text-[9px] font-bold transition-all duration-300",
                              isCompleted || isActive
                                ? "text-primary opacity-100"
                                : "text-muted-foreground opacity-40",
                              isActive && "scale-105",
                            )}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-4" />
                </div>

                {/* Preview Area */}
                <div className="w-full aspect-video overflow-hidden rounded-2xl bg-black relative shadow-inner flex items-center justify-center min-h-[250px]">
                  {result ? (
                    <div className="relative size-full animate-in zoom-in-95 duration-500">
                      {result.media ? (
                        result.kind === "video" ? (
                          <video
                            src={result.media}
                            className="size-full object-cover"
                            muted
                            autoPlay
                            loop
                          />
                        ) : (
                          <img
                            src={result.media}
                            alt={`${result.animal} detection`}
                            className="size-full object-cover"
                          />
                        )
                      ) : (
                        <div className="size-full bg-surface-2 opacity-80" />
                      )}

                      <div
                        className="absolute rounded-xl border-2 border-destructive bg-destructive/10 backdrop-blur-[2px] transition-all duration-500 ease-out shadow-[0_0_20px_rgba(255,107,107,0.3)]"
                        style={{
                          left: `${result.box.x}%`,
                          top: `${result.box.y}%`,
                          width: `${result.box.w}%`,
                          height: `${result.box.h}%`,
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-destructive/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white shadow-lg border border-white/20 flex items-center gap-1.5">
                          <AlertTriangle className="size-3" />
                          {result.animal} • {result.confidence}%
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                        <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white shadow-lg">
                          <p className="text-[9px] font-bold tracking-widest opacity-70 uppercase">
                            Zone
                          </p>
                          <p className="font-medium text-xs">{result.side}</p>
                        </div>
                        <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white shadow-lg text-right">
                          <p className="text-[9px] font-bold tracking-widest opacity-70 uppercase">
                            Time
                          </p>
                          <p className="font-medium text-xs tabular-nums">{result.time}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-sm font-medium text-muted-foreground opacity-60">
                      <Camera className="size-10" />
                      <p>Feed offline. Awaiting simulation.</p>
                    </div>
                  )}
                </div>
              </div>
            </PanelSection>
          </div>

          {/* ----------------- RIGHT COLUMN (4 Columns) ----------------- */}
          <div className="lg:col-span-4 space-y-8 flex flex-col">
            {/* 2. ANALYSIS RESULTS CARD (Same exact layout/height principles as left column) */}
            <PanelSection
              title="Analysis Results"
              description="AI insights & actions"
              className={cn(cardClasses, "relative")}
            >
              {/* Generate Report Button - Dropdown with Hover fixes */}
              <div className="absolute top-6 right-6 md:top-8 md:right-8">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg font-bold shadow-sm border-border bg-white text-foreground hover:bg-surface hover:text-primary transition-all h-8 px-3"
                    >
                      <Download className="mr-2 size-3.5" />
                      Report
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                    <DropdownMenuItem
                      onClick={() => handleAction("Download Report")}
                      className="rounded-lg font-medium cursor-pointer"
                    >
                      <Download className="mr-2 size-4 text-muted-foreground" /> Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction("Print Report")}
                      className="rounded-lg font-medium cursor-pointer"
                    >
                      <Printer className="mr-2 size-4 text-muted-foreground" /> Print Report
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction("Share Report")}
                      className="rounded-lg font-medium cursor-pointer"
                    >
                      <Share2 className="mr-2 size-4 text-muted-foreground" /> Share Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex-1 flex flex-col justify-between h-full pt-4">
                {result && animal ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between animate-in fade-in duration-500">
                    <div className="flex items-center justify-between p-4 bg-surface/50 rounded-2xl border border-border">
                      <div className="flex items-center gap-3">
                        <span className="flex size-12 items-center justify-center rounded-xl bg-white shadow-sm text-2xl border border-border">
                          {animal.emoji}
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Detected
                          </p>
                          <h4 className="font-display text-xl font-bold text-foreground leading-tight">
                            {result.animal}
                          </h4>
                        </div>
                      </div>
                      <RiskPill level={animal.severity} />
                    </div>

                    {/* AI Recommendation */}
                    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-5 shadow-sm">
                      <h5 className="flex items-center text-xs font-bold text-primary mb-2">
                        <Focus className="mr-2 size-4" /> AI Recommendation
                      </h5>
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {result.animal} movement detected. Activate {result.side} Siren to deter
                        intrusion.
                      </p>
                      <Button 
                        className="w-full mt-4 bg-primary text-black font-bold shadow-md hover:bg-primary/90" 
                        onClick={() => window.location.href = '/farm-heatmap?detected=true'}
                      >
                        <MapIcon className="mr-2 size-4" />
                        Show Heat Map
                      </Button>
                      <div className="flex gap-6 mt-4 pt-4 border-t border-primary/10">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            Priority
                          </p>
                          <p className="text-xs font-bold text-destructive">Critical</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            Confidence
                          </p>
                          <p className="text-xs font-bold text-foreground">{result.confidence}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                        Immediate Response
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Primary Action */}
                        <Button
                          variant="default"
                          className="col-span-2 justify-center rounded-xl font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all h-12 bg-primary text-white hover:bg-primary/90"
                          disabled={actionLoading !== null}
                          onClick={() => handleAction("Siren")}
                        >
                          {actionLoading === "Siren" ? (
                            <Loader2 className="mr-2 size-4 animate-spin text-white" />
                          ) : (
                            <Volume2 className="mr-2 size-4 text-white" />
                          )}
                          <span className="text-white">Trigger Siren</span>
                        </Button>

                        {/* Secondary Actions */}
                        <Button
                          variant="outline"
                          className="justify-center rounded-xl font-bold bg-white text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 border border-border h-12 transition-all"
                          disabled={actionLoading !== null}
                          onClick={() => handleAction("Flash")}
                        >
                          {actionLoading === "Flash" ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Zap className="mr-2 size-4 text-warning" />
                          )}
                          Flash
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-center rounded-xl font-bold bg-white text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 border border-border h-12 transition-all"
                          disabled={actionLoading !== null}
                          onClick={() => handleAction("Voice")}
                        >
                          {actionLoading === "Voice" ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Radio className="mr-2 size-4 text-primary" />
                          )}
                          Voice
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-center rounded-xl font-bold bg-white text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 border border-border h-10 transition-all"
                          disabled={actionLoading !== null}
                          onClick={() => handleAction("Farmer")}
                        >
                          Farmer
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-center rounded-xl font-bold bg-white text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 border border-border h-10 transition-all"
                          disabled={actionLoading !== null}
                          onClick={() => handleAction("Village")}
                        >
                          Village
                        </Button>
                      </div>
                    </div>
                    
                    {/* View Heat Map CTA */}
                    <div className="pt-4 mt-2 border-t border-border/50">
                       <Link to="/farm-heatmap" search={{ detected: true }}>
                         <Button className="w-full justify-between rounded-xl font-bold bg-gradient-to-r from-primary to-[#2E7D32] text-white hover:opacity-90 shadow-lg shadow-primary/20 h-12 transition-all group">
                            <span className="flex items-center">
                               <MapPin className="mr-2 size-4 text-white/80 group-hover:scale-110 transition-transform" />
                               View Heat Map
                            </span>
                            <ArrowRight className="size-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                         </Button>
                       </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center opacity-60 py-12">
                    <ShieldCheck className="size-10 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground max-w-[200px]">
                      Awaiting AI insights. Run simulation.
                    </p>
                  </div>
                )}
              </div>
            </PanelSection>
          </div>
        </div>


      </div>
    </AppShell>
  );
}

function UploadDrop({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full h-[120px] flex-row items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-white px-6 transition-all hover:border-primary hover:bg-primary/5 group"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-surface text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
        {icon}
      </span>
      <div className="text-left">
        <span className="block text-sm font-bold text-foreground">{label}</span>
        <span className="block mt-0.5 text-xs font-medium text-muted-foreground">{hint}</span>
      </div>
    </button>
  );
}
