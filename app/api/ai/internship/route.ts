import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Analyze this email for internship application updates. Extract:
    - Company name
    - Position title
    - Status (Received/Interviewing/Rejected/Offer)
    - Status date (YYYY-MM-DD format)
    - Next steps
    Return JSON format: { company: string, position: string, status: string, date: string, notes: string }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/{[^}]+}/);
    const applicationData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    return NextResponse.json(applicationData);
    
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process internship update" },
      { status: 500 }
    );
  }
}

