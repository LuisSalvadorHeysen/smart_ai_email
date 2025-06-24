import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/authOptions";
import { dbManager } from "../../../lib/database";

interface SessionWithToken {
  accessToken?: string;
}

export async function POST(req: NextRequest) {
  console.log(`[EXTRACT_INTERNSHIP] Route called with method: ${req.method}`);
  try {
    const { emailId, emailContent, manualMode } = await req.json();
    console.log(`[EXTRACT_INTERNSHIP] Request data:`, { emailId, emailContent: emailContent?.substring(0, 100), manualMode });
    
    if (!process.env.GEMINI_API_KEY) {
      console.error(`[EXTRACT_INTERNSHIP] Missing GEMINI_API_KEY environment variable`);
      return NextResponse.json({ error: "Missing Gemini API key." }, { status: 500 });
    }
    
    console.log(`[EXTRACT_INTERNSHIP] GEMINI_API_KEY is available: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    let content = '';
    
    if (manualMode && emailContent) {
      content = emailContent;
    } else if (emailId) {
      // Get session and fetch email content directly from Gmail API
      const session = await getServerSession(authOptions) as SessionWithToken;
      if (!session?.accessToken) {
        console.error(`[EXTRACT_INTERNSHIP] No access token available`);
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      console.log(`[EXTRACT_INTERNSHIP] Fetching email ${emailId} directly from Gmail API`);
      
      const gmail = google.gmail({ version: 'v1', headers: { Authorization: `Bearer ${session.accessToken}` } });
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: emailId,
        format: 'full'
      });

      const message = response.data;
      let textBody = '';
      let htmlBody = '';

      if (message.payload?.parts) {
        for (const part of message.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            textBody = Buffer.from(part.body.data, 'base64').toString();
          } else if (part.mimeType === 'text/html' && part.body?.data) {
            htmlBody = Buffer.from(part.body.data, 'base64').toString();
          }
        }
      } else if (message.payload?.body?.data) {
        textBody = Buffer.from(message.payload.body.data, 'base64').toString();
      }

      content = textBody || htmlBody.replace(/<[^>]*>/g, '') || '';
      console.log(`[EXTRACT_INTERNSHIP] Retrieved content length: ${content.length}`);
    } else {
      return NextResponse.json({ error: "No email content or ID provided" }, { status: 400 });
    }

    if (!content.trim()) {
      return NextResponse.json({ error: "No content to analyze" }, { status: 400 });
    }

    console.log(`[EXTRACT_INTERNSHIP] Processing content with AI, length: ${content.length}`);

    const prompt = `Analyze this email content and determine if it's internship-related. If it is, extract the details:

Content: ${content}

If this is internship-related, return JSON in this exact format:
{
  "isInternship": true,
  "internship": {
    "company": "Company Name",
    "position": "Position Title", 
    "status": "Announcement|Applied|Interviewing|Rejected|Offer",
    "date": "YYYY-MM-DD",
    "notes": "Key details and next steps"
  }
}

If this is NOT internship-related, return:
{
  "isInternship": false,
  "internship": null
}

Only return valid JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log(`[EXTRACT_INTERNSHIP] AI response: ${responseText.substring(0, 200)}...`);
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`[EXTRACT_INTERNSHIP] Failed to parse JSON from response: ${responseText}`);
      return NextResponse.json({ 
        isInternship: false, 
        internship: null,
        error: "Failed to parse AI response" 
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`[EXTRACT_INTERNSHIP] Parsed result:`, parsed);
    
    // If not in manual mode and it's an internship, save to database
    if (!manualMode && parsed.isInternship && parsed.internship && emailId) {
      console.log(`[EXTRACT_INTERNSHIP] Saving internship to database:`, parsed.internship);
      
      // Save internship application
      const internshipData = {
        id: `internship-${Date.now()}`,
        company: parsed.internship.company,
        position: parsed.internship.position,
        status: parsed.internship.status,
        date: parsed.internship.date,
        notes: parsed.internship.notes,
        emailId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dbManager.saveInternshipApplication(internshipData);
      await dbManager.incrementInternshipCount();
      
      // Update email snapshot to mark as internship
      const emailSnapshot = await dbManager.getEmailSnapshot(emailId);
      if (emailSnapshot) {
        emailSnapshot.isInternship = true;
        await dbManager.saveEmailSnapshot(emailSnapshot);
      }
      
      console.log(`[EXTRACT_INTERNSHIP] Saved internship to database`);
    }

    // Save AI results to database if emailId is provided
    if (emailId && !manualMode) {
      const aiResults = {
        category: parsed.isInternship ? 'internship' : 'other',
        sentiment: 'neutral', // Default for internship extraction
        confidence: 'medium',
        internship: parsed.internship || undefined
      };
      
      await dbManager.saveAIResults(emailId, aiResults);
      console.log(`[EXTRACT_INTERNSHIP] Saved AI results to database for email ${emailId}`);
    }

    console.log(`[EXTRACT_INTERNSHIP] Final response:`, parsed);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error("[EXTRACT_INTERNSHIP_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to extract internship details" },
      { status: 500 }
    );
  }
}

