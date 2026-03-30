"use client";

import { useState } from "react";
import { 
  Users, Database, LayoutDashboard, BarChart3, 
  ArrowLeft, Shield, FileText, Search, Activity, 
  Calendar, CheckCircle, TrendingUp, Filter, Power,
  ChevronRight, ExternalLink, Trash2, Edit3
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const format = (date: Date, fmt: string) => {
  if (fmt.includes("MMM d, h:mm a")) {
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (fmt.includes("MMM d, yyyy")) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (fmt.includes("MMM d")) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString();
};

export default function AdminPanelContent({ initialUsers, initialSessions, initialResumes }: any) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = initialUsers.filter((u: any) => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSessionsCount = initialSessions.length;
  const avgScore = initialSessions.length > 0 
    ? Math.round(initialSessions.reduce((acc: number, sBy: any) => acc + (sBy.overallScore || 0), 0) / initialSessions.length)
    : 0;

  const sidebarItems = [
    { id: "overview", label: "System Overview", icon: LayoutDashboard },
    { id: "users", label: "User Database", icon: Users },
    { id: "sessions", label: "Session History", icon: Activity },
    { id: "resumes", label: "Document Vault", icon: FileText },
  ];

  return (
    <div className="flex min-h-screen bg-[#05060f] text-slate-300 font-sans selection:bg-blue-500/30">
        <style dangerouslySetInnerHTML={{ __html: `
            .glass-card {
                background: rgba(255, 255, 255, 0.03);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.08);
            }
            .glass-card-hover:hover {
                background: rgba(255, 255, 255, 0.05);
                border-color: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
            }
            .admin-table th {
                color: rgba(255, 255, 255, 0.4);
                font-weight: 700;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                padding: 1.25rem 2rem;
            }
            .admin-table td {
                padding: 1.25rem 2rem;
                vertical-align: middle;
            }
            .nav-glow { 
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            .shimmer-effect::after {
              content: "";
              position: absolute;
              inset: 0;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
              animation: shimmer 2s infinite;
            }
        `}} />

      {/* Futuristic Sidebar */}
      <aside className="w-72 bg-[#0a0b14] border-r border-white/5 flex flex-col fixed h-full z-20 overflow-hidden">
        {/* Animated Background Element */}
        <div className="absolute top-[-10%] right-[-30%] w-60 h-60 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="p-8 pb-10 flex items-center gap-4 relative">
           <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg nav-glow">
              <Shield size={26} className="text-white" />
           </div>
           <div>
             <h2 className="text-xl font-bold text-white tracking-tight">Admin<span className="text-blue-500">Node</span></h2>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">System Online</span>
             </div>
           </div>
        </div>
        
        <nav className="flex flex-col flex-1 px-4 gap-2 relative z-10">
          {sidebarItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)} 
              className={`flex items-center justify-between group px-5 py-4 rounded-2xl transition-all font-semibold ${activeTab === item.id ? "bg-white/5 text-white border border-white/10" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"}`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={activeTab === item.id ? "text-blue-500" : "text-slate-600 group-hover:text-slate-400"} /> 
                {item.label}
              </div>
              {activeTab === item.id && <motion.div layoutId="nav-pill" className="w-1 h-5 bg-blue-500 rounded-full" />}
            </button>
          ))}
          
          <div className="mt-10 mb-4 px-5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">User Access</div>
          
          <Link href="/profile" className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all text-slate-500 hover:text-white group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to App
          </Link>
        </nav>

        <div className="p-6 mt-auto">
          <Link href="/auth/signout" className="flex items-center justify-center gap-3 w-full py-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all group font-bold border border-red-500/20">
            <Power size={18} /> Sign Out Session
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <main className="flex-1 ml-72 min-h-screen p-8 lg:p-14 relative">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-[20%] w-[40vw] h-[40vh] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

        <header className="flex flex-col md:flex-row justify-between items-end md:items-center gap-8 mb-16 relative z-10">
           <div>
             <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 capitalize">{activeTab.replace("-", " ")}</h1>
             <p className="text-slate-500 font-medium">Platform Infrastructure • <span className="text-slate-400 font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span></p>
           </div>
           
           <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-96 group">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Query records by ID, name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-8 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium text-white placeholder:text-slate-600"
                />
             </div>
             <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Filter size={20} />
             </button>
           </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-12">
                 {/* Premium Statistic Cards */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-card p-8 rounded-[2rem] flex flex-col items-start relative overflow-hidden group">
                       <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-blue-500/10 blur-[30px] rounded-full" />
                       <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                          <Users size={28} />
                       </div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Users</p>
                       <p className="text-4xl font-black text-white">{initialUsers.length}</p>
                    </div>
                    
                    <div className="glass-card p-8 rounded-[2rem] flex flex-col items-start relative overflow-hidden group">
                       <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-purple-500/10 blur-[30px] rounded-full" />
                       <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                          <TrendingUp size={28} />
                       </div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Global Avg</p>
                       <p className="text-4xl font-black text-white">{avgScore}%</p>
                    </div>
                    
                    <div className="glass-card p-8 rounded-[2rem] flex flex-col items-start relative overflow-hidden group">
                       <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-emerald-500/10 blur-[30px] rounded-full" />
                       <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                          <Activity size={28} />
                       </div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Sessions</p>
                       <p className="text-4xl font-black text-white">{initialSessions.length}</p>
                    </div>
                    
                    <div className="glass-card p-8 rounded-[2rem] flex flex-col items-start relative overflow-hidden group">
                       <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-orange-500/10 blur-[30px] rounded-full" />
                       <div className="w-14 h-14 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center mb-6 border border-orange-500/20">
                          <Database size={28} />
                       </div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Documents</p>
                       <p className="text-4xl font-black text-white">{initialResumes.length}</p>
                    </div>
                 </div>

                 <div className="grid lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-10">
                       <div className="flex items-center justify-between mb-8">
                          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                             <Calendar className="text-blue-500" size={24} /> Infrastructure Feed
                          </h2>
                          <button onClick={() => setActiveTab('sessions')} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
                             Full Archive <ChevronRight size={14} />
                          </button>
                       </div>
                       <div className="space-y-4">
                          {initialSessions.slice(0, 5).map((session: any) => (
                            <div key={session.id} className="flex items-center justify-between p-5 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 transition-all group">
                               <div className="flex items-center gap-5">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xl nav-glow">
                                     {session.user?.name?.charAt(0) || "U"}
                                  </div>
                                  <div>
                                     <p className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{session.user?.name || "Anonymous"}</p>
                                     <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">{session.mode} • <span className="text-slate-400 font-bold">{session.subject}</span></p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className="font-black text-blue-500 text-lg leading-none mb-1">{session.overallScore}%</p>
                                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{format(new Date(session.createdAt), "MMM d, h:mm a")}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                    
                    {/* Distribution Analysis */}
                    <div className="bg-[#10121d] border border-white/10 rounded-[2.5rem] p-10 flex flex-col shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full" />
                       <h2 className="text-2xl font-bold text-white mb-10 flex items-center gap-3 relative z-10">
                          <BarChart3 className="text-blue-400" size={24} /> Traffic Trends
                       </h2>
                       <div className="space-y-10 flex-1 flex flex-col justify-center relative z-10">
                          {[
                            { label: "Full-Stack Dev", val: "75%", color: "bg-blue-500" },
                            { label: "Data Science", val: "42%", color: "bg-purple-500" },
                            { label: "Product Mgmt", val: "18%", color: "bg-emerald-500" },
                            { label: "AI Engineering", val: "54%", color: "bg-cyan-500" }
                          ].map(item => (
                            <div key={item.label} className="space-y-3">
                              <div className="flex justify-between text-xs font-bold uppercase text-slate-500 tracking-widest">
                                 <span>{item.label}</span>
                                 <span className="text-white">{item.val}</span>
                              </div>
                              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   whileInView={{ width: item.val }}
                                   transition={{ duration: 1, delay: 0.2 }}
                                   className={`h-full ${item.color} rounded-full`} 
                                 />
                              </div>
                           </div>
                          ))}
                       </div>
                       <button onClick={() => setActiveTab('sessions')} className="mt-12 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs hover:bg-white/10 transition-all text-center relative z-10 tracking-widest uppercase">
                          Advanced Analytics
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left admin-table">
                       <thead>
                          <tr className="border-b border-white/5 bg-white/[0.01]">
                             <th>Talent Snapshot</th>
                             <th>System Hash</th>
                             <th className="text-center">Activity</th>
                             <th className="text-center">Docs</th>
                             <th>Control</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {filteredUsers.map((user: any) => (
                            <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                               <td>
                                  <div className="flex items-center gap-5">
                                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center font-bold text-white shadow-xl border border-white/10 overflow-hidden">
                                       {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : user.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                       <p className="font-bold text-white text-base group-hover:text-blue-400 transition-colors uppercase tracking-tight">{user.name || "Anonymous Candidate"}</p>
                                       <p className="text-[11px] text-slate-500 font-bold mt-0.5">{user.email}</p>
                                    </div>
                                  </div>
                               </td>
                               <td>
                                  <code className="text-[10px] font-bold px-3 py-1.5 bg-white/5 rounded-lg text-slate-500 border border-white/5">ID_{user.id.slice(-8).toUpperCase()}</code>
                               </td>
                               <td className="text-center">
                                  <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 font-bold text-[11px] border border-blue-500/20">
                                     {user._count.sessions} SESS
                                  </span>
                               </td>
                               <td className="text-center">
                                  <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-[11px] border border-indigo-500/20">
                                     {user._count.resumes} FILES
                                  </span>
                               </td>
                               <td>
                                  <div className="flex items-center gap-3">
                                    <button className="p-2.5 bg-white/5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all border border-white/5">
                                       <Edit3 size={16} />
                                    </button>
                                    <button className="p-2.5 bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-white/5">
                                       <Trash2 size={16} />
                                    </button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}

            {activeTab === "sessions" && (
              <div className="glass-card rounded-[2.5rem] overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left admin-table">
                       <thead>
                          <tr className="border-b border-white/5 bg-white/[0.01]">
                             <th>Candidate</th>
                             <th>Focus & Protocol</th>
                             <th>Score Analysis</th>
                             <th>Timestamp</th>
                             <th>Inspect</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {initialSessions.map((session: any) => (
                            <tr key={session.id} className="hover:bg-white/[0.03] transition-colors group">
                               <td className="font-bold text-white tracking-tight">
                                  {session.user?.name || "Guest Environment"}
                               </td>
                               <td>
                                  <div className="flex flex-col">
                                     <span className="font-bold text-white capitalize text-sm group-hover:text-blue-400 transition-colors">{session.subject} Expert</span>
                                     <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest mt-0.5">{session.mode} MODE</span>
                                  </div>
                               </td>
                               <td>
                                  <div className="flex items-center gap-4">
                                     <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]`} style={{ width: `${session.overallScore}%` }} />
                                     </div>
                                     <span className="font-black text-blue-400 text-sm tracking-tighter">{session.overallScore}%</span>
                                  </div>
                               </td>
                               <td className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">
                                  {format(new Date(session.createdAt), "MMM d, yyyy")}
                               </td>
                               <td>
                                  <button className="p-2.5 bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/5">
                                     <ExternalLink size={16} />
                                  </button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}

            {activeTab === "resumes" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {initialResumes.map((resume: any, idx: number) => (
                   <motion.div 
                    key={resume.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-10 rounded-[2.5rem] glass-card-hover transition-all relative overflow-hidden group border border-white/5"
                   >
                      <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full group-hover:bg-blue-500/20 transition-all" />
                      
                      <div className="w-16 h-16 bg-white/5 text-blue-400 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                         <FileText size={32} />
                      </div>
                      
                      <h3 className="font-black text-white text-xl mb-3 truncate w-full group-hover:text-blue-400 transition-colors" title={resume.fileName}>{resume.fileName}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">OWNER: <span className="text-slate-300">{resume.user?.name || "SYS_ROOT"}</span></p>
                      
                      <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-10">
                         <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">{format(new Date(resume.uploadedAt), "MMM d, yyyy")}</span>
                         <div className="flex gap-2">
                           <button className="p-2.5 bg-white/5 text-slate-500 rounded-xl hover:text-blue-400 hover:bg-blue-400/10 transition-all border border-white/5">
                              <Database size={16} />
                           </button>
                           <button className="p-2.5 bg-white/5 text-slate-500 rounded-xl hover:text-red-400 hover:bg-red-400/10 transition-all border border-white/5">
                              <Trash2 size={16} />
                           </button>
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
