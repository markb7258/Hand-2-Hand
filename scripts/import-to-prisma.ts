import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
  console.log('Starting Prisma data import from InstantDB export...\\n');
  
  try {
    // Read export file
    const exportData = JSON.parse(fs.readFileSync('instantdb-export.json', 'utf8'));
    console.log('Loaded export file:', exportData.summary);
    console.log('');
    
    // Import profiles
    console.log('Importing profiles...');
    for (const profile of exportData.entities.profiles) {
      await prisma.profile.upsert({
        where: { id: profile.id },
        update: {},
        create: {
          id: profile.id,
          userId: profile.id, // In InstantDB, the profile id IS the user id
          displayName: profile.displayName || null,
          isAdmin: profile.isAdmin || false,
        }
      });
    }
    console.log(`  ✓ Imported ${exportData.entities.profiles.length} profiles`);
    
    // Import countries
    console.log('Importing countries...');
    for (const country of exportData.entities.countries) {
      await prisma.country.upsert({
        where: { slug: country.slug },
        update: {},
        create: {
          id: country.id,
          name: country.name,
          slug: country.slug,
          population: country.population || '',
          groups: country.groups || 12,
          photoUrl: country.photoUrl || null,
          countryDetails: country.countryDetails || null,
          primaryContacts: country.primaryContacts || null,
          adminNotes: country.adminNotes || null,
          flag: country.flag || null,
        }
      });
    }
    console.log(`  ✓ Imported ${exportData.entities.countries.length} countries`);
    
    // Import notes
    console.log('Importing notes...');
    for (const note of exportData.entities.notes) {
      await prisma.note.upsert({
        where: { 
          userId_countrySlug: {
            userId: note.userId,
            countrySlug: note.countrySlug
          }
        },
        update: {},
        create: {
          id: note.id,
          userId: note.userId,
          countrySlug: note.countrySlug,
          content: note.content || '',
          updatedAt: new Date(note.updatedAt),
        }
      });
    }
    console.log(`  ✓ Imported ${exportData.entities.notes.length} notes`);
    
    // Import gallery images
    console.log('Importing gallery images...');
    for (const image of exportData.entities.galleryImages) {
      await prisma.galleryImage.upsert({
        where: { id: image.id },
        update: {},
        create: {
          id: image.id,
          countrySlug: image.countrySlug,
          imageUrl: image.imageUrl,
          order: image.order,
        }
      });
    }
    console.log(`  ✓ Imported ${exportData.entities.galleryImages.length} gallery images`);
    
    // Verify totals
    const counts = {
      profiles: await prisma.profile.count(),
      countries: await prisma.country.count(),
      notes: await prisma.note.count(),
      galleryImages: await prisma.galleryImage.count(),
    };
    
    console.log('\\n✅ Import complete!');
    console.log('Database record counts:', counts);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importData().catch(console.error);
