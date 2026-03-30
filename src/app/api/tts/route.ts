import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const apiKey = process.env.GOOGLE_TTS_KEY;
    if (!apiKey) {
      // No TTS key configured — client will fall back to speechSynthesis
      return NextResponse.json({ audioContent: null, fallback: true });
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "en-GB",
            name: "en-GB-Neural2-D",
            ssmlGender: "MALE",
          },
          audioConfig: { audioEncoding: "MP3", speakingRate: 0.95, pitch: -1 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("TTS API error:", errText);
      return NextResponse.json({ audioContent: null, fallback: true });
    }

    const data = await response.json();
    return NextResponse.json({ audioContent: data.audioContent ?? null });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ audioContent: null, fallback: true });
  }
}
