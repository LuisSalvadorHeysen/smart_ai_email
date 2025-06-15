import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { subject, body } = await req.json();
    
    // Improved prompt with example response format
    const prompt = `
Generate 3 email reply suggestions for this message. Follow these rules:
1. Use markdown bullet points
2. Start each bullet with "-"
3. Keep replies under 15 words
4. Focus on clarity and professionalism
5. Make sure the responsed do not seem generic and actually relate to the email.

Example response:
- Thank you for your email. I'll review the document and respond by Friday.
- Could you clarify the deadline for this request?
- Please find the attached report as requested.

Email to reply to:
Subject: ${subject}
Body: ${body}
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Raw Gemini response:", text); // Debugging

    // Improved parsing
    const suggestions = text
      .split('\n')
      .filter(line => line.trim().match(/^[-*•]/)) // Allow different bullet chars
      .map(line => line.replace(/^[-*•]\s*/, '').trim());

    console.log("Parsed suggestions:", suggestions);
    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error("[SUGGEST-ERROR]", error);
    return NextResponse.json(
      { suggestions: [] }, // Return empty array instead of error for frontend safety
      { status: 500 }
    );
  }
}

