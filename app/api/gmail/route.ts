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

    const { searchParams } = new URL(req.url);
    const emailId = searchParams.get("id");

    if (emailId) {
        const msgRes = await gmail.users.messages.get({
            userId: "me",
            id: emailId,
            format: "full",
        });

        const payload = msgRes.data.payload;

        // Recursively find the HTML or plain text part
        function findPart(parts: any[], mimeType: string): string | null {
            if (!parts) return null;
            for (const part of parts) {
                if (part.mimeType === mimeType && part.body?.data) {
                    return Buffer.from(part.body.data, "base64").toString("utf-8");
                }
                if (part.parts) {
                    const found = findPart(part.parts, mimeType);
                    if (found) return found;
                }
            }
            return null;
        }

        let body = findPart(payload.parts, "text/html");
        if (!body) {
            body = findPart(payload.parts, "text/plain");
        }

        // Fallback if no parts (top-level only)
        if (!body && payload.body?.data) {
            body = Buffer.from(payload.body.data, "base64").toString("utf-8");
        }

        return NextResponse.json({
            id: msgRes.data.id,
            subject: payload.headers?.find((h) => h.name === "Subject")?.value || "",
            from: payload.headers?.find((h) => h.name === "From")?.value || "",
            date: payload.headers?.find((h) => h.name === "Date")?.value || "",
            body,
        });
    }

    // Fetch the latest 100 emails (list view)
    const messagesRes = await gmail.users.messages.list({
        userId: "me",
        maxResults: 100,
        labelIds: ["INBOX"],
    });

    const messages = messagesRes.data.messages || [];

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
