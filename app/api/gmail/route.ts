import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { authOptions } from "../auth/authOptions";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { dbManager } from "../../../lib/database";

interface SessionWithToken {
  accessToken?: string;
}

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
    const session = await getServerSession(authOptions) as SessionWithToken;
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const emailId = searchParams.get('id');

    // If specific email ID is requested, return that email
    if (emailId) {
      const gmail = google.gmail({ version: 'v1', headers: { Authorization: `Bearer ${session.accessToken}` } });
      
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: emailId,
        format: 'full'
      });

      const message = response.data;
      const headers = message.payload?.headers;
      const subject = headers?.find(h => h.name === 'Subject')?.value || '';
      const from = headers?.find(h => h.name === 'From')?.value || '';
      const date = headers?.find(h => h.name === 'Date')?.value || '';

      let textBody = '';
      let htmlBody = '';

      const findPart = (parts: any[], mimeType: string): any | undefined => {
        for (const part of parts) {
          if (part.mimeType === mimeType) {
            return part;
          }
          if (part.parts) {
            const found = findPart(part.parts, mimeType);
            if (found) return found;
          }
        }
        return undefined;
      };

      if (message.payload?.parts) {
        const textPart = findPart(message.payload.parts, 'text/plain');
        const htmlPart = findPart(message.payload.parts, 'text/html');
        if (textPart && textPart.body?.data) {
          textBody = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
        if (htmlPart && htmlPart.body?.data) {
          htmlBody = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
        }
      } else if (message.payload?.body?.data) {
        const decodedBody = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
        if (message.payload.mimeType === 'text/html') {
          htmlBody = decodedBody;
        } else {
          textBody = decodedBody;
        }
      }

      if (htmlBody && !textBody) {
        textBody = htmlBody.replace(/<[^>]*>/g, '');
      }
      
      const cachedEmail = await dbManager.getEmailWithAIResults(emailId);
      const sentiment = cachedEmail?.aiResults?.sentiment || 'neutral';
      const aiResults = cachedEmail?.aiResults;

      return NextResponse.json({
        id: message.id,
        subject,
        from,
        date,
        textBody,
        htmlBody,
        sentiment,
        aiResults
      });
    }

    // Fetch list of emails
    const systemState = await dbManager.getSystemState();
    const lastFetchTime = new Date(systemState.lastFetchTime || 0);
    
    const gmail = google.gmail({ version: 'v1', headers: { Authorization: `Bearer ${session.accessToken}` } });
    
    let query = '';
    if (lastFetchTime.getTime() > 0) {
      const afterDate = lastFetchTime.toISOString().split('T')[0];
      query = `after:${afterDate}`;
    }

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50,
      q: query
    });

    const messages = response.data.messages || [];
    const newEmails = [];

    const existingEmails = await dbManager.getAllEmailsWithAIResults();
    const existingEmailIds = new Set(existingEmails.map(e => e.id));

    // Only process emails that don't already exist in our database
    for (const message of messages) {
      if (!message.id || existingEmailIds.has(message.id)) {
        continue;
      }

      try {
        const emailResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date']
        });

        const emailData = emailResponse.data;
        const headers = emailData.payload?.headers;
        const subject = headers?.find(h => h.name === 'Subject')?.value || '(No Subject)';
        const from = headers?.find(h => h.name === 'From')?.value || 'Unknown';
        const date = headers?.find(h => h.name === 'Date')?.value || new Date().toISOString();
        
        const emailSnapshot = { 
          id: message.id, 
          subject, 
          from, 
          date, 
          isInternship: false, 
          processed: false, 
          lastUpdated: new Date().toISOString() 
        };
        await dbManager.saveEmailSnapshot(emailSnapshot);

        newEmails.push(emailSnapshot);
      } catch (error) {
        console.error(`Error processing email ${message.id}:`, error);
      }
    }

    await dbManager.updateLastFetchTime();

    // Return all emails from database, sorted by date (newest first)
    const allEmails = await dbManager.getAllEmailsWithAIResults();
    allEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ 
      emails: allEmails, 
      newEmailsCount: newEmails.length, 
      totalEmailsCount: allEmails.length 
    });

  } catch (error: any) {
    console.error('Gmail API error:', error);
    
    if (error.code === 401) {
      return NextResponse.json(
        { error: "Authentication failed. Please sign in again." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch emails. Please try again." },
      { status: 500 }
    );
  }
}
