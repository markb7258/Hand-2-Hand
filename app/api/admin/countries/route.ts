import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// PATCH - Update country data (admin only)
export async function PATCH(request: NextRequest) {
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
    const { countryId, population, groups, photoUrl, countryDetails, primaryContacts, adminNotes, flag } = body;

    if (!countryId) {
      return NextResponse.json({ error: 'Country ID required' }, { status: 400 });
    }

    // Update country with provided fields
    const updateData: any = {};
    if (population !== undefined) updateData.population = population;
    if (groups !== undefined) updateData.groups = groups;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl || null;
    if (countryDetails !== undefined) updateData.countryDetails = countryDetails || null;
    if (primaryContacts !== undefined) updateData.primaryContacts = primaryContacts || null;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes || null;
    if (flag !== undefined) updateData.flag = flag || null;

    const updatedCountry = await prisma.country.update({
      where: { id: countryId },
      data: updateData,
    });

    return NextResponse.json({ country: updatedCountry });
  } catch (error) {
    console.error('Error updating country:', error);
    return NextResponse.json(
      { error: 'Failed to update country' },
      { status: 500 }
    );
  }
}
