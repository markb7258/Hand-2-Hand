import { i } from '@instantdb/core';

// Define the schema for InstantDB
const _schema = i.schema({
  entities: {
    // InstantDB built-in users (authentication)
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    // User profiles with admin status
    profiles: i.entity({
      displayName: i.string().optional(),
      isAdmin: i.boolean(),
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
  links: {
    userProfile: {
      forward: {
        on: 'profiles',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'one',
        label: 'profile',
      },
    },
  },
  rooms: {},
});

export default _schema;
