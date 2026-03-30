import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

interface QAPairInput {
  question: string;
  transcript: string;
  orderIndex: number;
}

export async function POST(req: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { qaPairs, subject, difficulty, mode } = await req.json() as {
      qaPairs: QAPairInput[];
      subject: string;
      difficulty: string;
      mode: string;
    };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });

    // --- Score each Q&A pair ---
    const scoredPairs = await Promise.all(
      qaPairs.map(async (pair) => {
        const prompt = `You are an expert interview assessor. Score and review this interview answer.

Subject: ${subject}
Difficulty: ${difficulty}
Question: ${pair.question}
Candidate's Answer: ${pair.transcript || "(No answer provided — candidate was silent)"}

Respond with ONLY valid JSON (no markdown, no code blocks) in exactly this format:
{
  "aiFeedback": "2-3 sentences of specific, constructive feedback on what was strong and what was missing",
  "modelAnswer": "A concise ideal answer of 3-5 sentences that the candidate should have given",
  "scoreClarity": 7,
  "scoreDepth": 6,
  "scoreRelevance": 8,
  "scoreStructure": 7
}

All scores are integers 1-10. Be honest and calibrated — not every answer deserves 8+.`;

        try {
          const result = await model.generateContent(prompt);
          let text = "";
          try {
            text = result.response.text();
          } catch (e) {
            console.error("Gemini blocked individual pair scoring:", result.response.promptFeedback);
            throw new Error("Blocked");
          }
          
          const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          return { ...pair, ...JSON.parse(cleaned) };
        } catch (e) {
          console.error("Per-answer scoring failed:", e);
          return {
            ...pair,
            aiFeedback: "Unable to generate detailed feedback for this response due to processing issues.",
            modelAnswer: "A strong answer would provide concrete technical details and clear structure.",
            scoreClarity: 5,
            scoreDepth: 5,
            scoreRelevance: 5,
            scoreStructure: 5,
          };
        }
      })
    );

    // --- Generate overall report ---
    const summaryContext = scoredPairs
      .map((p) => `Q${p.orderIndex}: "${p.question}"\nAnswer: "${p.transcript}"\nScores: Clarity ${p.scoreClarity}/10, Depth ${p.scoreDepth}/10, Relevance ${p.scoreRelevance}/10, Structure ${p.scoreStructure}/10`)
      .join("\n\n");

    const overallPrompt = `You are an expert interview assessor. Based on a ${difficulty} ${subject} interview with ${qaPairs.length} questions, provide an overall session assessment.

${summaryContext}

Respond with ONLY valid JSON (no markdown, no code blocks) in exactly this format:
{
  "overallScore": 7,
  "summary": "A 3-4 sentence narrative overall assessment of the candidate's performance in this interview session.",
  "topStrengths": ["First strength", "Second strength", "Third strength"],
  "topImprovements": ["First area to improve", "Second area to improve", "Third area to improve"]
}

overallScore is an integer 1-10, calculated as a weighted average of all scores with a holistic adjustment.`;

    let overallData = {
      overallScore: 6,
      summary: "The candidate demonstrated a reasonable understanding of the subject matter.",
      topStrengths: ["Clear communication", "Willingness to engage", "Basic understanding"],
      topImprovements: ["Provide more specific examples", "Deepen technical explanations", "Use more structured responses"],
    };

    try {
      const overallResult = await model.generateContent(overallPrompt);
      let overallText = "";
      try {
        overallText = overallResult.response.text();
      } catch (e) {
         console.error("Overall assessment was blocked:", overallResult.response.promptFeedback);
         throw new Error("Blocked");
      }

      const cleanedOverall = overallText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      overallData = JSON.parse(cleanedOverall);
    } catch (e) {
      console.error("Overall scoring failed, using defaults:", e);
    }

    // --- Save to database ---
    const dbSession = await prisma.session.create({
      data: {
        userId: user.id,
        mode,
        subject,
        difficulty,
        overallScore: overallData.overallScore,
        summary: overallData.summary,
        topStrengths: JSON.stringify(overallData.topStrengths),
        topImprovements: JSON.stringify(overallData.topImprovements),
        completedAt: new Date(),
        qaPairs: {
          create: scoredPairs.map((p) => ({
            question: p.question,
            userTranscript: p.transcript || "(No answer provided)",
            aiFeedback: p.aiFeedback,
            modelAnswer: p.modelAnswer,
            scoreClarity: p.scoreClarity,
            scoreDepth: p.scoreDepth,
            scoreRelevance: p.scoreRelevance,
            scoreStructure: p.scoreStructure,
            orderIndex: p.orderIndex,
          })),
        },
      },
    });

    return NextResponse.json({ sessionId: dbSession.id, overallScore: overallData.overallScore });
  } catch (error) {
    console.error("Session complete error:", error);
    return NextResponse.json({ error: "Failed to save session." }, { status: 500 });
  }
}
