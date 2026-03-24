import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
// On Vercel, we avoid disk writes since it is a stateless/read-only environment.

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resumeFile") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 5MB limit." }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
      return NextResponse.json({ error: "Only PDF and DOCX files are accepted." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let parsedText = "";

    if (name.endsWith(".pdf")) {
      // Dynamic import to avoid SSR issues
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      parsedText = data.text;
    } else if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      parsedText = result.value;
    }

    if (!parsedText.trim()) {
      return NextResponse.json({ error: "Could not extract text from the file. Please try a different file." }, { status: 400 });
    }

    // On Vercel/Serverless, we don't save to disk.
    // We already have the parsedText in the DB, which is enough for the AI logic.

    // Get user record
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    // Replace existing resume
    await prisma.resume.deleteMany({ where: { userId: user.id } });
    await prisma.resume.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileUrl: "database-only",
        parsedText: parsedText.slice(0, 15000), // Cap at 15k chars for Gemini context
      },
    });

    return NextResponse.json({ success: true, fileName: file.name });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };
