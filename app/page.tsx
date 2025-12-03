'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { init } from '@instantdb/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '7b67f3b1-46b2-4724-a83d-ae3f6a47b087';
const db = init({ appId: APP_ID });

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = db.useAuth();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen gradient-bg bg-pattern flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl mx-auto px-4">
              <Image
                src="/hand2hand-logo.png"
                alt="Hand 2 Hand Logo"
                width={800}
                height={400}
                className="w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-slate-300 font-medium max-w-3xl mx-auto">
            Mission Management Across the Americas
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-8">
            {/* Feature 1 */}
            <Card className="glass-card border-cyan-400/20 shadow-luxury  transition-all duration-300">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-full flex items-center justify-center shadow-cyan-glow">
                  <svg className="w-10 h-10 text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cyan-400">
                  21 Countries
                </h3>
                <p className="text-slate-400 text-sm">
                  Comprehensive coverage across the Americas
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="glass-card border-cyan-400/20 shadow-luxury  transition-all duration-300">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-full flex items-center justify-center shadow-cyan-glow">
                  <svg className="w-10 h-10 text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cyan-400">
                  Track Groups
                </h3>
                <p className="text-slate-400 text-sm">
                  Monitor mission groups across regions
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="glass-card border-cyan-400/20 shadow-luxury  transition-all duration-300">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-full flex items-center justify-center shadow-cyan-glow">
                  <svg className="w-10 h-10 text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-cyan-400">
                  Personal Notes
                </h3>
                <p className="text-slate-400 text-sm">
                  Save notes synced across devices
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center pt-8">
            <Button asChild size="lg" className="gradient-accent text-navy-900 text-lg px-12 py-6 font-semibold  transition-all duration-300">
              <Link href="/login">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
