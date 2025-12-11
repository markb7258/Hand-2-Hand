import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countrySlug = searchParams.get('countrySlug');

    if (!countrySlug) {
      return NextResponse.json({ error: 'Country slug required' }, { status: 400 });
    }

    const images = await prisma.galleryImage.findMany({
      where: { countrySlug },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const profile = await prisma.profile.findUnique({
      where: { userId: user.userId }
    });

    if (!profile?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { countrySlug, images } = body;

    // Delete existing images for this country
    await prisma.galleryImage.deleteMany({
      where: { countrySlug }
    });

    // Create new images
    const createdImages = await prisma.galleryImage.createMany({
      data: images.map((img: any, index: number) => ({
        countrySlug,
        imageUrl: img.imageUrl || img.url,
        order: img.order || index + 1
      }))
    });

    // Fetch the created images
    const newImages = await prisma.galleryImage.findMany({
      where: { countrySlug },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ images: newImages });
  } catch (error) {
    console.error('Gallery POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const profile = await prisma.profile.findUnique({
      where: { userId: user.userId }
    });

    if (!profile?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    await prisma.galleryImage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gallery DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
