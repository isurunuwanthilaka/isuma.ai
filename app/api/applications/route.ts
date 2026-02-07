import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/file-utils";
import { analyzeCv } from "@/lib/ai/cv-analyzer";
import * as pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const position = formData.get("position") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const cvFile = formData.get("cv") as File;

    if (!name || !email || !position || !cvFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Look up user by email — they may already exist from Supabase Auth signup
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For public applications, create a placeholder user record.
      // The user can later sign up via Supabase Auth and be linked by email.
      user = await prisma.user.create({
        data: {
          supabaseId: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          email,
          name,
          role: "candidate",
        },
      });
    }

    const cvFilePath = await saveFile(cvFile, user.id);

    const cvBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(cvBuffer);

    let cvText = "";
    const fileType = cvFile.type;

    try {
      if (fileType === "application/pdf") {
        const pdfData = await (pdfParse as any).default(buffer);
        cvText = pdfData.text;
      } else if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ buffer });
        cvText = result.value;
      } else if (fileType === "text/plain") {
        cvText = buffer.toString("utf-8");
      } else {
        cvText = buffer.toString("utf-8");
      }
    } catch (error) {
      console.error("Failed to extract text from CV:", error);
      cvText = buffer.toString("utf-8");
    }

    let cvAnalysis = null;
    try {
      const analysis = await analyzeCv(cvText);
      cvAnalysis = JSON.stringify(analysis);
    } catch (error) {
      console.error("CV analysis failed:", error);
    }

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        position,
        cvUrl: cvFilePath,
        cvAnalysis,
        coverLetter,
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        success: true,
        applicationId: application.id,
        message: "Application submitted successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 },
    );
  }
}
