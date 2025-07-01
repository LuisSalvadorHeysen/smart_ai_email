import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/authOptions";
import { dbManager } from "../../../lib/database";

interface SessionWithToken {
  accessToken?: string;
}

export async function GET(req: NextRequest) {
  console.log(`[CLASSIFY] GET route called`);
  return NextResponse.json({ message: "Classify API is working", timestamp: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  console.log('[CLASSIFY] Route called with method: POST');
  const { emailId, emailContent, analyzeSentiment } = await req.json();
  console.log('[CLASSIFY] Request data:', { emailId, emailContent, analyzeSentiment });

  if (!emailId && !emailContent) {
    return NextResponse.json({ error: "Email ID or content is required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[CLASSIFY] GEMINI_API_KEY is not set');
    return NextResponse.json({ error: "Server configuration error: Missing API key" }, { status: 500 });
  }
  console.log('[CLASSIFY] GEMINI_API_KEY is available: Yes');

  let contentToProcess = emailContent;

  if (!contentToProcess) {
    try {
      console.log(`[CLASSIFY] Fetching email ${emailId} directly from Gmail API`);
      const session = await getServerSession(authOptions) as SessionWithToken;
      if (!session?.accessToken) {
        return NextResponse.json({ error: "Not authenticated for Gmail fetch" }, { status: 401 });
      }
      const gmail = google.gmail({ version: 'v1', headers: { Authorization: `Bearer ${session.accessToken}` } });
      const response = await gmail.users.messages.get({ userId: 'me', id: emailId, format: 'full' });
      
      const message = response.data;
      console.log(`[CLASSIFY] Message payload structure:`, {
        hasPayload: !!message.payload,
        mimeType: message.payload?.mimeType,
        hasParts: !!message.payload?.parts,
        partsCount: message.payload?.parts?.length || 0,
        hasBody: !!message.payload?.body,
        bodyDataLength: message.payload?.body?.data?.length || 0
      });
      
      // Robust extraction: try text/plain, then text/html (strip tags), then fallback
      function extractTextFromPayload(payload: any) {
        if (!payload) {
          console.log(`[CLASSIFY] No payload found`);
          return '';
        }
        // 1. Try text/plain part
        if (payload.parts) {
          console.log(`[CLASSIFY] Processing ${payload.parts.length} parts`);
          const textPart = payload.parts.find((p: any) => p.mimeType === 'text/plain' && p.body?.data);
          if (textPart) {
            console.log(`[CLASSIFY] Found text/plain part, data length: ${textPart.body.data.length}`);
            return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
          // 2. Try text/html part
          const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html' && p.body?.data);
          if (htmlPart) {
            console.log(`[CLASSIFY] Found text/html part, data length: ${htmlPart.body.data.length}`);
            const html = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
            return html.replace(/<[^>]*>/g, ' ');
          }
          console.log(`[CLASSIFY] No text/plain or text/html parts found`);
        }
        // 3. Try main body
        if (payload.body?.data) {
          console.log(`[CLASSIFY] Using main body, mimeType: ${payload.mimeType}, data length: ${payload.body.data.length}`);
          if (payload.mimeType === 'text/html') {
            const html = Buffer.from(payload.body.data, 'base64').toString('utf-8');
            return html.replace(/<[^>]*>/g, ' ');
          } else {
            return Buffer.from(payload.body.data, 'base64').toString('utf-8');
          }
        }
        console.log(`[CLASSIFY] No content found in payload`);
        return '';
      }
      contentToProcess = extractTextFromPayload(message.payload);
    } catch (error) {
      console.error(`[CLASSIFY] Error fetching email from Gmail API:`, error);
      return NextResponse.json({ error: "Failed to fetch email content from Gmail" }, { status: 500 });
    }
  }

  console.log(`[CLASSIFY] Retrieved content length: ${contentToProcess?.length || 0}`);

  if (!contentToProcess) {
    return NextResponse.json({ error: "Could not retrieve email content" }, { status: 400 });
  }

  try {
    console.log(`[CLASSIFY] Processing content with AI, length: ${contentToProcess.length}`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      Analyze the email content and classify it into one of these categories: 
      "internship", "spam", "personal", "promotional", "work", or "other".
      Also determine if the email's sentiment is "positive", "negative", "neutral", or "urgent".
      Provide a confidence level for the classification ("high", "medium", "low").
      
      Respond with a JSON object with "category", "sentiment", and "confidence".
      Example: {"category": "internship", "sentiment": "positive", "confidence": "high"}

      Email content:
      """
      ${contentToProcess.substring(0, 30000)}
      """
    `;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log('[CLASSIFY] AI response:', responseText);

    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResult = JSON.parse(cleanedJson);
    console.log('[CLASSIFY] Parsed result:', parsedResult);

    // Save results to the database
    await dbManager.saveAIResults(emailId, {
      category: parsedResult.category || 'other',
      sentiment: parsedResult.sentiment || 'neutral',
      confidence: parsedResult.confidence || 'medium'
    });
    console.log(`[CLASSIFY] Saved AI results to database for email ${emailId}`);
    
    const finalResponse = {
      category: parsedResult.category || 'other',
      isInternship: parsedResult.category === 'internship',
      sentiment: parsedResult.sentiment || 'neutral',
      confidence: parsedResult.confidence || 'medium'
    };

    console.log('[CLASSIFY] Final response:', finalResponse);
    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error('[CLASSIFY] AI processing error:', error);
    return NextResponse.json({ error: "Failed to process email with AI" }, { status: 500 });
  }
} 