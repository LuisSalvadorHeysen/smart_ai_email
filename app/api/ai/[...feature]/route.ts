import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest, { params }: { params: { feature: string[] } }) {
  const { feature } = params;
  const action = feature[0];
  const body = await req.json();
  const { text, draft, tone } = body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    let prompt = '';
    switch(action) {
      case 'rewrite': {
        if (!draft?.trim()) {
          return NextResponse.json(
            { error: "No draft provided" }, 
            { status: 400 }
          );
        }
        if (!tone) {
          return NextResponse.json(
            { error: "No tone provided" },
            { status: 400 }
          );
        }
        prompt = `I received the following email: ${text}. I wrote the following draft reply:\n\n${draft}.\nPlease rewrite it in ${tone} tone. Give me just one answer, and dont say anything else, just give me the reply`;
        break;
      }
      case 'actions': {
        if (!text?.trim()) {
          return NextResponse.json(
            { error: "No email text provided" }, 
            { status: 400 }
          );
        }
        prompt = `Extract clear action items from this email as bullet points:\n\n${text}`;
        break;
      }
      case 'sentiment': {
        if (!text?.trim()) {
          return NextResponse.json(
            { error: "No email text provided" }, 
            { status: 400 }
          );
        }
        prompt = `Classify this email's sentiment (positive/neutral/urgent/negative):\n\n${text}`;
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const output = responseText.split('\n').filter(line => line.trim().length > 0);

    return NextResponse.json({ output });

  } catch (error) {
    console.error(`[AI_ERROR] ${action}`, error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}


