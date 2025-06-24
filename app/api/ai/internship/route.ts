import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Email body is required" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `
            Analyze the following email content to determine if it is an internship application, offer, or rejection.
            If it is, extract the company name and position.
            Respond in JSON format.
            
            If it is an internship-related email, the JSON should be:
            { "isInternship": true, "details": { "company": "...", "position": "..." } }

            If it is not an internship-related email, the JSON should be:
            { "isInternship": false }

            Email content:
            """
            ${text}
            """
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean the response to ensure it's valid JSON
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResponse = JSON.parse(cleanedJson);

        return NextResponse.json(parsedResponse);

    } catch (error) {
        console.error("[AI_INTERNSHIP_ERROR]", error);
        return NextResponse.json(
            { error: "Internal server error while processing internship check." },
            { status: 500 }
        );
    }
}

