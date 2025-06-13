import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Fetch the latest 10 emails
  const messagesRes = await gmail.users.messages.list({
    userId: "me",
    maxResults: 100,
    labelIds: ["INBOX"],
  });

  const messages = messagesRes.data.messages || [];

  // Fetch details for each message
  const emailPromises = messages.map(async (msg) => {
    const msgRes = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "metadata",
      metadataHeaders: ["Subject", "From", "Date"],
    });
    const headers = msgRes.data.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name === name)?.value || "";
    return {
      id: msg.id,
      subject: getHeader("Subject"),
      from: getHeader("From"),
      date: getHeader("Date"),
    };
  });

  const emails = await Promise.all(emailPromises);

  return NextResponse.json(emails);
}

