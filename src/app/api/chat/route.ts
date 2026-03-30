import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    console.log("DEBUG: Using key starting with:", process.env.GEMINI_API_KEY?.substring(0, 5));
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const {
      transcript,
      pastInteractions,
      subject,
      difficulty,
      mode,
      resumeText,
      questionNumber,
      totalQuestions,
    } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });

    const isFirstQuestion = !transcript && questionNumber === 1;
    const isResumeBased = mode === "resume" && resumeText;

    let prompt: string;

    if (isFirstQuestion) {
      if (isResumeBased) {
        prompt = `You are an AI Interviewer. The candidate has uploaded the following resume:
---
${resumeText}
---
Review the candidate's background and generate ONE professional, engaging opening interview question based on their actual experience. 
The question should be at ${difficulty} difficulty level.
Stay focused on the candidate's expertise and the context of the interview. Do NOT use placeholder terms like "the position" if the specific role isn't clear from the resume; instead, refer to their field of work.
Speak as if you are on a real phone interview. Be natural and conversational. Do NOT use bullet points or markdown.`;
      } else {
        prompt = `You are an AI Interviewer. Generate ONE professional opening interview question related to ${subject} at ${difficulty} difficulty level.
Speak naturally as if on a phone interview. Do NOT use bullet points or markdown. Keep it under 3 sentences total.
Ensure the question is relevant to ${subject} and doesn't just ask about a generic "position".`;
      }
    } else {
      const contextNote = isResumeBased && resumeText ? `\n\nCandidate's Resume Context:\n${resumeText.slice(0, 3000)}` : "";
      const historyContext = pastInteractions?.map((m: any) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.text}`).join("\n") || "";
      const questionContext = questionNumber <= totalQuestions ? `This is question ${questionNumber} of ${totalQuestions}.` : `This was the final question (${totalQuestions} of ${totalQuestions}).`;
      prompt = `You are an AI interviewer conducting a ${difficulty} level ${subject} interview.${contextNote}\n\nConversation so far:\n${historyContext}\n\nCandidate's latest answer: "${transcript}"\n\n${questionContext}\n${questionNumber > totalQuestions ? `The interview is now complete. Give a professional, warm closing statement. Thank the candidate. Tell them their feedback report is now being generated. Keep it to 2-3 sentences. No bullet points.` : `Evaluate the candidate's answer. If it was strong and complete, acknowledge it briefly (1 sentence) then ask the next technical or situational question relevant to ${subject}. If it was shallow or missed the point, probe with a focused follow-up question. \nAlways stay in character as the interviewer. Keep your total response under 4 sentences. No bullet points or markdown.`}`;
    }

    const result = await model.generateContent(prompt);
    
    let aiResponseText: string;
    try {
      aiResponseText = result.response.text();
    } catch (e) {
      console.error("Gemini response was blocked or malformed:", result.response.promptFeedback);
      aiResponseText = "I see. Let's move on to the next topic. Could you tell me more about your approach to problem-solving?";
    }

    return NextResponse.json({ reply: aiResponseText });
  } catch (error: any) {
    console.error("Gemini Interview Engine Error:", error.message);
    return NextResponse.json({ reply: "I seem to be having a momentary issue. Let me reset my connection. Could you please repeat that?" }, { status: 200 });
  }
}
