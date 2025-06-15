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
                if (!draft?.trim() || !text?.trim()) {
                    return NextResponse.json(
                        { error: "Missing draft or email content" }, 
                        { status: 400 }
                    );
                }
                //prompt = `I received this email: \n\n ${text}\n\nRewrite the following draft in ${tone} tone: \n\n${draft}`;
                //prompt = `Rewrite this email draft in ${tone} tone. Maintain the original context and format.\n\nOriginal Email:\n${text}\n\nDraft Reply:\n${draft}\n\nRewritten Version:`;
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
                prompt = `Extract clear action items from this email as markdown bullet points:\n\n${text}`;
                break;
            }
            case 'sentiment': {
                if (!text?.trim()) {
                    return NextResponse.json(
                        { error: "No email text provided" }, 
                        { status: 400 }
                    );
                }
                prompt = `Classify this email's sentiment as positive, neutral, urgent, or negative. Response must be one word:\n\n${text}`;
                break;
            }
            case 'replies': {
                if (!text?.trim()) {
                    return NextResponse.json(
                        { error: "No email text provided" }, 
                        { status: 400 }
                    );
                }
                prompt = `Generate 3 short email reply suggestions for this message. Rules:
                        1. Each should be concise and meaningful.
                            2. Markdown bullet points
                    3. Professional and context-aware
                4. No generic responses

                Email:
                    ${text}`;
                break;
            }
            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        let output = [];
        if (action === 'rewrite') {
            // For rewrite, take the full response (not just bullet points)
            output = [responseText.trim()];
        } else {
            output = responseText
            .split('\n')
            .filter(line => line.trim().match(/^[-*•]/))
            .map(line => line.replace(/^[-*•]\s*/, '').trim());
        }

return NextResponse.json({ output });

    } catch (error) {
        console.error(`[AI_ERROR] ${action}`, error);
        return NextResponse.json(
            { error: "Failed to process request. Please try again." },
            { status: 500 }
        );
    }
}
