import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { authOptions } from "../auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";

function findMimePart(parts: any[], mimeType: string): string {
  for (const part of parts) {
    if (part.mimeType === mimeType && part.body?.data) {
      return Buffer.from(part.body.data, "base64").toString("utf-8");
    }
    if (part.parts) {
      const found = findMimePart(part.parts, mimeType);
      if (found) return found;
    }
  }
  return "";
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const { searchParams } = new URL(req.url);
    const emailId = searchParams.get("id");

    if (emailId) {
      const msgRes = await gmail.users.messages.get({
        userId: "me",
        id: emailId,
        format: "full",
      });

      const payload = msgRes.data.payload;
      let htmlBody = findMimePart(payload?.parts || [], "text/html");
      let textBody = findMimePart(payload?.parts || [], "text/plain");

      // Fallback for simple emails
      if (!htmlBody && !textBody && payload?.body?.data) {
        textBody = Buffer.from(payload.body.data, "base64").toString("utf-8");
      }

      // Analyze sentiment
      let sentiment = "neutral";
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `Classify this email's sentiment as positive, neutral, urgent, or negative:\n\n${textBody || htmlBody}`;
        const result = await model.generateContent(prompt);
        const sentimentText = result.response.text().toLowerCase();
        sentiment = ["positive", "neutral", "urgent", "negative"]
          .find(s => sentimentText.includes(s)) || "neutral";
      } catch (e) {
        console.error("Sentiment analysis failed:", e);
      }

      return NextResponse.json({
        id: msgRes.data.id,
        subject: payload.headers?.find((h) => h.name === "Subject")?.value || "",
        from: payload.headers?.find((h) => h.name === "From")?.value || "",
        date: payload.headers?.find((h) => h.name === "Date")?.value || "",
        htmlBody,
        textBody,
        sentiment
      });
    }

    // Existing list endpoint
    const { data } = await gmail.users.messages.list({
      userId: "me",
      maxResults: 100,
      labelIds: ["INBOX"],
    });

    const messages = data.messages || [];
    const emails = await Promise.all(messages.map(async (msg) => {
      const res = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });
      
      const headers = res.data.payload?.headers || [];
      return {
        id: msg.id,
        subject: headers.find((h) => h.name === "Subject")?.value || "",
        from: headers.find((h) => h.name === "From")?.value || "",
        date: headers.find((h) => h.name === "Date")?.value || "",
      };
    }));

    return NextResponse.json(emails);

  } catch (error) {
    console.error("[GMAIL_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
