import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPanelContent from "./AdminPanelContent";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.email !== "admin@admin.com") {
    redirect("/admin/login");
  }

  // Fetch all core data for the dashboard
  const users = await prisma.user.findMany({
    orderBy: { email: 'asc' },
    include: {
      _count: { select: { resumes: true, sessions: true } }
    }
  });

  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { qaPairs: true } }
    }
  });

  const resumes = await prisma.resume.findMany({
    orderBy: { uploadedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  return (
    <AdminPanelContent 
      initialUsers={users} 
      initialSessions={sessions} 
      initialResumes={resumes} 
    />
  );
}
