import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@isuma.ai',
          name: 'Admin',
          password: 'placeholder',
          role: 'admin',
        },
      });
    }

    return NextResponse.json({ id: adminUser.id }, { status: 200 });
  } catch (error) {
    console.error('Failed to get admin user:', error);
    return NextResponse.json(
      { error: 'Failed to get admin user' },
      { status: 500 }
    );
  }
}
