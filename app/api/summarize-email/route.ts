import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { body } = await req.json();
    if (!body || typeof body !== "string" || !body.trim()) {
      return NextResponse.json({ error: "No email body provided." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API key." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Limit input length to avoid Gemini quota/time errors
    const safeBody = body.length > 4000 ? body.slice(0, 4000) : body;

    const prompt = `Provide a short summary of the following email. Focus on the content and interpret it as raw text, even though it might be html:\n\n${safeBody}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ summary: summary.replace(/^TL;DR:?\s*/i, "").trim() });
  } catch (error) {
    console.error("[SUMMARIZE_EMAIL_ERROR]", error);
    return NextResponse.json({ error: "Failed to summarize email." }, { status: 500 });
  }
}

