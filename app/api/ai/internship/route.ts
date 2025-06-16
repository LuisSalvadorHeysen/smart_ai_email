import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface InternshipData {
  isInternshipEmail: boolean;
  company?: string;
  position?: string;
  status?: 'Received' | 'Interviewing' | 'Rejected' | 'Offer';
  date?: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Classification prompt
    const classifyPrompt = `Is this email related to an internship application? Respond only with "yes" or "no".\n\nEmail: ${text}`;
    const classificationResult = await model.generateContent(classifyPrompt);
    const isInternshipEmail = classificationResult.response.text().toLowerCase().trim() === 'yes';

    if (!isInternshipEmail) {
      return NextResponse.json({ isInternshipEmail: false });
    }

    // Extraction prompt
    const extractPrompt = `Extract internship application details:\n
    1. Company name\n2. Position title\n3. Status (Received/Interviewing/Rejected/Offer)\n4. Status date (YYYY-MM-DD)\n5. Key details\n
    Return JSON format: {
      "company": "Company Name",
      "position": "Position Title",
      "status": "Status",
      "date": "YYYY-MM-DD",
      "notes": "Key details"
    }\n\nEmail: ${text}`;

    const extractionResult = await model.generateContent(extractPrompt);
    const responseText = extractionResult.response.text();
    const jsonMatch = responseText.match(/{(.|[\r\n])*?}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return NextResponse.json({
      isInternshipEmail: true,
      ...data
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process internship update" },
      { status: 500 }
    );
  }
}
