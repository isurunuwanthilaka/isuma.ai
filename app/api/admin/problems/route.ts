import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole(["admin", "recruiter"]);

    const problems = await prisma.codingProblem.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ problems }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["admin", "recruiter"]);

    const body = await request.json();
    const {
      title,
      description,
      difficulty,
      timeLimit,
      testCases,
      starterCode,
    } = body;

    const createdBy = user.id;

    if (!title || !description || !difficulty || !timeLimit || !testCases) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const validDifficulties = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 },
      );
    }

    let parsedTestCases;
    try {
      parsedTestCases =
        typeof testCases === "string" ? JSON.parse(testCases) : testCases;

      if (!Array.isArray(parsedTestCases)) {
        throw new Error("Test cases must be an array");
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid test cases format. Must be valid JSON array." },
        { status: 400 },
      );
    }

    const problem = await prisma.codingProblem.create({
      data: {
        title,
        description,
        difficulty,
        timeLimit: parseInt(timeLimit),
        testCases: JSON.stringify(parsedTestCases),
        starterCode: starterCode || "",
        createdBy,
      },
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

    return NextResponse.json({ problem }, { status: 201 });
  } catch (error) {
    console.error("Failed to create problem:", error);
    return NextResponse.json(
      { error: "Failed to create problem" },
      { status: 500 },
    );
  }
}
