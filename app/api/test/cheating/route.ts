import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, type, timestamp } = await request.json();

    if (!sessionId || !type || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validTypes = ['copy', 'paste', 'cut', 'tab_switch', 'window_blur'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid cheating event type' },
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

    const cheatingLog = await prisma.cheatingLog.create({
      data: {
        sessionId,
        eventType: type,
        timestamp: new Date(timestamp),
      },
    });

    return NextResponse.json({
      success: true,
      logId: cheatingLog.id,
    });
  } catch (error) {
    console.error('Error logging cheating event:', error);
    return NextResponse.json(
      { error: 'Failed to log cheating event' },
      { status: 500 }
    );
  }
}
