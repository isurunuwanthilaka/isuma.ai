import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Syncs a Supabase Auth user to the local Prisma database.
 * Called after signup to create a corresponding User record.
 */
export async function POST(request: NextRequest) {
  try {
    const { supabaseId, email, name } = await request.json();

    if (!supabaseId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      // Also check by email in case of a partial sync
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Update existing user with supabaseId
        user = await prisma.user.update({
          where: { email },
          data: { supabaseId },
        });
      } else {
        user = await prisma.user.create({
          data: {
            supabaseId,
            email,
            name: name || null,
            role: "candidate",
          },
        });
      }
    }

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to sync user:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
