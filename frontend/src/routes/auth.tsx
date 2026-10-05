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
      { title: "Authentication — AgriShield AI Crop Guard" },
      { name: "description", content: "Log in or register your farm to start AI animal intrusion monitoring with AgriShield AI." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { ready } = useAppState();
  const { isAuthed, login, signup, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    remember: true
  });

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


  useEffect(() => {
    if (ready && isAuthed) {
      if (user?.email === "alert@gmail.com") {
        navigate({ to: "/hardware-alert", replace: true });
      } else {
        navigate({ to: "/dashboard", replace: true });
      }
    }
  }, [ready, isAuthed, navigate, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
          toast.error("Validation Error", { description: "Please fill all fields." });
          setLoading(false);
          return;
        }
        await signup({ name: formData.name, email: formData.email, mobile: formData.mobile, password: formData.password });
        toast.success("Account Created", { description: "Welcome to AgriShield!" });
        
        // Auto login after signup
        await login({ email: formData.email, password: formData.password });
      } else {
        await login({ email: formData.email, password: formData.password });
        if (formData.email === 'alert@gmail.com') {
          toast.success("Hardware Armed", { description: "Deterrent device ready." });
        } else {
          toast.success("Welcome back", { description: "Monitoring console unlocked." });
        }
      }
    } catch (err: any) {
      toast.error(isRegister ? "Registration Failed" : "Login Failed", { description: err.message || "Please check your credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#07111F] text-white overflow-hidden relative selection:bg-[#A3E635]/30">
      {/* Global Background Elements */}
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
            animate={{
              opacity: [0, 0.7, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Left Panel */}
      <div className="relative z-10 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 w-full lg:w-[55%] xl:w-[60%] lg:min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="grid size-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-[#A3E635] shadow-lg">
            <ShieldCheck className="size-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-wide">AgriShield AI</span>
        </motion.div>

        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] tracking-tight mb-8"
          >
            Protect every harvest.
            <br />
            <span className="text-white/40 font-light">Before wildlife reaches it.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg lg:text-xl text-white/70 leading-relaxed font-light space-y-6"
          >
            <p>
              Real-time AI detects wild animals,
              <br />
              sends instant Gujarati voice alerts,
              <br />
              and helps protect your crops
              <br />
              before damage occurs.
            </p>
            <div className="w-16 h-[1px] bg-white/20" />
            <ul className="space-y-3 pt-2">
              {["AI Powered", "24×7 Monitoring", "Instant Voice Alerts"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-base text-white/80">
                  <div className="grid size-5 place-items-center rounded-full bg-[#A3E635]/10 text-[#A3E635]">
                    <Check className="size-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 lg:p-12 w-full lg:w-[45%] xl:w-[40%]">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] relative"
        >
          <div className="mb-10 text-center relative z-10">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-sm text-white/50 font-light">
              {isRegister ? "Register your farm to get started." : "Sign in to your AgriShield console."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {isRegister && (
              <div className="space-y-4">
                <div className="space-y-2.5 group">
                  <Label htmlFor="name" className="text-[11px] font-semibold uppercase tracking-widest text-white/40 group-focus-within:text-[#A3E635] transition-colors duration-300">
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20 hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] focus-visible:bg-white/[0.05] focus-visible:ring-[#A3E635]/40 focus-visible:border-[#A3E635] transition-all duration-300 rounded-xl h-12 px-4 text-base text-white placeholder:text-white/30"
                      required={isRegister}
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 group">
                  <Label htmlFor="mobile" className="text-[11px] font-semibold uppercase tracking-widest text-white/40 group-focus-within:text-[#A3E635] transition-colors duration-300">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20 hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] focus-visible:bg-white/[0.05] focus-visible:ring-[#A3E635]/40 focus-visible:border-[#A3E635] transition-all duration-300 rounded-xl h-12 px-4 text-base text-white placeholder:text-white/30"
                      required={isRegister}
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2.5 group">
              <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-widest text-white/40 group-focus-within:text-[#A3E635] transition-colors duration-300">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20 hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] focus-visible:bg-white/[0.05] focus-visible:ring-[#A3E635]/40 focus-visible:border-[#A3E635] transition-all duration-300 rounded-xl h-12 px-4 text-base text-white placeholder:text-white/30"
                  required
                  placeholder="Enter your email"
                />
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#A3E635] opacity-0 transition-opacity duration-300" style={{ opacity: formData.email.includes('@') ? 1 : 0 }} />
              </div>
            </div>

            <div className="space-y-2.5 group">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-[11px] font-semibold uppercase tracking-widest text-white/40 group-focus-within:text-[#A3E635] transition-colors duration-300"
                >
                  Password
                </Label>
                {!isRegister && (
                  <a href="#" className="text-[11px] font-medium text-white/40 hover:text-white transition-colors duration-300">
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20 hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] focus-visible:bg-white/[0.05] focus-visible:ring-[#A3E635]/40 focus-visible:border-[#A3E635] transition-all duration-300 rounded-xl h-12 px-4 pr-12 text-base text-white placeholder:text-white/30"
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors duration-300 p-1"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-1 pb-2">
              <Checkbox
                id="remember"
                checked={formData.remember}
                onCheckedChange={(c) => setFormData({ ...formData, remember: c as boolean })}
                className="rounded-[4px] border-white/20 data-[state=checked]:bg-[#A3E635] data-[state=checked]:border-[#A3E635] data-[state=checked]:text-[#07111F] transition-all duration-300"
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Remember me
              </Label>
            </div>

            <div className="space-y-4 pt-2">
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[52px] rounded-xl text-[13px] font-bold uppercase tracking-wider bg-[#A3E635] text-[#07111F] hover:bg-[#84CC16] hover:shadow-[0_12px_24px_rgba(163,230,53,0.3)] transition-all duration-300 group overflow-hidden relative"
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <div className="size-4 border-2 border-[#07111F]/30 border-t-[#07111F] rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2 w-full"
                      >
                        {isRegister ? "Create Account" : "Sign In"}
                        <ChevronRight className="size-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </form>

          <div className="mt-8 text-center relative z-10">
            <p className="text-[13px] text-white/50">
              {isRegister ? "Already have an account?" : "New to AgriShield?"}{" "}
              <button 
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="font-semibold text-[#A3E635] relative group/link transition-colors duration-300"
              >
                {isRegister ? "Sign In" : "Register Farm"}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#A3E635] group-hover/link:w-full transition-all duration-300 ease-out" />
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
