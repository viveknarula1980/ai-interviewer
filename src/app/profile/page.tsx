import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import DashboardContent from "./DashboardContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Dashboard | AI Interviewer",
  description: "Track your progress, manage resumes, and start AI-powered interview sessions.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  // Fetch full user data including id for the resume query
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Get the most recent resume to show on the dashboard
  const activeResume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#05060f]">
      <DashboardContent 
        session={session} 
        activeResume={activeResume} 
      />
    </div>
  );
}
