import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, image, timestamp } = await request.json();

    if (!sessionId || !image || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadsDir = join(process.cwd(), 'uploads', 'snapshots');
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${sessionId}_${Date.now()}.jpg`;
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    const snapshot = await prisma.cameraSnapshot.create({
      data: {
        sessionId,
        imageUrl: `/uploads/snapshots/${filename}`,
        timestamp: new Date(timestamp),
      },
    });

    return NextResponse.json({
      success: true,
      snapshotId: snapshot.id,
      imageUrl: snapshot.imageUrl,
    });
  } catch (error) {
    console.error('Error saving snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to save snapshot' },
      { status: 500 }
    );
  }
}
