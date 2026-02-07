import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["admin", "recruiter"]);

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      difficulty,
      timeLimit,
      testCases,
      starterCode,
    } = body;

    if (difficulty) {
      const validDifficulties = ["easy", "medium", "hard"];
      if (!validDifficulties.includes(difficulty)) {
        return NextResponse.json(
          { error: "Invalid difficulty level" },
          { status: 400 },
        );
      }
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (difficulty) updateData.difficulty = difficulty;
    if (timeLimit) updateData.timeLimit = parseInt(timeLimit);
    if (starterCode !== undefined) updateData.starterCode = starterCode;

    if (testCases) {
      try {
        const parsedTestCases =
          typeof testCases === "string" ? JSON.parse(testCases) : testCases;

        if (!Array.isArray(parsedTestCases)) {
          throw new Error("Test cases must be an array");
        }
        updateData.testCases = JSON.stringify(parsedTestCases);
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid test cases format. Must be valid JSON array." },
          { status: 400 },
        );
      }
    }

    const problem = await prisma.codingProblem.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ problem }, { status: 200 });
  } catch (error) {
    console.error("Failed to update problem:", error);
    return NextResponse.json(
      { error: "Failed to update problem" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["admin", "recruiter"]);

    const { id } = await params;

    const testSessionCount = await prisma.testSession.count({
      where: { problemId: id },
    });

    if (testSessionCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete problem with existing test sessions" },
        { status: 400 },
      );
    }

    await prisma.codingProblem.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Problem deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete problem:", error);
    return NextResponse.json(
      { error: "Failed to delete problem" },
      { status: 500 },
    );
  }
}
