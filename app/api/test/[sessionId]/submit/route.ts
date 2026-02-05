import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const testSession = await prisma.testSession.findUnique({
      where: { id: sessionId },
    });

    if (!testSession) {
      return NextResponse.json(
        { error: 'Test session not found' },
        { status: 404 }
      );
    }

    if (testSession.endTime) {
      return NextResponse.json(
        { error: 'Test already submitted' },
        { status: 400 }
      );
    }

    const updatedSession = await prisma.testSession.update({
      where: { id: sessionId },
      data: {
        submittedCode: code,
        endTime: new Date(),
        status: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Code submitted successfully',
      submittedAt: updatedSession.endTime,
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    return NextResponse.json(
      { error: 'Failed to submit code' },
      { status: 500 }
    );
  }
}
