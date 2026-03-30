"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User, FileText, LogOut, ArrowRight, LayoutDashboard,
  Settings, Mic, History, ChevronRight, Sparkles, Shield, TrendingUp
} from "lucide-react";
import ResumeManager from "@/components/ResumeManager";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/* ── Avatar initials ── */
function Avatar({ name, image, size = 48 }: { name?: string; image?: string; size?: number }) {
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.35, fontWeight: 700, color: "white",
        fontFamily: "'Sora',sans-serif", flexShrink: 0, overflow: "hidden",
        boxShadow: "0 0 20px rgba(59,130,246,0.3)",
      }}
    >
      {image ? <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16,
      transition: "border-color 0.25s",
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = accent + "44")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + "18", border: `1px solid ${accent}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "white", fontFamily: "'Sora',sans-serif", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#475569", marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

const tabVariants: any = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function DashboardContent({ session, activeResume }: any) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [name, setName] = useState(session?.user?.name || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      if (res.ok) {
        toast.success("Profile updated!");
        setPassword("");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Update failed");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const navItems = [
    { id: "dashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
    { id: "profile", icon: <User size={16} />, label: "Edit Profile" },
    { id: "resume", icon: <FileText size={16} />, label: "Manage Resume" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        * { box-sizing: border-box; }

        .dash-root {
          display: flex; min-height: 100vh;
          background: #05060f;
          font-family: 'DM Sans', sans-serif;
          color: white;
        }

        /* ── Sidebar ── */
        .dash-sidebar {
          width: 260px; flex-shrink: 0;
          display: flex; flex-direction: column;
          padding: 28px 16px;
          border-right: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.015);
          backdrop-filter: blur(24px);
          position: fixed; top: 0; left: 0; bottom: 0;
          z-index: 30;
        }

        .sidebar-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 0 10px; margin-bottom: 32px;
          text-decoration: none;
        }
        .sidebar-brand-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg,#3B82F6,#8B5CF6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(59,130,246,0.3);
          flex-shrink: 0;
        }
        .sidebar-brand-name {
          font-family: 'Sora',sans-serif; font-weight: 700;
          font-size: 14px; color: white; letter-spacing: -0.02em;
        }

        .sidebar-user {
          display: flex; flex-direction: column; align-items: center;
          padding: 20px 16px; margin-bottom: 8px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
        }
        .sidebar-user-name {
          font-family: 'Sora',sans-serif; font-weight: 700;
          font-size: 14px; color: white; margin-top: 10px;
          text-align: center; max-width: 100%; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }
        .sidebar-user-email {
          font-size: 11px; color: #334155; margin-top: 3px;
          text-align: center; max-width: 100%; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }

        .sidebar-section-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #1e293b;
          padding: 0 12px; margin: 20px 0 8px;
        }

        .nav-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 11px 14px; border-radius: 12px;
          border: none; cursor: pointer; font-size: 13px;
          font-weight: 600; font-family: 'DM Sans',sans-serif;
          transition: all 0.2s; text-align: left; text-decoration: none;
          background: transparent; color: #475569;
          position: relative; overflow: hidden;
          margin-bottom: 2px;
        }
        .nav-btn:hover { color: white; background: rgba(255,255,255,0.04); }
        .nav-btn.active {
          color: white;
          background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.2);
        }
        .nav-btn.active .nav-dot {
          width: 4px; height: 18px; border-radius: 99px;
          background: linear-gradient(180deg,#3B82F6,#8B5CF6);
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
        }

        .nav-btn-history {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 11px 14px; border-radius: 12px;
          border: 1px solid transparent; cursor: pointer; font-size: 13px;
          font-weight: 600; font-family: 'DM Sans',sans-serif;
          transition: all 0.2s; text-decoration: none;
          background: transparent; color: #7C3AED;
          margin-bottom: 2px;
        }
        .nav-btn-history:hover {
          background: rgba(124,58,237,0.08);
          border-color: rgba(124,58,237,0.2);
          color: #A78BFA;
        }

        .sidebar-signout {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 11px 14px; border-radius: 12px;
          border: 1px solid transparent; cursor: pointer; font-size: 13px;
          font-weight: 600; font-family: 'DM Sans',sans-serif;
          transition: all 0.2s; text-decoration: none;
          background: transparent; color: #EF4444; margin-top: auto;
        }
        .sidebar-signout:hover {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.2);
        }

        /* ── Main ── */
        .dash-main {
          flex: 1; margin-left: 260px;
          padding: 40px 48px;
          position: relative; overflow-x: hidden;
          min-height: 100vh;
        }
        @media(max-width:768px){
          .dash-sidebar { display: none; }
          .dash-main { margin-left: 0; padding: 24px 20px; }
        }

        .main-orb-1 {
          position: absolute; width: 700px; height: 700px;
          top: -200px; right: -200px;
          background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .main-orb-2 {
          position: absolute; width: 500px; height: 500px;
          bottom: -100px; left: 10%;
          background: radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .main-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
        }

        .content-wrap {
          position: relative; z-index: 10;
          max-width: 960px; margin: 0 auto;
        }

        /* page title */
        .page-title {
          font-family: 'Sora',sans-serif; font-weight: 800;
          font-size: 34px; letter-spacing: -0.04em;
          color: white; margin: 0 0 6px;
        }
        .page-sub {
          font-size: 14px; color: #334155; margin: 0 0 36px; font-weight: 400;
        }

        /* Cards */
        .card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 28px 32px;
          backdrop-filter: blur(12px);
          transition: border-color 0.25s;
        }
        .card:hover { border-color: rgba(255,255,255,0.1); }

        .card-accent-blue {
          background: linear-gradient(140deg, rgba(37,99,235,0.12) 0%, rgba(99,102,241,0.08) 100%);
          border-color: rgba(59,130,246,0.2);
        }

        /* Form fields */
        .form-label {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #475569; margin-bottom: 8px; transition: color 0.2s;
        }
        .form-label.active { color: #60A5FA; }

        .form-input {
          width: 100%; padding: 13px 16px;
          background: rgba(0,0,0,0.3);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 12px; color: white;
          font-size: 14px; font-family: 'DM Sans',sans-serif;
          outline: none; transition: all 0.2s;
        }
        .form-input::placeholder { color: #1e293b; }
        .form-input:focus {
          border-color: rgba(59,130,246,0.5);
          background: rgba(0,0,0,0.45);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.08);
        }

        /* Save btn */
        .save-btn {
          width: 100%; padding: 14px;
          border-radius: 12px; border: none;
          background: linear-gradient(135deg,#3B82F6,#6366F1);
          color: white; font-size: 14px;
          font-family: 'Sora',sans-serif; font-weight: 700;
          letter-spacing: -0.01em; cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 6px 20px -8px rgba(59,130,246,0.5);
          position: relative; overflow: hidden;
        }
        .save-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg,#60A5FA,#818CF8);
          opacity: 0; transition: opacity 0.25s;
        }
        .save-btn:hover::before { opacity: 1; }
        .save-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 28px -8px rgba(59,130,246,0.6); }
        .save-btn:active { transform: scale(0.98); }
        .save-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .save-btn span { position: relative; z-index: 1; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block; vertical-align: middle; margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Interview CTA card */
        .cta-card {
          border-radius: 20px; padding: 32px;
          background: linear-gradient(140deg, rgba(37,99,235,0.14) 0%, rgba(99,102,241,0.1) 100%);
          border: 1px solid rgba(59,130,246,0.22);
          position: relative; overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .cta-card-orb {
          position: absolute; width: 200px; height: 200px;
          top: -60px; right: -60px;
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .cta-start-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 24px; border-radius: 12px;
          background: linear-gradient(135deg,#3B82F6,#6366F1);
          color: white; font-weight: 700; font-size: 14px;
          font-family: 'Sora',sans-serif; text-decoration: none;
          transition: all 0.25s;
          box-shadow: 0 6px 20px -6px rgba(59,130,246,0.5);
        }
        @media(max-width:639px) { .cta-start-btn-mobile-hide { display: none !important; } }
        .cta-start-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px -6px rgba(59,130,246,0.6); }
        .cta-start-btn:active { transform: scale(0.98); }

        /* Resume card */
        .resume-pill {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px; border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .resume-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #10B981; flex-shrink: 0;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 8px #10B981;
        }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }

        /* Manage link */
        .manage-link {
          display: inline-flex; align-items: center; gap: 6px;
          color: #3B82F6; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: color 0.2s; background: none;
          border: none; cursor: pointer; padding: 0;
        }
        .manage-link:hover { color: #60A5FA; }

        /* Section divider */
        .section-divider {
          height: 1px; background: rgba(255,255,255,0.05);
          margin: 8px 0;
        }
      `}</style>

      <div className="dash-root">

        {/* ═══ SIDEBAR ═══ */}
        <aside className="dash-sidebar">
          {/* Brand */}
          <Link href="/" className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 8v4l2 2" /><path d="M18 2v4h4" />
              </svg>
            </div>
            <span className="sidebar-brand-name">AI Interviewer</span>
          </Link>

          {/* User */}
          <div className="sidebar-user">
            <Avatar name={session?.user?.name} image={session?.user?.image} size={52} />
            <div className="sidebar-user-name">{session?.user?.name || "User"}</div>
            <div className="sidebar-user-email">{session?.user?.email}</div>
          </div>

          {/* Nav */}
          <div className="sidebar-section-label">Menu</div>
          <nav style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-btn ${activeTab === item.id ? "active" : ""}`}
              >
                {item.icon}
                {item.label}
                {activeTab === item.id && <div className="nav-dot" />}
              </button>
            ))}

            <div className="section-divider" style={{ margin: "16px 0 8px" }} />
            <div className="sidebar-section-label" style={{ margin: "0 0 8px" }}>More</div>

            <Link href="/history" className="nav-btn-history">
              <History size={16} /> Past Interviews
            </Link>
          </nav>

          <Link href="/auth/signout" className="sidebar-signout">
            <LogOut size={15} /> Sign Out
          </Link>
        </aside>

        {/* ═══ MAIN ═══ */}
        <main className="dash-main">
          <div className="main-orb-1" />
          <div className="main-orb-2" />
          <div className="main-grid" />

          <div className="content-wrap">
            <AnimatePresence mode="wait">

              {/* ── DASHBOARD TAB ── */}
              {activeTab === "dashboard" && (
                <motion.div key="dashboard" variants={tabVariants} initial="hidden" animate="show" exit="exit">
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                    <div>
                      <h1 className="page-title">
                        Welcome back, {session?.user?.name?.split(" ")[0] || "there"} 👋
                      </h1>
                      <p className="page-sub">Here's your interview practice overview.</p>
                    </div>
                    <Link href="/interview/setup" className="cta-start-btn cta-start-btn-mobile-hide">
                      <Mic size={15} /> New Session
                    </Link>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 28 }}>
                    <StatCard icon={<Mic size={18} />} label="Sessions Done" value="—" accent="#3B82F6" />
                    <StatCard icon={<TrendingUp size={18} />} label="Avg. Score" value="—" accent="#8B5CF6" />
                    <StatCard icon={<Shield size={18} />} label="Resume Active" value={activeResume ? "Yes" : "No"} accent="#10B981" />
                    <StatCard icon={<Sparkles size={18} />} label="Streak" value="—" accent="#F59E0B" />
                  </div>

                  {/* Main cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>

                    {/* Practice CTA */}
                    <div className="cta-card">
                      <div className="cta-card-orb" />
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
                        }}>
                          <Mic size={20} color="#60A5FA" />
                        </div>
                        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "white", margin: "0 0 10px" }}>
                          Ready to practice?
                        </h2>
                        <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7, margin: "0 0 24px" }}>
                          Launch an AI-guided session tailored to your resume and target role. Real questions, real feedback.
                        </p>
                        <Link href="/interview/setup" className="cta-start-btn">
                          Start Session <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* Active Resume */}
                    <div className="card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FileText size={16} color="#A78BFA" />
                          </div>
                          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "white" }}>Active Resume</span>
                        </div>
                        <button className="manage-link" onClick={() => setActiveTab("resume")}>
                          Manage <ChevronRight size={13} />
                        </button>
                      </div>

                      {activeResume ? (
                        <div className="resume-pill">
                          <div className="resume-dot" />
                          <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ color: "white", fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {activeResume.fileName}
                            </div>
                            <div style={{ color: "#10B981", fontSize: 11, marginTop: 2, fontWeight: 500 }}>
                              Context-aware interviews enabled
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "24px 16px" }}>
                          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                            <FileText size={20} color="#334155" />
                          </div>
                          <p style={{ color: "#475569", fontSize: 13, margin: "0 0 4px", fontWeight: 500 }}>No resume uploaded</p>
                          <p style={{ color: "#1e293b", fontSize: 12, margin: 0 }}>Upload one to unlock resume-aware questions</p>
                          <button className="manage-link" style={{ margin: "14px auto 0", display: "flex" }} onClick={() => setActiveTab("resume")}>
                            Upload Resume <ArrowRight size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick links */}
                    <div className="card">
                      <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "white", margin: "0 0 18px" }}>Quick Actions</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[
                          { label: "View Past Interviews", icon: <History size={14} />, href: "/history", color: "#8B5CF6" },
                          { label: "Edit Profile", icon: <User size={14} />, action: () => setActiveTab("profile"), color: "#3B82F6" },
                          { label: "Update Resume", icon: <FileText size={14} />, action: () => setActiveTab("resume"), color: "#10B981" },
                        ].map((q) => (
                          q.href ? (
                            <Link key={q.label} href={q.href}
                              style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "#64748b", fontSize: 13, fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.color = "#64748b"; }}
                            >
                              <span style={{ color: q.color }}>{q.icon}</span> {q.label}
                              <ChevronRight size={13} style={{ marginLeft: "auto" }} />
                            </Link>
                          ) : (
                            <button key={q.label} onClick={q.action}
                              style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "#64748b", fontSize: 13, fontWeight: 500, textAlign: "left", cursor: "pointer", transition: "all 0.2s", width: "100%", fontFamily: "'DM Sans',sans-serif" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.color = "#64748b"; }}
                            >
                              <span style={{ color: q.color }}>{q.icon}</span> {q.label}
                              <ChevronRight size={13} style={{ marginLeft: "auto" }} />
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── PROFILE TAB ── */}
              {activeTab === "profile" && (
                <motion.div key="profile" variants={tabVariants} initial="hidden" animate="show" exit="exit">
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,0.14)", border: "1px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Settings size={20} color="#60A5FA" />
                    </div>
                    <div>
                      <h1 className="page-title" style={{ fontSize: 28, margin: 0 }}>Edit Profile</h1>
                      <p className="page-sub" style={{ margin: 0 }}>Update your display name or password.</p>
                    </div>
                  </div>

                  <div style={{ maxWidth: 520 }}>
                    {/* Current user preview */}
                    <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                      <Avatar name={session?.user?.name} image={session?.user?.image} size={52} />
                      <div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: "white" }}>{session?.user?.name}</div>
                        <div style={{ fontSize: 13, color: "#334155", marginTop: 2 }}>{session?.user?.email}</div>
                      </div>
                    </div>

                    <div className="card">
                      <form onSubmit={handleUpdateProfile}>
                        <div style={{ marginBottom: 18 }}>
                          <label className={`form-label ${focused === "name" ? "active" : ""}`}>Display Name</label>
                          <input
                            type="text" value={name} placeholder="Your name"
                            className="form-input"
                            onFocus={() => setFocused("name")}
                            onBlur={() => setFocused(null)}
                            onChange={e => setName(e.target.value)}
                          />
                        </div>
                        <div style={{ marginBottom: 24 }}>
                          <label className={`form-label ${focused === "password" ? "active" : ""}`}>
                            New Password <span style={{ color: "#1e293b", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                          </label>
                          <input
                            type="password" value={password} placeholder="Leave blank to keep current"
                            className="form-input"
                            onFocus={() => setFocused("password")}
                            onBlur={() => setFocused(null)}
                            onChange={e => setPassword(e.target.value)}
                          />
                        </div>
                        <button type="submit" className="save-btn" disabled={saving}>
                          <span>
                            {saving ? <><span className="spinner" />Saving…</> : "Save Changes"}
                          </span>
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── RESUME TAB ── */}
              {activeTab === "resume" && (
                <motion.div key="resume" variants={tabVariants} initial="hidden" animate="show" exit="exit">
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={20} color="#A78BFA" />
                    </div>
                    <div>
                      <h1 className="page-title" style={{ fontSize: 28, margin: 0 }}>Resume Manager</h1>
                      <p className="page-sub" style={{ margin: 0 }}>Upload and manage your interview resume.</p>
                    </div>
                  </div>
                  <ResumeManager initialResume={activeResume ? { id: activeResume.id, fileName: activeResume.fileName } : null} />
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
