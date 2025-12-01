'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginUser } from '@/app/actions/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    setRequiresVerification(false);

    try {
      const result = await loginUser({ email, password });

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Login failed');
        if (result.requiresVerification) {
          setRequiresVerification(true);
        }
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


        {/* Login Card */}
        <Card className="glass-card border-cyan-400/20 shadow-cyan-glow hover:shadow-cyan-glow transition-all duration-300 animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl text-slate-100">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-3 text-slate-300">
              Sign in to continue to your dashboard
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

              {/* Verification Link */}
              {requiresVerification && (
                <Alert>
                  <AlertDescription className="text-slate-300">
                    Need to verify your email?{' '}
                    <Link href={`/verify?email=${encodeURIComponent(email)}`} className="underline font-semibold text-cyan-400 hover:text-cyan-300">
                      Click here
                    </Link>
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
                  disabled={isSubmitting}
                  className="bg-navy-800/50 border-cyan-400/30 text-slate-100 placeholder:text-slate-400"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="bg-navy-800/50 border-cyan-400/30 text-slate-100 placeholder:text-slate-400"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-accent text-navy-900 font-semibold hover:shadow-cyan-glow"
                size="lg"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Register Link */}
              <div className="text-center pt-4 border-t border-cyan-400/20">
                <p className="text-sm text-slate-300">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    Create one
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
