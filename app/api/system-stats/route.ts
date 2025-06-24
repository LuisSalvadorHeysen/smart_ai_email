import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "../../../lib/database";

export async function GET(req: NextRequest) {
  try {
    const systemState = await dbManager.getSystemState();
    
    return NextResponse.json({
      totalEmailsProcessed: systemState.totalEmailsProcessed,
      totalInternshipsFound: systemState.totalInternshipsFound,
      lastFetchTime: systemState.lastFetchTime,
      lastUpdated: systemState.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: "Failed to fetch system statistics" },
      { status: 500 }
    );
  }
} 