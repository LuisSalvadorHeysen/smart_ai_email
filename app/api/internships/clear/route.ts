import { NextResponse } from "next/server";
import { dbManager } from "../../../../lib/database";

export async function POST() {
    try {
        await dbManager.clearInternships();
        return NextResponse.json({ message: "Internships cleared successfully" });
    } catch (error) {
        console.error("[INTERNSHIPS_CLEAR_ERROR]", error);
        return NextResponse.json({ error: "Failed to clear internships" }, { status: 500 });
    }
} 