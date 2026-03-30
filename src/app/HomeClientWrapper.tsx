"use client";

import Link from "next/link";
import {
  BrainCircuit, UserCircle, Users, BarChart, ShieldCheck,
  ArrowRight, CheckCircle2, Mic, Bot, Sparkles, Zap, ChevronDown
} from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
/* ─────────────────────────── tiny helpers ─────────────────────────── */
function GlowOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full pointer-events-none blur-[120px] ${className}`} />;
}

function ParticleField() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const particles = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: ((i * 137.508) % 100),
    y: ((i * 97.3) % 100),
    size: (i % 4) * 0.5 + 0.5,
    delay: (i % 10) * 0.5,
    duration: (i % 6) + 4,
  })), []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-400/30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ opacity: [0, 1, 0], y: [0, -30, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none z-10"
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />
  );
}

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) setStarted(true);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const total = 60;
    const timer = setInterval(() => {
      frame++;
      setCount(Math.round((end * frame) / total));
      if (frame === total) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [started, end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─────────────────────── magnetic button ─────────────────────── */
function MagneticButton({ href, children, className }: { href: string; children: React.ReactNode; className: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 25 });
  const springY = useSpring(y, { stiffness: 300, damping: 25 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  );
}

/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════════ */
export default function HomeClientWrapper({ session }: { session: any }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["end end", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, 80]);

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const fade = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
  };

  const features = [
    {
      icon: <Bot size={28} />,
      accent: "from-blue-500 to-cyan-400",
      border: "border-blue-500/20",
      glow: "rgba(59,130,246,0.18)",
      label: "AI VOICE ENGINE",
      title: "Hyper-Realistic Voice Sessions",
      desc: "Our neural voice AI listens, adapts, and challenges you with dynamic follow-ups—crafted from your actual resume—exactly like a top-tier recruiter would.",
      check: "Dynamic Difficulty Scaling",
      checkColor: "text-blue-400",
    },
    {
      icon: <BarChart size={28} />,
      accent: "from-violet-500 to-fuchsia-400",
      border: "border-violet-500/20",
      glow: "rgba(139,92,246,0.18)",
      label: "DEEP ANALYTICS",
      title: "Algorithmic Insight Reports",
      desc: "Post-session intelligence surfaces your technical gaps, behavioral patterns, and vocal tone—turning every mock interview into your most valuable data point.",
      check: "Actionable Score Breakdown",
      checkColor: "text-violet-400",
    },
    {
      icon: <ShieldCheck size={28} />,
      accent: "from-teal-500 to-emerald-400",
      border: "border-teal-500/20",
      glow: "rgba(20,184,166,0.18)",
      label: "ENTERPRISE GRADE",
      title: "Zero-Trust Infrastructure",
      desc: "Resumes parsed directly into encrypted PostgreSQL vaults—no disk writes, no third-party exposure. SOC-2 aligned from the first byte.",
      check: "256-Bit End-to-End Encryption",
      checkColor: "text-teal-400",
    },
  ];

  const stats = [
    { val: 98, suffix: "%", label: "Candidate Satisfaction" },
    { val: 12, suffix: "K+", label: "Sessions Conducted" },
    { val: 340, suffix: "+", label: "Companies Onboarded" },
    { val: 4, suffix: "x", label: "Faster Screening" },
  ];

  return (
    <main
      className="min-h-screen overflow-x-hidden text-white selection:bg-cyan-400/30"
      style={{ background: "#060818", fontFamily: "'Sora', 'DM Sans', sans-serif" }}
    >
      {/* ── Google Font import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        :root {
          --c-bg: #060818;
          --c-card: rgba(10,14,38,0.85);
          --c-border: rgba(255,255,255,0.06);
          --c-blue: #3B82F6;
          --c-cyan: #22D3EE;
          --c-violet: #8B5CF6;
        }
        .noise::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }
        .text-gradient {
          background: linear-gradient(135deg, #60A5FA 0%, #818CF8 40%, #22D3EE 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .card-hover {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
        }
        .card-hover:hover { transform: translateY(-10px); }
        .shine {
          position: relative;
          overflow: hidden;
        }
        .shine::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        .shine:hover::after { transform: translateX(100%); }
        .badge-glow {
          box-shadow: 0 0 24px rgba(59,130,246,0.25), inset 0 0 12px rgba(59,130,246,0.05);
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .float { animation: float 5s ease-in-out infinite; }
        .spin-slow { animation: spin-slow 18s linear infinite; }
        .pulse-ring {
          animation: pulseRing 2.5s ease-out infinite;
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          70% { box-shadow: 0 0 0 16px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
      `}</style>

      {/* ────────────────── NAVBAR ────────────────── */}
      <div className="fixed top-5 w-full z-50 flex justify-center px-4">
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 28, delay: 0.2 }}
          className="w-full max-w-[1000px] rounded-2xl border flex items-center justify-between px-6 py-3"
          style={{
            background: "rgba(6,8,24,0.75)",
            backdropFilter: "blur(24px)",
            borderColor: "rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#3B82F6,#8B5CF6)" }}>
              <BrainCircuit size={18} className="text-white" />
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "linear-gradient(135deg,#60A5FA,#A78BFA)", boxShadow: "0 0 20px rgba(139,92,246,0.5)" }} />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-white hidden sm:block" style={{ fontFamily: "'Sora', sans-serif" }}>
              AI Interviewer
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {[
              { label: "AI Simulation", path: "/interview/setup" },
              { label: "My Insights", path: "/history" },
              { label: "Admin Hub", path: "/admin/login" }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className="relative hover:text-white transition-colors group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 right-0 h-[1px] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                  style={{ background: "linear-gradient(90deg,#3B82F6,#22D3EE)" }} />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/profile" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 transition-all">
                <UserCircle size={16} />
              </Link>
            ) : (
              <Link href="/auth/login" className="text-[13px] font-semibold text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
            )}
            <Link
              href="/interview/setup"
              className="shine relative overflow-hidden px-5 py-2 rounded-xl text-[13px] font-bold text-white transition-all"
              style={{
                background: "linear-gradient(135deg,#3B82F6 0%,#8B5CF6 100%)",
                boxShadow: "0 4px 16px -4px rgba(59,130,246,0.5)",
              }}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Get Started <ArrowRight size={13} />
              </span>
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* ────────────────── HERO ────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pb-0 pt-28 overflow-hidden noise grid-bg"
      >
        {/* Orbs */}
        <GlowOrb className="w-[700px] h-[700px] -top-48 -left-48 bg-blue-700/20" />
        <GlowOrb className="w-[600px] h-[600px] -bottom-24 -right-24 bg-violet-700/20" />
        <GlowOrb className="w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-600/10" />

        <ParticleField />
        <ScanLine />

        {/* Rotating ring decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-blue-500/10 spin-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-violet-500/5 spin-slow pointer-events-none" style={{ animationDirection: "reverse", animationDuration: "28s" }} />

        <div className="relative z-20 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-3 mb-10 px-5 py-2.5 rounded-full border badge-glow"
            style={{ background: "rgba(59,130,246,0.08)", borderColor: "rgba(59,130,246,0.25)" }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
            </span>
            <span className="text-cyan-300 text-[11px] font-bold tracking-[0.22em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Next-Gen Interview Intelligence
            </span>
            <Sparkles size={12} className="text-cyan-400" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-5xl sm:text-7xl lg:text-[88px] font-black tracking-[-0.04em] leading-[1.05] mb-7"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Land your dream role
            <br />
            <span className="text-gradient">with AI precision.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="text-[17px] text-slate-400 max-w-xl mx-auto leading-relaxed mb-12 font-medium"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Voice AI that simulates elite technical interviewers—personalized from your resume,
            powered by real-time analytics, trusted by top candidates worldwide.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/interview/setup"
              className="shine group relative overflow-hidden flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-[15px] text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                boxShadow: "0 8px 32px -8px rgba(59,130,246,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              <Mic size={18} />
              Start Practicing Free
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-cyan-300"
                animate={{ scale: [1, 1.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              />
            </Link>

            <Link
              href="/admin/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-[15px] text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}
            >
              Admin Portal <ArrowRight size={15} />
            </Link>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mt-16 flex flex-col items-center gap-2 text-slate-600 text-xs font-medium"
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>scroll to explore</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
              <ChevronDown size={16} />
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #060818)" }} />
      </motion.section>

      {/* ────────────────── STATS BAR ────────────────── */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl overflow-hidden border border-white/5"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-10 px-6 text-center"
                style={{ background: "rgba(6,8,24,0.6)", backdropFilter: "blur(12px)" }}
              >
                <div
                  className="text-4xl font-black mb-2 tracking-tight text-gradient"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  <CountUp end={s.val} suffix={s.suffix} />
                </div>
                <div className="text-slate-500 text-[13px] font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────────────── SPLIT CARDS ────────────────── */}
      <section className="relative px-6 py-16 z-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Candidate Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="card-hover shine relative rounded-3xl overflow-hidden border flex flex-col p-10"
            style={{
              background: "linear-gradient(145deg, rgba(15,22,55,0.95), rgba(8,13,36,0.9))",
              borderColor: "rgba(59,130,246,0.2)",
              boxShadow: "0 24px 64px -16px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" }} />

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 float"
              style={{ background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", boxShadow: "0 8px 24px -8px rgba(59,130,246,0.5)" }}>
              <UserCircle size={26} className="text-white" />
            </div>

            <div className="text-[10px] font-bold tracking-[0.2em] text-blue-400 mb-3 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              For Candidates
            </div>
            <h2 className="text-2xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              Practice. Iterate. Win.
            </h2>
            <p className="text-slate-400 text-[15px] leading-relaxed mb-8 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Simulate real technical interviews powered by your resume. Our AI adapts in real time—
              no scripts, just genuine challenge—so you're battle-ready before day one.
            </p>

            <ul className="space-y-3 mb-10 flex-1">
              {["Resume-aware questioning", "Live voice interaction", "Instant performance metrics"].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-[14px] font-medium text-slate-300">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
                    <CheckCircle2 size={11} className="text-blue-400" />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>

            <Link
              href="/interview/setup"
              className="shine relative overflow-hidden w-full py-3.5 rounded-2xl font-bold text-[14px] text-white text-center flex items-center justify-center gap-2 transition-all"
              style={{
                background: "linear-gradient(135deg,#3B82F6,#6366F1)",
                boxShadow: "0 6px 20px -6px rgba(59,130,246,0.45)",
              }}
            >
              Start for Free <ArrowRight size={15} />
            </Link>
          </motion.div>

          {/* Admin Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="card-hover shine relative rounded-3xl overflow-hidden border flex flex-col p-10"
            style={{
              background: "linear-gradient(145deg, rgba(12,9,40,0.95), rgba(8,6,26,0.9))",
              borderColor: "rgba(139,92,246,0.2)",
              boxShadow: "0 24px 64px -16px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />

            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 float"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 8px 24px -8px rgba(139,92,246,0.5)", animationDelay: "1.5s" }}>
              <ShieldCheck size={26} className="text-white" />
            </div>

            <div className="text-[10px] font-bold tracking-[0.2em] text-violet-400 mb-3 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              For Employers
            </div>
            <h2 className="text-2xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              Screen Smarter. Hire Faster.
            </h2>
            <p className="text-slate-400 text-[15px] leading-relaxed mb-8 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Deploy AI-powered async screening at scale. Review ranked candidate analytics on your own schedule—
              no scheduling hell, no bias, just signal.
            </p>

            <ul className="space-y-3 mb-10 flex-1">
              {["Passive candidate screening", "Global analytics dashboard", "Zero scheduling overhead"].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-[14px] font-medium text-slate-300">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                    <CheckCircle2 size={11} className="text-violet-400" />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>

            <Link
              href="/admin/login"
              className="shine relative overflow-hidden w-full py-3.5 rounded-2xl font-bold text-[14px] text-white text-center flex items-center justify-center gap-2 transition-all"
              style={{
                background: "linear-gradient(135deg,#8B5CF6,#6366F1)",
                boxShadow: "0 6px 20px -6px rgba(139,92,246,0.45)",
              }}
            >
              Admin Portal <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ────────────────── FEATURES ────────────────── */}
      <section className="relative px-6 py-24 z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/8 mb-6"
              style={{ background: "rgba(255,255,255,0.03)", fontFamily: "'JetBrains Mono', monospace" }}>
              <Zap size={12} className="text-yellow-400" />
              <span className="text-[11px] text-slate-400 font-bold tracking-[0.18em] uppercase">Platform Capabilities</span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Everything you need to{" "}
              <span className="text-gradient">dominate the process.</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fade}
                className="card-hover shine relative rounded-3xl p-8 border flex flex-col overflow-hidden"
                style={{
                  background: "rgba(8,11,28,0.8)",
                  borderColor: f.border.replace("border-", "").replace("/20", "").replace("-", " rgba(").split(" ")[0],
                  boxShadow: `0 20px 60px -20px ${f.glow}`,
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              >
                {/* top glow */}
                <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${f.accent} opacity-60`} />
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-50"
                  style={{ background: `radial-gradient(circle, ${f.glow} 0%, transparent 70%)` }} />

                {/* icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white bg-gradient-to-br ${f.accent}`}
                  style={{ boxShadow: `0 6px 20px -8px ${f.glow}` }}>
                  {f.icon}
                </div>

                <div className="text-[10px] font-bold tracking-[0.2em] mb-3 uppercase opacity-60"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "#94A3B8" }}>
                  {f.label}
                </div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tight leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {f.title}
                </h3>
                <p className="text-slate-400 text-[14px] leading-relaxed flex-1 mb-6 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {f.desc}
                </p>

                <div className="mt-auto pt-5 border-t border-white/5">
                  <div className={`flex items-center gap-2 text-[13px] font-semibold ${f.checkColor}`}>
                    <CheckCircle2 size={14} /> {f.check}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────────────── CTA BAND ────────────────── */}
      <section className="relative px-6 py-24 z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden p-16 text-center noise"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(34,211,238,0.1) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 0 80px rgba(99,102,241,0.15)",
            }}
          >
            <GlowOrb className="w-64 h-64 -top-12 -left-12 bg-blue-600/20" />
            <GlowOrb className="w-64 h-64 -bottom-12 -right-12 bg-violet-600/20" />

            <div className="relative z-10">
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 pulse-ring"
                style={{ background: "linear-gradient(135deg,#3B82F6,#8B5CF6)" }}
              >
                <Mic size={32} className="text-white" />
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-black text-white tracking-[-0.03em] mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
                Your next offer starts{" "}
                <span className="text-gradient">right now.</span>
              </h2>
              <p className="text-slate-400 text-[16px] max-w-lg mx-auto mb-10 leading-relaxed font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                No subscription required to begin. Upload your resume, select your target role, and let the AI do the heavy lifting.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/interview/setup"
                  className="shine group flex items-center gap-2.5 px-9 py-4 rounded-2xl font-bold text-[15px] text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                    boxShadow: "0 8px 32px -8px rgba(99,102,241,0.6)",
                  }}
                >
                  <Mic size={17} /> Begin Free Session
                </Link>
                <Link
                  href="/history"
                  className="px-9 py-4 rounded-2xl font-bold text-[15px] text-slate-400 hover:text-white border border-white/8 hover:border-white/20 transition-all"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  View Past Sessions
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer
        className="relative z-10 py-12 px-6 border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#3B82F6,#8B5CF6)" }}>
              <BrainCircuit size={16} className="text-white" />
            </div>
            <span className="font-bold text-[14px] text-slate-400" style={{ fontFamily: "'Sora', sans-serif" }}>AI Interviewer</span>
          </Link>

          <p className="text-slate-600 text-[13px] font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            © {new Date().getFullYear()} AI Interviewer Simulator. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-[13px] font-medium text-slate-600">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <Link key={l} href="#" className="hover:text-slate-300 transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
