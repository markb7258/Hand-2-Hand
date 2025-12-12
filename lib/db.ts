import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from './secrets';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Set DATABASE_URL from Docker secrets if not already set
if (!process.env.DATABASE_URL) {
  try {
    process.env.DATABASE_URL = getDatabaseUrl();
  } catch (error) {
    console.warn('Failed to load DATABASE_URL from secrets:', error);
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
