'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { COUNTRIES } from '@/lib/countries';
import { init } from '@instantdb/react';

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '7b67f3b1-46b2-4724-a83d-ae3f6a47b087';
const ADMIN_EMAIL = 'ericreiss@aol.com';
const db = init({ appId: APP_ID });

export default function DashboardClient() {
  const router = useRouter();
  const [countries, setCountries] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Get authenticated user (InstantDB auth only)
  const { user, isLoading } = db.useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Fetch countries and profile from API
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch countries
        const countriesRes = await fetch('/api/countries');
        const countriesData = await countriesRes.json();
        
        // Fetch user profile
        const profileRes = await fetch(`/api/profiles?userId=${user.id}`);
        const profileData = await profileRes.json();

        setCountries(countriesData.countries || []);
        setProfile(profileData.profile);
        
        // Create profile if doesn't exist
        if (!profileData.profile) {
          const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          const createRes = await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              displayName: user.email?.split('@')[0] || 'User',
              isAdmin: isAdminUser
            })
          });
          const created = await createRes.json();
          setProfile(created.profile);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    db.auth.signOut();
    router.push('/');
  };
  
  const isAdmin = profile?.isAdmin || false;
  
  // Merge static + DB, unique by slug (prefer DB for name/flag overrides)
  const map = new Map<string, any>();
  for (const c of COUNTRIES) map.set(c.slug, c);
  for (const c of countries) map.set(c.slug, { ...map.get(c.slug), ...c });
  const merged = Array.from(map.values());

  if (isLoading || !user || dataLoading) {
    return (
      <div className="min-h-screen gradient-bg bg-pattern flex items-center justify-center">
        <div className="text-lg text-slate-300 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg bg-pattern">
      {/* Header */}
      <header className="glass-morphism shadow-cyan-glow sticky top-0 z-10 border-b border-cyan-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300 text-center sm:text-left">
              Hand 2 Hand
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-slate-300 truncate max-w-full px-2 sm:px-0">{user.email}</span>
              <div className="flex gap-2 w-full sm:w-auto">
                {isAdmin && (
                  <Button
                    onClick={() => router.push('/admin')}
                    variant="default"
                    size="sm"
                    className="flex-1 sm:flex-none gradient-accent text-navy-900 font-semibold hover:shadow-cyan-glow"
                  >
                    Admin Panel
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-3 sm:mb-4 px-4">Select a Country</h2>
          <p className="text-base sm:text-lg text-slate-300 px-4">Choose a country to view details and manage your notes</p>
        </div>

        {/* Country Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {merged.map((country) => (
            <Link
              key={country.slug}
              href={`/dashboard/${country.slug}`}
              className="block"
            >
              <Card className="group hover:shadow-cyan-glow transition-all duration-300 p-6 flex flex-col items-center justify-center space-y-3 hover:-translate-y-1 touch-manipulation min-h-[160px] sm:min-h-[180px] border-cyan-400/20 glass-card">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-cyan-glow border-2 border-cyan-300">
                  {country.flag || '🏳️'}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-100 text-center px-2">
                  {country.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">Tap to view details</p>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
