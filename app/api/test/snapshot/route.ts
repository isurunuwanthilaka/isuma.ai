import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { uploadImageToSupabase } from "@/lib/supabase";

// Check if we're running on Vercel or have Supabase configured
const USE_SUPABASE =
  process.env.VERCEL ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(request: NextRequest) {
  try {
    const { sessionId, image, timestamp } = await request.json();

    if (!sessionId || !image || !timestamp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const testSession = await prisma.testSession.findUnique({
      where: { id: sessionId },
    });

    if (!testSession) {
      return NextResponse.json(
        { error: "Test session not found" },
        { status: 404 },
      );
    }

    let imageUrl: string;

    // Use Supabase Storage on Vercel or when explicitly configured
    if (USE_SUPABASE) {
      try {
        imageUrl = await uploadImageToSupabase(image, sessionId);
      } catch (error) {
        console.error(
          "Supabase upload failed, falling back to local storage:",
          error,
        );
        // Fall back to local storage
        imageUrl = await saveImageLocally(image, sessionId);
      }
    } else {
      // Local file storage for development
      imageUrl = await saveImageLocally(image, sessionId);
    }

    const snapshot = await prisma.cameraSnapshot.create({
      data: {
        sessionId,
        imageUrl,
        timestamp: new Date(timestamp),
      },
    });

    return NextResponse.json({
      success: true,
      snapshotId: snapshot.id,
      imageUrl: snapshot.imageUrl,
    });
  } catch (error) {
    console.error("Error saving snapshot:", error);
    return NextResponse.json(
      { error: "Failed to save snapshot" },
      { status: 500 },
    );
  }
}

async function saveImageLocally(
  image: string,
  sessionId: string,
): Promise<string> {
  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const uploadsDir = join(process.cwd(), "uploads", "snapshots");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${sessionId}_${Date.now()}.jpg`;
  const filepath = join(uploadsDir, filename);

  await writeFile(filepath, buffer);

  return `/uploads/snapshots/${filename}`;
}
