import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "../../../lib/database";

export async function POST(req: NextRequest) {
  try {
    const { id, isInternship, processed } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: "Email ID is required" }, { status: 400 });
    }

    // Update email in database
    await dbManager.markEmailAsProcessed(id);
    
    // If it's an internship email, we might want to update the isInternship flag
    // This would require adding a method to update email snapshots
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update email error:', error);
    return NextResponse.json(
      { error: error.message || "Failed to update email" },
      { status: 500 }
    );
  }
} 