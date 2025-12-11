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
    const countrySlug = searchParams.get('countrySlug');

    if (countrySlug) {
      // Get specific note for user and country
      const note = await prisma.note.findUnique({
        where: {
          userId_countrySlug: {
            userId: user.userId,
            countrySlug
          }
        }
      });
      return NextResponse.json({ note });
    }

    // Get all notes for user
    const notes = await prisma.note.findMany({
      where: { userId: user.userId },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Notes GET error:', error);
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
    const { countrySlug, content } = body;

    const note = await prisma.note.upsert({
      where: {
        userId_countrySlug: {
          userId: user.userId,
          countrySlug
        }
      },
      update: {
        content,
        updatedAt: new Date()
      },
      create: {
        userId: user.userId,
        countrySlug,
        content,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Notes POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const countrySlug = searchParams.get('countrySlug');

    if (!countrySlug) {
      return NextResponse.json({ error: 'Country slug required' }, { status: 400 });
    }

    await prisma.note.delete({
      where: {
        userId_countrySlug: {
          userId: user.userId,
          countrySlug
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notes DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
