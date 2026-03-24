import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Link from "next/link";
import { LogOut, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ResumeManager from "@/components/ResumeManager";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // Get user from DB safely
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  });

  const activeResume = user ? await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" }
  }) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background text-white p-8 sm:px-24">
      <nav className="flex justify-between items-center mb-16 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center font-bold text-2xl shadow-xl overflow-hidden border-2 border-white/10">
             {session.user.image ? (
               <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
             ) : (
               <span>{session.user.name?.charAt(0) || "U"}</span>
             )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{session.user.name}</h1>
            <p className="text-gray-400 font-medium">{session.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/api/auth/signout" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <LogOut size={20} /> Sign Out
          </Link>
        </div>
      </nav>

      <div className="grid md:grid-cols-2 gap-12">
        <ResumeManager initialResume={activeResume ? { id: activeResume.id, fileName: activeResume.fileName } : null} />

        {/* Start Interview Panel */}
        <section className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 p-8 rounded-2xl shadow-xl backdrop-blur-md flex flex-col justify-center items-center text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to practice?</h2>
          <p className="text-gray-300 mb-8">Set up your next AI interview session by selecting your subjects and difficulty level.</p>
          <Link href="/interview/setup" className="font-bold flex items-center gap-3 bg-blue-600 hover:bg-blue-500 py-4 px-8 rounded-xl shadow-lg transition shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            Configure Interview <ArrowRight size={20} />
          </Link>
          
          <div className="mt-8 pt-8 border-t border-white/10 w-full text-center">
            <Link href="/history" className="text-gray-400 hover:text-white transition font-medium">
              View Past Session Reports
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
