import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "../../../lib/database";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const internships = await dbManager.getAllInternships();
    return NextResponse.json(internships);
  } catch (error) {
    console.error("[INTERNSHIPS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch internships" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newInternship = {
      id: randomUUID(),
      ...body,
    };
    await dbManager.saveInternship(newInternship);
    return NextResponse.json(newInternship, { status: 201 });
  } catch (error) {
    console.error("[INTERNSHIPS_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to save internship" }, { status: 500 });
  }
} 