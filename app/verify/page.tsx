'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { markEmailAsVerified, resendVerificationCode } from '@/app/actions/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { clientDb } from '@/lib/instant-server';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Verify with InstantDB magic code
      const magicCodeResult = await clientDb.auth.signInWithMagicCode({ email, code });
      
      if (magicCodeResult.error) {
        console.error('Magic code error:', magicCodeResult.error);
        setError('Invalid or expired verification code. Please check the code and try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Mark user as verified in our database
      const result = await markEmailAsVerified(email);

      if (result.success) {
        setSuccess(true);
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setError(result.error || 'Verification failed');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      // Check if it's a magic code validation error
      if (err?.message?.includes('code') || err?.message?.includes('invalid')) {
        setError('Invalid or expired verification code. Please check the code and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setResendMessage('');
    setIsResending(true);

    try {
      // Send new magic code via InstantDB
      await clientDb.auth.sendMagicCode({ email });
      setResendMessage('Verification code sent! Please check your email.');
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg bg-pattern p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-6 text-center">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm sm:text-base">
            ← Back to Home
          </Link>
        </div>


        {/* Verification Card */}
        <Card className="glass-card border-cyan-400/20 shadow-cyan-glow hover:shadow-cyan-glow transition-all duration-300 animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl text-slate-100">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-3 text-slate-300">
              Enter the 6-digit code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="border-cyan-400 bg-cyan-500/10">
                  <AlertDescription className="text-cyan-300">
                    Email verified successfully! Redirecting to dashboard...
                  </AlertDescription>
                </Alert>
              )}

              {/* Resend Message */}
              {resendMessage && (
                <Alert className="border-cyan-400 bg-cyan-500/10">
                  <AlertDescription className="text-cyan-300">
                    {resendMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting || success}
                  className="bg-navy-800/50 border-cyan-400/30 text-slate-100 placeholder:text-slate-400"
                />
              </div>

              {/* Verification Code Field */}
              <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-200">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoFocus
                  disabled={isSubmitting || success}
                  maxLength={6}
                  className="text-center text-2xl sm:text-3xl tracking-widest font-bold bg-navy-800/50 border-cyan-400/30 text-slate-100 placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400 text-center">
                  Check your email for the 6-digit code
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full gradient-accent text-navy-900 font-semibold hover:shadow-cyan-glow"
                size="lg"
              >
                {isSubmitting ? 'Verifying...' : success ? 'Success!' : 'Verify Email'}
              </Button>

              {/* Resend Code Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={isResending || success}
                className="w-full text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-cyan-400/20">
                <p className="text-sm text-slate-300">
                  Already verified?{' '}
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center gradient-bg bg-pattern">
        <div className="text-lg text-slate-300 animate-pulse">Loading...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
