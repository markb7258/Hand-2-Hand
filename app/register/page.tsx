'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { init, id } from '@instantdb/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '7b67f3b1-46b2-4724-a83d-ae3f6a47b087';
const ADMIN_EMAIL = 'ericreiss@aol.com';
const db = init({ appId: APP_ID });

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already authenticated
  const { user } = db.useAuth();
  
  React.useEffect(() => {
    // If user is authenticated and has a profile, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await db.auth.sendMagicCode({ email });
      setSentEmail(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Sign in with magic code - this will set the user in the auth hook
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
      // The useEffect will detect the new user and redirect to dashboard
      // Profile will be created on first dashboard visit if needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  if (sentEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg bg-pattern px-4">
        <Card className="w-full max-w-md glass-card border-cyan-400/30 shadow-2xl animate-fade-in">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-display bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-slate-300">
              We sent a verification code to {sentEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-200">
                  6-Digit Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest bg-white/90 border-cyan-400/30 text-slate-900"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full gradient-accent text-navy-900 font-semibold"
                size="lg"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setSentEmail('');
                  setCode('');
                  setError('');
                }}
                className="w-full text-cyan-400 hover:text-cyan-300 text-sm"
              >
                Use a different email
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg bg-pattern px-4">
      <Card className="w-full max-w-md glass-card border-cyan-400/30 shadow-2xl animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-display bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-300">
            Join Hand 2 Hand to start managing mission data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendCode} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-white/90 border-cyan-400/30 text-slate-900"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-accent text-navy-900 font-semibold"
              size="lg"
            >
              {isLoading ? 'Sending Code...' : 'Send Verification Code'}
            </Button>

            <div className="text-center text-sm text-slate-300">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
