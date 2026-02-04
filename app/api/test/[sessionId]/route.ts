import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    const testSession = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        problem: true,
      },
    });

    if (!testSession) {
      return NextResponse.json(
        { error: 'Test session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: testSession.id,
      title: testSession.problem.title,
      description: testSession.problem.description,
      starterCode: testSession.problem.starterCode || '',
      duration: testSession.problem.timeLimit,
      startedAt: testSession.startTime.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching test session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test session' },
      { status: 500 }
    );
  }
}
