import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Eye, EyeOff, CheckCircle2, ChevronRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppState } from "@/lib/app-state";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AgriShield AI Crop Guard" },
      {
        name: "description",
        content:
          "Log in or register your farm to start AI animal intrusion monitoring with AgriShield AI.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { ready, login: appLogin } = useAppState();
  const { login: authLogin, signup: authSignup, isAuthed } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    remember: true,
  });

  useEffect(() => {
    if (ready && isAuthed) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [ready, isAuthed, navigate]);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (/[^\d\s]/.test(val)) {
      toast.error("Invalid Input", { description: "Only numbers are allowed for mobile number." });
      return;
    }

    const rawDigits = val.replace(/\D/g, "");
    if (rawDigits.length > 10) {
      toast.error("Limit Exceeded", { description: "Mobile number cannot exceed 10 digits." });
      return;
    }

    setFormData({ ...formData, mobile: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawDigits = formData.mobile.replace(/\D/g, "");
    if (rawDigits.length !== 10) {
      toast.error("Invalid Mobile Number", { description: "Please enter exactly 10 digits." });
      return;
    }

    if (!isLogin) {
      if (formData.firstName.trim().length < 2) {
        toast.error("Invalid First Name", { description: "First name is required." });
        return;
      }
      if (formData.lastName.trim().length < 2) {
        toast.error("Invalid Last Name", { description: "Last name is required." });
        return;
      }
      if (formData.password.length < 8) {
        toast.error("Weak Password", { description: "Password must be at least 8 characters." });
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await authLogin({ mobile: rawDigits, password: formData.password });
        appLogin();
        toast.success("Welcome back", { description: "Monitoring console unlocked." });
      } else {
        await authSignup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobile: rawDigits,
          email: formData.email || undefined,
          password: formData.password,
        });
        appLogin();
        toast.success("Registration successful", { description: "Welcome to AgriShield AI!" });
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred";
      toast.error(isLogin ? "Login Failed" : "Signup Failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#07111F] text-white overflow-hidden relative selection:bg-[#A3E635]/30">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-[#A3E635]/5 rounded-full blur-[120px] lg:hidden" />
        {Array.from({ length: 45 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#A3E635]"
            style={{
              width: Math.random() * 3 + 1.5,
              height: Math.random() * 3 + 1.5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0, 0.7, 0], y: [0, -30, 0] }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 w-full lg:w-[55%] xl:w-[60%] lg:min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex items-center gap-3 mb-10">
          <div className="grid size-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-[#A3E635] shadow-lg">
            <ShieldCheck className="size-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-wide">AgriShield AI</span>
        </motion.div>

        <div className="max-w-xl">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] tracking-tight mb-8">
            Protect every harvest.<br /><span className="text-white/40 font-light">Before wildlife reaches it.</span>
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="text-lg lg:text-xl text-white/70 leading-relaxed font-light space-y-6">
            <p>Real-time AI detects wild animals,<br />sends instant Gujarati voice alerts,<br />and helps protect your crops<br />before damage occurs.</p>
            <div className="w-16 h-[1px] bg-white/20" />
            <ul className="space-y-3 pt-2">
              {["AI Powered", "24×7 Monitoring", "Instant Voice Alerts"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-base text-white/80">
                  <div className="grid size-5 place-items-center rounded-full bg-[#A3E635]/10 text-[#A3E635]"><Check className="size-3" /></div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 lg:p-12 w-full lg:w-[45%] xl:w-[40%]">
        <motion.div initial={{ opacity: 0, scale: 0.97, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-[420px] relative">
          
          <div className="mb-10 text-center relative z-10">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white">
              {isLogin ? "Welcome Back" : "Register Farm"}
            </h2>
            <p className="mt-2 text-sm text-white/50 font-light">
              {isLogin ? "Sign in to your AgriShield console." : "Create your monitoring account."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -20 }} className="space-y-6 overflow-hidden">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2.5 group">
                      <Label htmlFor="firstName" className="text-[11px] font-semibold uppercase tracking-widest text-white/40 group-focus-within:text-[#A3E635] transition-colors duration-300">First Name</Label>
                      <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required={!isLogin} className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20 focus-visible:bg-white/[0.05] focus-visible:ring-[#A3E635]/40 focus-visible:border-[#A3E635] transition-all duration-300 rounded-xl h-12 px-4 text-base text-white placeholder:text-white/30" placeholder="John" />
                    </div>
                    <div className="space-y-2.5 group">
                      <Label htmlFor="lastName" className="text-[11px] font-semibold uppercase tracking-widest text-white/40 group-focus-within:text-[#A3E635] transition-colors duration-300">Last Name</Label>
                      <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required={!isLogin} className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20 focus-visible:bg-white/[0.05] focus-visible:ring-[#A3E635]/40 focus-visible:border-[#A3E635] transition-all duration-300 rounded-xl h-12 px-4 text-base text-white placeholder:text-white/30" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2.5 group">
                    <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-widest text-white/40 group-focus-within:text-[#A3E635] transition-colors duration-300">Email Address (Optional)</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20 focus-visible:bg-white/[0.05] focus-visible:ring-[#A3E635]/40 focus-visible:border-[#A3E635] transition-all duration-300 rounded-xl h-12 px-4 text-base text-white placeholder:text-white/30" placeholder="john@example.com" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2.5 group">
              <Label htmlFor="mobile" className="text-[11px] font-semibold uppercase tracking-widest text-white/40 group-focus-within:text-[#A3E635] transition-colors duration-300">Mobile Number</Label>
              <div className="relative">
                <Input id="mobile" type="tel" value={formData.mobile} onChange={handleMobileChange} required className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20 focus-visible:bg-white/[0.05] focus-visible:ring-[#A3E635]/40 focus-visible:border-[#A3E635] transition-all duration-300 rounded-xl h-12 px-4 text-base text-white placeholder:text-white/30" placeholder="Enter your 10 digit mobile" />
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#A3E635] transition-opacity duration-300" style={{ opacity: formData.mobile.length > 9 ? 1 : 0 }} />
              </div>
            </div>

            <div className="space-y-2.5 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-widest text-white/40 group-focus-within:text-[#A3E635] transition-colors duration-300">Password</Label>
                {isLogin && <a href="#" className="text-[11px] font-medium text-white/40 hover:text-white transition-colors duration-300">Forgot Password?</a>}
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20 focus-visible:bg-white/[0.05] focus-visible:ring-[#A3E635]/40 focus-visible:border-[#A3E635] transition-all duration-300 rounded-xl h-12 px-4 pr-12 text-base text-white placeholder:text-white/30" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors duration-300 p-1">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center space-x-3 pt-1 pb-2">
                <Checkbox id="remember" checked={formData.remember} onCheckedChange={(c) => setFormData({ ...formData, remember: c as boolean })} className="rounded-[4px] border-white/20 data-[state=checked]:bg-[#A3E635] data-[state=checked]:border-[#A3E635] data-[state=checked]:text-[#07111F]" />
                <Label htmlFor="remember" className="text-sm font-medium leading-none text-white/60 hover:text-white transition-colors cursor-pointer">Remember me</Label>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25, ease: "easeOut" }}>
                <Button type="submit" disabled={loading} className="w-full h-[52px] rounded-xl text-[13px] font-bold uppercase tracking-wider bg-[#A3E635] text-[#07111F] hover:bg-[#84CC16] hover:shadow-[0_12px_24px_rgba(163,230,53,0.3)] transition-all duration-300">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                        <div className="size-4 border-2 border-[#07111F]/30 border-t-[#07111F] rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </motion.div>
                    ) : (
                      <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center justify-center gap-2 w-full">
                        {isLogin ? "Get Started" : "Create Account"}
                        <ChevronRight className="size-4 transition-transform duration-300" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </form>

          <div className="mt-8 text-center relative z-10">
            <p className="text-[13px] text-white/50">
              {isLogin ? "New to AgriShield? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-[#A3E635] relative group/link transition-colors duration-300"
              >
                {isLogin ? "Register Farm" : "Sign In"}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#A3E635] group-hover/link:w-full transition-all duration-300 ease-out" />
              </button>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

