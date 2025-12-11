import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Get specific profile
      const profile = await prisma.profile.findUnique({
        where: { userId }
      });
      return NextResponse.json({ profile });
    }

    // Get all profiles (admin only)
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.userId }
    });

    if (!currentProfile?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const profiles = await prisma.profile.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Profiles GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, displayName, isAdmin } = body;

    // Check if user can create/update profiles
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.userId }
    });

    // Only admins can set isAdmin flag
    const adminFlag = currentProfile?.isAdmin ? isAdmin : false;

    const profile = await prisma.profile.upsert({
      where: { userId: userId || user.userId },
      update: {
        displayName,
        ...(currentProfile?.isAdmin && { isAdmin: adminFlag })
      },
      create: {
        userId: userId || user.userId,
        email: user.email,
        displayName,
        isAdmin: adminFlag
      }
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profiles POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, isAdmin } = body;

    // Only admins can change admin status
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.userId }
    });

    if (!currentProfile?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: { isAdmin }
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profiles PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
