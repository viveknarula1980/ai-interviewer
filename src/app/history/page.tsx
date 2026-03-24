import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { History, Calendar, Award, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  // Fetch all past completed sessions from PostgreSQL
  const pastSessions = await prisma.session.findMany({
    where: { user: { email: session.user.email }, completedAt: { not: null } },
    orderBy: { completedAt: 'desc' }
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-white p-8 sm:px-24">
      <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-6">
         <History size={32} className="text-blue-500" />
         <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Session History</h1>
      </div>

      {pastSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-2xl">
           <History size={48} className="text-gray-500 mb-4" />
           <p className="text-xl text-gray-400 font-medium">No past interview sessions found.</p>
           <Link href="/interview/setup" className="mt-6 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 font-bold transition">
              Start Your First Interview
           </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {pastSessions.map((hist) => (
             <Link href={`/report/${hist.id}`} key={hist.id} className="group bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between transition">
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-3">
                     <span className="font-bold text-lg text-white capitalize">{hist.subject}</span>
                     <span className={`text-xs font-bold px-3 py-1 rounded-full ${hist.difficulty === 'Advanced' ? 'bg-red-500/20 text-red-400' : hist.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'}`}>
                        {hist.difficulty}
                     </span>
                     <span className="text-xs font-bold px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full capitalize w-max">{hist.mode} Mode</span>
                   </div>
                   <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                     <span className="flex items-center gap-1"><Calendar size={16} /> {hist.completedAt?.toLocaleDateString()}</span>
                   </div>
                </div>

                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                   <div className="flex items-center gap-2">
                     <Award size={24} className="text-yellow-500" />
                     <span className="font-extrabold text-2xl">{hist.overallScore}/10</span>
                   </div>
                   <ChevronRight size={24} className="text-gray-500 group-hover:text-blue-500 transition transform group-hover:translate-x-1" />
                </div>
             </Link>
          ))}
        </div>
      )}
    </div>
  );
}
