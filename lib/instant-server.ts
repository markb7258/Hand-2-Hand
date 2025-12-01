'use client';

import { init } from '@instantdb/react';

// Initialize InstantDB client for magic code operations
export const clientDb = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID || '7b67f3b1-46b2-4724-a83d-ae3f6a47b087',
});
