'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { registerUser } from '@/app/actions/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { clientDb } from '@/lib/instant-server';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await registerUser({ email, password, confirmPassword });

      if (result.success) {
        // Send magic code via InstantDB client-side
        try {
          await clientDb.auth.sendMagicCode({ email });
          console.log(`Magic code sent to ${email}`);
        } catch (magicError) {
          console.error('Failed to send magic code:', magicError);
          setError('Registration successful but failed to send verification email. Please try again from the verification page.');
          setIsSubmitting(false);
          return;
        }
        
        setSuccess(true);
        // Redirect to verification page after 2 seconds
        setTimeout(() => {
          router.push(`/verify?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
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


        {/* Registration Card */}
        <Card className="glass-card border-cyan-400/20 shadow-cyan-glow hover:shadow-cyan-glow transition-all duration-300 animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl text-slate-100">
              Create Account
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-3 text-slate-300">
              Join us to start managing your mission data
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
                    Registration successful! Redirecting to verification...
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
                  autoFocus
                  disabled={isSubmitting || success}
                  className="bg-navy-800/50 border-cyan-400/30 text-slate-100 placeholder:text-slate-400"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting || success}
                  className="bg-navy-800/50 border-cyan-400/30 text-slate-100 placeholder:text-slate-400"
                  minLength={8}
                />
                <p className="text-xs text-slate-400">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting || success}
                  className="bg-navy-800/50 border-cyan-400/30 text-slate-100 placeholder:text-slate-400"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full gradient-accent text-navy-900 font-semibold hover:shadow-cyan-glow"
                size="lg"
              >
                {isSubmitting ? 'Creating Account...' : success ? 'Success!' : 'Create Account'}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-cyan-400/20">
                <p className="text-sm text-slate-300">
                  Already have an account?{' '}
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
