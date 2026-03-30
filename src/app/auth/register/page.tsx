"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { BrainCircuit, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

/* ── Google SVG icon ── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

/* ── Password strength ── */
function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short", color: "#EF4444" },
    { label: "Weak", color: "#F97316" },
    { label: "Fair", color: "#EAB308" },
    { label: "Good", color: "#22C55E" },
    { label: "Strong", color: "#10B981" },
  ];
  return { score, ...map[score] };
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const strength = getStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      toast.success("Account created! Redirecting…");
      setTimeout(() => router.push("/auth/login?registered=true"), 1200);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    "Unlimited AI mock interview sessions",
    "Resume-aware adaptive questioning",
    "Detailed post-session analytics",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .reg-root {
          min-height: 100vh;
          display: flex;
          background: #05060f;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── Left panel ── */
        .reg-left {
          flex: 1;
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(145deg, #0a0b22 0%, #05060f 60%);
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        @media(min-width:1024px){ .reg-left { display: flex; } }

        .reg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .reg-orb-1 {
          position: absolute; width: 520px; height: 520px;
          top: -130px; left: -130px;
          background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .reg-orb-2 {
          position: absolute; width: 400px; height: 400px;
          bottom: -80px; right: -80px;
          background: radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }

        /* Step indicator */
        .steps-wrap {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 40px;
        }
        .step-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .step-left {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .step-dot {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          flex-shrink: 0;
          font-family: 'Sora', sans-serif;
        }
        .step-dot.done {
          background: linear-gradient(135deg, #8B5CF6, #6366F1);
          color: white;
          box-shadow: 0 0 16px rgba(139,92,246,0.45);
        }
        .step-dot.active {
          background: rgba(139,92,246,0.15);
          border: 1.5px solid rgba(139,92,246,0.5);
          color: #A78BFA;
        }
        .step-dot.idle {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          color: #334155;
        }
        .step-line {
          width: 1.5px; height: 28px; margin: 4px 0;
          background: rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .step-content { padding-bottom: 28px; }
        .step-title {
          font-family: 'Sora', sans-serif;
          font-weight: 600; font-size: 14px; color: white;
          margin-bottom: 3px; margin-top: 5px;
        }
        .step-title.idle { color: #334155; }
        .step-desc { font-size: 12px; color: #475569; line-height: 1.5; }

        /* Perk list */
        .perk-item {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px;
          border-radius: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 10px;
          transition: border-color 0.25s;
        }
        .perk-item:hover { border-color: rgba(139,92,246,0.2); }
        .perk-check {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.3);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* Trust badge */
        .trust-row {
          display: flex; align-items: center; gap: 24px;
          padding: 20px 24px;
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .trust-stat { text-align: center; }
        .trust-val {
          font-family: 'Sora', sans-serif;
          font-weight: 800; font-size: 22px;
          background: linear-gradient(135deg,#A78BFA,#818CF8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .trust-label { font-size: 11px; color: #334155; margin-top: 2px; }
        .trust-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.06); }

        /* ── Right panel ── */
        .reg-right {
          width: 100%;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 24px;
          position: relative;
        }
        @media(min-width:1024px){ .reg-right { width: 500px; flex-shrink: 0; } }

        .reg-right-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .reg-card {
          width: 100%; max-width: 420px;
          position: relative; z-index: 10;
        }

        /* Brand */
        .reg-brand {
          display: inline-flex; align-items: center; gap: 10px;
          text-decoration: none; margin-bottom: 36px;
        }
        .reg-brand-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #8B5CF6, #6366F1);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(139,92,246,0.35);
        }
        .reg-brand-name {
          font-family: 'Sora', sans-serif; font-weight: 700;
          font-size: 16px; color: white; letter-spacing: -0.02em;
        }

        h1.reg-title {
          font-family: 'Sora', sans-serif; font-weight: 800;
          font-size: 30px; color: white; letter-spacing: -0.04em;
          line-height: 1.1; margin: 0 0 8px; text-align: center;
        }
        .reg-subtitle {
          color: #64748b; font-size: 14px; font-weight: 400;
          margin: 0 0 32px; text-align: center; line-height: 1.6;
        }

        /* Google btn */
        .reg-google {
          width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 13px;
          border-radius: 14px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: white;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.2s; letter-spacing: -0.01em;
        }
        .reg-google:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }
        .reg-google:active { transform: scale(0.98); }

        .reg-divider {
          display: flex; align-items: center; gap: 12px; margin: 22px 0;
        }
        .reg-divider-line { flex:1; height:1px; background: rgba(255,255,255,0.07); }
        .reg-divider-text {
          color: #334155; font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
        }

        /* Field */
        .reg-field { margin-bottom: 14px; }
        .reg-label {
          display: block; font-size: 12px; font-weight: 600;
          color: #475569; letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 7px;
          transition: color 0.2s;
        }
        .reg-label.active { color: #A78BFA; }
        .reg-input-wrap { position: relative; }
        .reg-icon {
          position: absolute; left: 15px; top: 50%;
          transform: translateY(-50%); color: #334155;
          transition: color 0.2s; pointer-events: none;
        }
        .reg-icon.active { color: #8B5CF6; }
        .reg-input {
          width: 100%; padding: 13px 15px 13px 44px;
          background: rgba(0,0,0,0.35);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 12px; color: white;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: all 0.2s; box-sizing: border-box;
        }
        .reg-input::placeholder { color: #1e293b; }
        .reg-input:focus {
          border-color: rgba(139,92,246,0.5);
          background: rgba(0,0,0,0.5);
          box-shadow: 0 0 0 4px rgba(139,92,246,0.08);
        }
        .reg-input:disabled { opacity: 0.45; }
        .reg-input.has-right { padding-right: 44px; }
        .reg-eye {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #334155; padding: 4px; display: flex;
          align-items: center; transition: color 0.2s;
        }
        .reg-eye:hover { color: #94a3b8; }

        /* Password strength bar */
        .strength-bar-wrap {
          display: flex; gap: 4px; margin-top: 8px;
        }
        .strength-seg {
          flex: 1; height: 3px; border-radius: 99px;
          background: rgba(255,255,255,0.07);
          transition: background 0.35s;
        }
        .strength-label-row {
          display: flex; justify-content: flex-end;
          margin-top: 5px;
        }
        .strength-label {
          font-size: 11px; font-weight: 600; transition: color 0.3s;
        }

        /* Submit */
        .reg-submit {
          width: 100%; margin-top: 22px; padding: 14px;
          border-radius: 14px; border: none;
          background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
          color: white; font-size: 15px;
          font-family: 'Sora', sans-serif; font-weight: 700;
          letter-spacing: -0.02em; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.25s;
          box-shadow: 0 8px 24px -8px rgba(139,92,246,0.55);
          position: relative; overflow: hidden;
        }
        .reg-submit::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #A78BFA, #818CF8);
          opacity: 0; transition: opacity 0.25s;
        }
        .reg-submit:hover::before { opacity: 1; }
        .reg-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 32px -8px rgba(139,92,246,0.65); }
        .reg-submit:active { transform: scale(0.98); }
        .reg-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .reg-submit span { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; }

        .reg-spinner {
          width: 17px; height: 17px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .reg-footer-text {
          text-align: center; margin-top: 24px;
          font-size: 13px; color: #334155;
        }
        .reg-footer-text a {
          color: #8B5CF6; font-weight: 600; text-decoration: none;
          transition: color 0.2s;
        }
        .reg-footer-text a:hover { color: #A78BFA; }

        .reg-terms {
          text-align: center; margin-top: 14px;
          font-size: 11px; color: #1e293b; line-height: 1.6;
        }
        .reg-terms a { color: #334155; text-decoration: none; }
        .reg-terms a:hover { color: #64748b; }
      `}</style>

      <div className="reg-root">

        {/* ═══ LEFT PANEL ═══ */}
        <div className="reg-left">
          <div className="reg-grid" />
          <div className="reg-orb-1" />
          <div className="reg-orb-2" />

          <div style={{ position: "relative", zIndex: 10 }}>
            <Link href="/" className="reg-brand">
              <div className="reg-brand-icon">
                <BrainCircuit size={20} color="white" />
              </div>
              <span className="reg-brand-name">AI Interviewer</span>
            </Link>

            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 34, color: "white", letterSpacing: "-0.04em", lineHeight: 1.15, margin: "0 0 14px" }}>
              Three steps to your<br />
              <span style={{ background: "linear-gradient(135deg,#A78BFA,#818CF8,#60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                dream offer.
              </span>
            </h2>
            <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, margin: "0 0 36px" }}>
              Set up your profile once, and our AI handles the rest — personalized, adaptive, and always improving.
            </p>

            {/* Steps */}
            <div className="steps-wrap">
              {[
                { num: "1", title: "Create your account", desc: "Takes less than 60 seconds", state: "done" },
                { num: "2", title: "Upload your resume", desc: "AI parses it to personalize questions", state: "active" },
                { num: "3", title: "Start your first session", desc: "Live voice interview, instant feedback", state: "idle" },
              ].map((s, i) => (
                <div key={s.num} className="step-row">
                  <div className="step-left">
                    <div className={`step-dot ${s.state}`}>
                      {s.state === "done" ? <Check size={14} /> : s.num}
                    </div>
                    {i < 2 && <div className="step-line" />}
                  </div>
                  <div className="step-content">
                    <div className={`step-title ${s.state === "idle" ? "idle" : ""}`}>{s.title}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: perks + trust */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ marginBottom: 20 }}>
              {perks.map((p) => (
                <div key={p} className="perk-item">
                  <div className="perk-check">
                    <Check size={11} color="#A78BFA" />
                  </div>
                  <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>{p}</span>
                </div>
              ))}
            </div>

            <div className="trust-row">
              {[
                { val: "10K+", label: "Candidates" },
                null,
                { val: "98%", label: "Satisfaction" },
                null,
                { val: "Free", label: "To start" },
              ].map((item, i) =>
                item === null ? (
                  <div key={i} className="trust-divider" />
                ) : (
                  <div key={i} className="trust-stat" style={{ flex: 1 }}>
                    <div className="trust-val">{item.val}</div>
                    <div className="trust-label">{item.label}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div className="reg-right">
          <div className="reg-right-bg" />

          <motion.div
            className="reg-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Mobile brand */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Link href="/" className="reg-brand">
                <div className="reg-brand-icon" style={{ width: 36, height: 36, borderRadius: 10 }}>
                  <BrainCircuit size={17} color="white" />
                </div>
                <span className="reg-brand-name" style={{ fontSize: 15 }}>AI Interviewer</span>
              </Link>
            </div>

            <h1 className="reg-title">Create your account</h1>
            <p className="reg-subtitle">Join 10,000+ engineers landing their dream roles.</p>

            {/* Google */}
            <button type="button" className="reg-google" onClick={() => signIn("google", { callbackUrl: "/profile" })}>
              <GoogleIcon /> Sign up with Google
            </button>

            <div className="reg-divider">
              <div className="reg-divider-line" />
              <span className="reg-divider-text">or</span>
              <div className="reg-divider-line" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="reg-field">
                <label className={`reg-label ${focused === "name" ? "active" : ""}`}>Full Name</label>
                <div className="reg-input-wrap">
                  <User size={15} className={`reg-icon ${focused === "name" ? "active" : ""}`} />
                  <input
                    type="text" required placeholder="Jane Smith"
                    disabled={loading} className="reg-input"
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="reg-field">
                <label className={`reg-label ${focused === "email" ? "active" : ""}`}>Email</label>
                <div className="reg-input-wrap">
                  <Mail size={15} className={`reg-icon ${focused === "email" ? "active" : ""}`} />
                  <input
                    type="email" required placeholder="you@example.com"
                    disabled={loading} className="reg-input"
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="reg-field">
                <label className={`reg-label ${focused === "password" ? "active" : ""}`}>Password</label>
                <div className="reg-input-wrap">
                  <Lock size={15} className={`reg-icon ${focused === "password" ? "active" : ""}`} />
                  <input
                    type={showPass ? "text" : "password"}
                    required placeholder="Min. 8 characters"
                    disabled={loading} className="reg-input has-right"
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button type="button" className="reg-eye" onClick={() => setShowPass(s => !s)}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Strength meter */}
                {formData.password && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="strength-bar-wrap">
                      {[1, 2, 3, 4].map((s) => (
                        <div
                          key={s}
                          className="strength-seg"
                          style={{ background: s <= strength.score ? strength.color : undefined }}
                        />
                      ))}
                    </div>
                    <div className="strength-label-row">
                      <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <button type="submit" className="reg-submit" disabled={loading}>
                <span>
                  {loading ? (
                    <><div className="reg-spinner" /> Creating account…</>
                  ) : (
                    <>Create Free Account <ArrowRight size={15} /></>
                  )}
                </span>
              </button>
            </form>

            <p className="reg-footer-text">
              Already have an account? <Link href="/auth/login">Sign in</Link>
            </p>
            <p className="reg-terms">
              By creating an account you agree to our{" "}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
