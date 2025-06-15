import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { text, tone } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Rewrite this email draft to be more ${tone}:\n\n${text}`;
    
    const result = await model.generateContent(prompt);
    const rewritten = result.response.text();

    return NextResponse.json({ rewritten });
  } catch (error) {
    console.error("[TONE_ERROR]", error);
    return NextResponse.json({ error: "Failed to rewrite text" }, { status: 500 });
  }
}

