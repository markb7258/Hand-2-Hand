import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getSecret } from './secrets';

const JWT_SECRET = getSecret('JWT_SECRET', '/run/secrets/jwt_secret', 'fallback-secret-key');
const COOKIE_NAME = 'auth-token';

export interface JWTPayload {
  userId: string;
  email: string;
  isVerified: boolean;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });
}

export function getAuthCookie(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value;
}

export function removeAuthCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getCurrentUser(): JWTPayload | null {
  const token = getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
