import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireRole(["admin", "recruiter"]);
    return NextResponse.json({ id: user.id }, { status: 200 });
  } catch (error) {
    console.error("Failed to get admin user:", error);
    return NextResponse.json(
      { error: "Unauthorized. Please sign in as admin." },
      { status: 401 },
    );
  }
}
