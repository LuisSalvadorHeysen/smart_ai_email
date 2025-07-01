import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "../../../lib/database";

export async function GET(req: NextRequest) {
  try {
    const systemState = await dbManager.getSystemState();
    const allEmails = await dbManager.getAllEmailsWithAIResults();
    const allInternships = await dbManager.getAllInternships();
    
    return NextResponse.json({
      totalEmailsProcessed: allEmails.filter(email => email.processed).length,
      totalInternshipsFound: allInternships.length,
      lastFetchTime: systemState.lastFetchTime,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: "Failed to fetch system statistics" },
      { status: 500 }
    );
  }
} 