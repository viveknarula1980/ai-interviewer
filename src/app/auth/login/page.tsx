"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { BrainCircuit, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("registered")) {
      toast.success("Account created! Please sign in.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      toast.error("Invalid email or password.");
      setLoading(false);
    } else {
      toast.success("Welcome back!");
      setTimeout(() => { window.location.href = "/profile"; }, 900);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

        .login-root {
          min-height: 100vh;
          display: flex;
          background: #05060f;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── left panel ── */
        .left-panel {
          flex: 1;
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(145deg, #08102b 0%, #05060f 60%);
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        @media(min-width:1024px) { .left-panel { display: flex; } }

        .left-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .left-orb-1 {
          position: absolute;
          width: 500px; height: 500px;
          top: -120px; left: -120px;
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .left-orb-2 {
          position: absolute;
          width: 400px; height: 400px;
          bottom: -80px; right: -80px;
          background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: border-color 0.3s;
        }
        .feature-card:hover { border-color: rgba(59,130,246,0.25); }

        .feature-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 18px;
        }

        /* ── right panel (form) ── */
        .right-panel {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          position: relative;
        }
        @media(min-width:1024px) { .right-panel { width: 480px; flex-shrink: 0; } }

        .right-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(59,130,246,0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .form-card {
          width: 100%;
          max-width: 400px;
          position: relative;
          z-index: 10;
        }

        .brand-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 40px;
        }
        .brand-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(59,130,246,0.35);
        }
        .brand-name {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: white;
          letter-spacing: -0.02em;
        }

        h1.title {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: 32px;
          color: white;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin: 0 0 8px;
        }
        .subtitle {
          color: #64748b;
          font-size: 15px;
          font-weight: 400;
          margin: 0 0 36px;
        }

        /* Google btn */
        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: -0.01em;
        }
        .google-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }
        .google-btn:active { transform: scale(0.98); }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .divider-text {
          color: #334155;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* Input field */
        .field-wrap {
          position: relative;
          margin-bottom: 14px;
        }
        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 8px;
          transition: color 0.2s;
        }
        .field-label.active { color: #60A5FA; }

        .field-inner {
          position: relative;
        }
        .field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #334155;
          transition: color 0.2s;
          pointer-events: none;
        }
        .field-icon.active { color: #3B82F6; }

        .field-input {
          width: 100%;
          padding: 14px 16px 14px 46px;
          background: rgba(0,0,0,0.35);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: #1e293b; }
        .field-input:focus {
          border-color: rgba(59,130,246,0.5);
          background: rgba(0,0,0,0.5);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.08);
        }
        .field-input:disabled { opacity: 0.45; }
        .field-input.has-right { padding-right: 46px; }

        .field-right-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #334155;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .field-right-btn:hover { color: #94a3b8; }

        .forgot-link {
          display: block;
          text-align: right;
          margin-top: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #3B82F6;
          text-decoration: none;
          transition: color 0.2s;
        }
        .forgot-link:hover { color: #60A5FA; }

        /* Submit */
        .submit-btn {
          width: 100%;
          margin-top: 24px;
          padding: 15px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
          color: white;
          font-size: 15px;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.25s;
          box-shadow: 0 8px 24px -8px rgba(99,102,241,0.55);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #60A5FA, #818CF8);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .submit-btn:hover::before { opacity: 1; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px -8px rgba(99,102,241,0.65); }
        .submit-btn:active { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .submit-btn span { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .register-link {
          text-align: center;
          margin-top: 28px;
          font-size: 14px;
          color: #334155;
          font-weight: 400;
        }
        .register-link a {
          color: #3B82F6;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .register-link a:hover { color: #60A5FA; }

        .terms-text {
          text-align: center;
          margin-top: 16px;
          font-size: 11px;
          color: #1e293b;
          line-height: 1.6;
        }
        .terms-text a { color: #334155; text-decoration: none; }
        .terms-text a:hover { color: #64748b; }

        /* left panel testimonial */
        .testimonial {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px 32px;
        }
        .stars { color: #F59E0B; font-size: 14px; letter-spacing: 2px; margin-bottom: 12px; }
        .testimonial-text {
          color: #94a3b8;
          font-size: 15px;
          line-height: 1.7;
          margin-bottom: 20px;
          font-style: italic;
        }
        .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; color: white;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          font-family: 'Sora', sans-serif;
        }
      `}</style>

      <div className="login-root">

        {/* ═══ LEFT PANEL ═══ */}
        <div className="left-panel">
          <div className="left-grid" />
          <div className="left-orb-1" />
          <div className="left-orb-2" />

          {/* Brand */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <Link href="/" className="brand-logo">
              <div className="brand-icon">
                <BrainCircuit size={20} color="white" />
              </div>
              <span className="brand-name">AI Interviewer</span>
            </Link>

            <div style={{ marginBottom: 48 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 36, color: "white", letterSpacing: "-0.04em", lineHeight: 1.15, margin: "0 0 16px" }}>
                Ace your next<br />
                <span style={{ background: "linear-gradient(135deg,#60A5FA,#818CF8,#22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  technical interview.
                </span>
              </h2>
              <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                Join thousands of engineers who land offers at top companies using our AI-powered mock interview platform.
              </p>
            </div>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
              {[
                { icon: "🎙️", bg: "rgba(59,130,246,0.12)", title: "Voice AI Interviewer", desc: "Real-time adaptive questioning based on your resume" },
                { icon: "📊", bg: "rgba(139,92,246,0.12)", title: "Deep Performance Analytics", desc: "Detailed breakdowns of every session's strengths" },
                { icon: "🔒", bg: "rgba(20,184,166,0.12)", title: "Enterprise Security", desc: "256-bit encrypted, SOC-2 aligned infrastructure" },
              ].map((f) => (
                <div key={f.title} className="feature-card">
                  <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: 14, marginBottom: 3, fontFamily: "'Sora',sans-serif" }}>{f.title}</div>
                    <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">
                "After two weeks of daily sessions, I felt genuinely prepared. Landed a senior role at a FAANG company. This platform is the real deal."
              </p>
              <div className="testimonial-author">
                <div className="avatar">AK</div>
                <div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 13 }}>Arjun K.</div>
                  <div style={{ color: "#475569", fontSize: 12 }}>Senior SWE · Google</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL (FORM) ═══ */}
        <div className="right-panel">
          <div className="right-bg" />

          <motion.div
            className="form-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Mobile brand */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Link href="/" className="brand-logo" style={{ display: "inline-flex" }}>
                <div className="brand-icon" style={{ width: 36, height: 36, borderRadius: 10 }}>
                  <BrainCircuit size={17} color="white" />
                </div>
                <span className="brand-name" style={{ fontSize: 15 }}>AI Interviewer</span>
              </Link>
            </div>

            <h1 className="title" style={{ textAlign: "center" }}>Sign in</h1>
            <p className="subtitle" style={{ textAlign: "center" }}>Welcome back — let's get you prepared.</p>

            {/* Google */}
            <button
              type="button"
              className="google-btn"
              onClick={() => signIn("google", { callbackUrl: "/profile" })}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or</span>
              <div className="divider-line" />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="field-wrap">
                <label className={`field-label ${focused === "email" ? "active" : ""}`}>Email</label>
                <div className="field-inner">
                  <Mail size={16} className={`field-icon ${focused === "email" ? "active" : ""}`} />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    disabled={loading}
                    className="field-input"
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-wrap">
                <label className={`field-label ${focused === "password" ? "active" : ""}`}>Password</label>
                <div className="field-inner">
                  <Lock size={16} className={`field-icon ${focused === "password" ? "active" : ""}`} />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="••••••••••"
                    value={password}
                    disabled={loading}
                    className="field-input has-right"
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" className="field-right-btn" onClick={() => setShowPass(s => !s)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <Link href="/auth/forgot" className="forgot-link">Forgot password?</Link>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                <span>
                  {loading ? (
                    <><div className="spinner" /> Signing in…</>
                  ) : (
                    <>Sign In <ArrowRight size={16} /></>
                  )}
                </span>
              </button>
            </form>

            <p className="register-link">
              Don't have an account?{" "}
              <Link href="/auth/register">Create one free</Link>
            </p>

            <p className="terms-text">
              By signing in, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "#05060f", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 380, height: 520, borderRadius: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
