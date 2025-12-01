'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { init } from '@instantdb/admin';
import { generateToken, setAuthCookie, removeAuthCookie } from '@/lib/auth';

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || 'fd93719b-b44d-4edf-a070-819097ba20a3';
const ADMIN_SECRET = process.env.INSTANT_APP_SECRET || 'db4b4adc-6730-4a81-9ec8-8da0b4699775';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ericreiss@aol.com';

const db = init({ appId: APP_ID, adminToken: ADMIN_SECRET });

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  requiresVerification?: boolean;
}

export async function registerUser(data: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthResponse> {
  try {
    // Validate input
    const validated = registerSchema.parse(data);

    // Check if user already exists
    const existingUsers = await db.query({ profiles: { $: { where: { email: validated.email } } } });
    
    if (existingUsers.profiles && existingUsers.profiles.length > 0) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10);

    // Check if user is admin
    const isAdmin = validated.email === ADMIN_EMAIL;

    // Create user profile (unverified)
    const userId = crypto.randomUUID();
    await db.transact([
      db.tx.profiles[userId].update({
        email: validated.email,
        passwordHash,
        isAdmin,
        isVerified: false,
        createdAt: Date.now(),
      }),
    ]);

    return {
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
      requiresVerification: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    // Validate input
    const validated = loginSchema.parse(data);

    // Find user
    const result = await db.query({ profiles: { $: { where: { email: validated.email } } } });
    
    if (!result.profiles || result.profiles.length === 0) {
      return { success: false, error: 'Invalid email or password' };
    }

    const user = result.profiles[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(validated.password, user.passwordHash);
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Check if email is verified
    if (!user.isVerified) {
      return {
        success: false,
        error: 'Please verify your email before logging in',
        requiresVerification: true,
      };
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isVerified: user.isVerified,
    });

    // Set cookie
    setAuthCookie(token);

    return { success: true, message: 'Login successful!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

// Server action called AFTER client-side verification succeeds
export async function markEmailAsVerified(email: string): Promise<AuthResponse> {
  try {
    // Find user profile
    const result = await db.query({ profiles: { $: { where: { email } } } });
    
    if (!result.profiles || result.profiles.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const user = result.profiles[0];

    // Check if already verified
    if (user.isVerified) {
      return { success: false, error: 'Email already verified' };
    }

    // Mark profile as verified
    await db.transact([
      db.tx.profiles[user.id].update({
        isVerified: true,
      }),
    ]);

    // Generate JWT token and log them in
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isVerified: true,
    });

    // Set cookie
    setAuthCookie(token);

    return { success: true, message: 'Email verified successfully!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Verification failed. Please try again.' };
  }
}

export async function resendVerificationCode(email: string): Promise<AuthResponse> {
  try {
    // Find user
    const result = await db.query({ profiles: { $: { where: { email } } } });
    
    if (!result.profiles || result.profiles.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const user = result.profiles[0];

    // Check if already verified
    if (user.isVerified) {
      return { success: false, error: 'Email already verified' };
    }

    // Note: Magic code must be sent client-side
    return { success: true, message: 'Please request a new code from the verification page.' };
  } catch (error) {
    return { success: false, error: 'Failed to resend code. Please try again.' };
  }
}

export async function logoutUser(): Promise<AuthResponse> {
  try {
    removeAuthCookie();
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    return { success: false, error: 'Logout failed' };
  }
}
