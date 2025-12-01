'use client';

import { init } from '@instantdb/react';

const APP_ID = '7b67f3b1-46b2-4724-a83d-ae3f6a47b087';

export const db = init({ appId: APP_ID });

export type { AppSchema } from './instant-schema';
