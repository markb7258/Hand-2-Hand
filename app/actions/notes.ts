'use server';

import { z } from 'zod';

// Note: InstantDB mutations need to be done on the client side
// These are placeholder actions that will validate data before client-side mutations

const saveNoteSchema = z.object({
  userId: z.string(),
  countrySlug: z.string(),
  content: z.string(),
});

export async function validateNoteData(data: unknown) {
  try {
    const validated = saveNoteSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: 'Invalid data' };
  }
}

const updateCountryDataSchema = z.object({
  countrySlug: z.string(),
  population: z.string().optional(),
  groups: z.number().optional(),
});

export async function validateCountryData(data: unknown) {
  try {
    const validated = updateCountryDataSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: 'Invalid data' };
  }
}

const promoteUserSchema = z.object({
  userId: z.string(),
  isAdmin: z.boolean(),
});

export async function validatePromoteUser(data: unknown) {
  try {
    const validated = promoteUserSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: 'Invalid data' };
  }
}
