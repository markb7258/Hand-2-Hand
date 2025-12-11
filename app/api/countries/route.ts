import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Get specific country
      const country = await prisma.country.findUnique({
        where: { slug },
        include: {
          galleryImages: {
            orderBy: { order: 'asc' }
          }
        }
      });
      return NextResponse.json({ country });
    }

    // Get all countries
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' },
      include: {
        galleryImages: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json({ countries });
  } catch (error) {
    console.error('Countries GET error:', error);
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
    const { 
      name, 
      slug, 
      population, 
      groups, 
      photoUrl, 
      countryDetails, 
      primaryContacts, 
      adminNotes, 
      flag 
    } = body;

    const country = await prisma.country.create({
      data: {
        name,
        slug,
        population,
        groups: groups || 12,
        photoUrl,
        countryDetails,
        primaryContacts,
        adminNotes,
        flag
      }
    });

    return NextResponse.json({ country });
  } catch (error) {
    console.error('Countries POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const { slug, ...updateData } = body;

    const country = await prisma.country.update({
      where: { slug },
      data: updateData
    });

    return NextResponse.json({ country });
  } catch (error) {
    console.error('Countries PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
