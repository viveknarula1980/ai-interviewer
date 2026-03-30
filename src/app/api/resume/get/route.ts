import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { resumes: { orderBy: { uploadedAt: 'desc' }, take: 1 } }
    });

    if (!user || user.resumes.length === 0) {
      return NextResponse.json({ resumeText: "" });
    }

    return NextResponse.json({ resumeText: user.resumes[0].parsedText });
  } catch (error) {
    console.error("Fetch resume error:", error);
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
  }
}
