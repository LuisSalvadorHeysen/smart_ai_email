import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "../auth/authOptions";

export async function GET(req: NextRequest) {
  try {
    // 1. Validate session and Gemini API key
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key missing in environment" },
        { status: 500 }
      );
    }

    // 2. Setup Gmail client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // 3. Calculate 24 hours ago as UNIX timestamp (seconds since epoch)
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const afterTimestamp = Math.floor(date.getTime() / 1000);

    // 4. Fetch emails from last 24 hours using UNIX timestamp
    const { data } = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      q: `after:${afterTimestamp}`,
      maxResults: 50,
    });

    const messages = data.messages || [];

    // 5. Extract subject and from for each email
    const emailSnippets = await Promise.all(
      messages.map(async (msg) => {
        const res = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["Subject", "From"],
        });
        const headers = res.data.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h) => h.name === name)?.value || "";
        return `From: ${getHeader("From")}\nSubject: ${getHeader("Subject")}`;
      })
    );

    // 6. If no emails, return a friendly summary
    if (emailSnippets.length === 0) {
      return NextResponse.json({
        summary: "* No emails received in the last 24 hours.",
      });
    }

    // 7. Generate AI summary with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use Flash for better free tier quotas
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

 //   const prompt = `Summarize these emails from the last 24 hours in bullet points.
//Focus on key topics, senders, and urgency. Format using markdown:\n\n${emailSnippets.join("\n\n")}`;

    const prompt = `
    You are an AI email assistant. Write a short, friendly introductory paragraph summarizing the overall state of my inbox in the last 24 hours, as if you're speaking directly to me. Then, add "See the details below:" and provide a summary of each relevant email. Format everything using markdown.

            Emails:
                ${emailSnippets.join("\n\n")}
        `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[SUMMARY_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
