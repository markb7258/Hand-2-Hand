import { i } from '@instantdb/react';

// Define the schema for InstantDB
export const schema = i.schema({
  entities: {
    // User profiles with admin status and authentication
    profiles: i.entity({
      email: i.string(),
      passwordHash: i.string(),
      isAdmin: i.boolean(),
      isVerified: i.boolean(),
      createdAt: i.number(),
    }),
    // Country data (population and groups)
    countries: i.entity({
      name: i.string(),
      slug: i.string(),
      population: i.string(),
      groups: i.number(),
      photoUrl: i.string().optional(),
      countryDetails: i.string().optional(),
      primaryContacts: i.string().optional(),
      adminNotes: i.string().optional(),
      flag: i.string().optional(),
    }),
    // User notes for each country
    notes: i.entity({
      userId: i.string(),
      countrySlug: i.string(),
      content: i.string(),
      updatedAt: i.number(),
    }),
    // Gallery images for each country
    galleryImages: i.entity({
      countrySlug: i.string(),
      imageUrl: i.string(),
      order: i.number(),
    }),
  },
  links: {},
  rooms: {},
});

export type AppSchema = typeof schema;
