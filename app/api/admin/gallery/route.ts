import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// POST - Bulk update gallery images for a country (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const userProfile = await prisma.profile.findUnique({
      where: { userId: payload.userId },
    });

    if (!userProfile?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    const body = await request.json();
    const { countrySlug, imageUrls } = body;

    if (!countrySlug || !Array.isArray(imageUrls)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Delete all existing gallery images for this country
    await prisma.galleryImage.deleteMany({
      where: { countrySlug },
    });

    // Create new gallery images (filter out empty URLs)
    const validUrls = imageUrls.filter((url: string) => url && url.trim() !== '');
    const newImages = await Promise.all(
      validUrls.map((url: string, index: number) =>
        prisma.galleryImage.create({
          data: {
            countrySlug,
            imageUrl: url,
            order: index + 1,
          },
        })
      )
    );

    return NextResponse.json({ images: newImages });
  } catch (error) {
    console.error('Error updating gallery:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery' },
      { status: 500 }
    );
  }
}
