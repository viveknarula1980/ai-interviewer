import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import SetupForm from "@/components/SetupForm";

export default async function InterviewSetup() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { resumes: true }
  });

  const hasResume = user && user.resumes.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-background text-white p-8 sm:p-16 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Interview Setup
      </h1>
      
      <SetupForm hasResume={!!hasResume} />
    </div>
  );
}
