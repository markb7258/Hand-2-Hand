'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/instant';
import { COUNTRIES } from '@/lib/countries';
import { id } from '@instantdb/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminPanel() {
  const router = useRouter();
  const { isLoading: authLoading, user } = db.useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'countries' | 'gallery'>('users');
  const [isAdmin, setIsAdmin] = useState(false);

  // Query all data
  const { isLoading, data } = db.useQuery({
    profiles: {},
    countries: {},
    galleryImages: {},
  });

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user && data) {
      const userProfile = data.profiles.find(p => p.email === user.email);
      if (userProfile?.isAdmin) {
        setIsAdmin(true);
      } else {
        router.push('/dashboard');
      }
    }
  }, [authLoading, user, data, router]);

  if (authLoading || isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg bg-pattern">
        <div className="text-lg text-slate-300 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg bg-pattern">
      {/* Header */}
      <header className="glass-morphism shadow-md sticky top-0 z-10 border-b border-cyan-400/20/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <Link href="/dashboard" className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300 text-center sm:text-left touch-manipulation hover:scale-105 transition-transform duration-300">
              ← Hand-to-Hand
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 text-center sm:text-left">Admin Panel</h1>
            <Button
              onClick={() => db.auth.signOut()}
              variant="outline"
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'users' | 'countries' | 'gallery')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8">
            <TabsTrigger value="users" className="text-sm sm:text-base">Users</TabsTrigger>
            <TabsTrigger value="countries" className="text-sm sm:text-base">Countries</TabsTrigger>
            <TabsTrigger value="gallery" className="text-sm sm:text-base">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab profiles={data?.profiles || []} />
          </TabsContent>
          <TabsContent value="countries">
            <CountriesTab countries={data?.countries || []} />
          </TabsContent>
          <TabsContent value="gallery">
            <GalleryTab galleryImages={data?.galleryImages || []} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Users Tab Component
function UsersTab({ profiles }: { profiles: any[] }) {
  const handlePromoteUser = async (profileId: string, currentStatus: boolean) => {
    try {
      await db.transact(
        db.tx.profiles[profileId].update({
          isAdmin: !currentStatus,
        })
      );
      alert('User status updated successfully!');
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Error updating user status');
    }
  };

  return (
    <Card className="border-cyan-400/20/50 glass-card backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">Manage Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-cyan-400/20/20 hover:border-cyan-400/20/40 transition-all duration-300">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-100 truncate text-sm sm:text-base">{profile.email}</div>
                <div className="text-xs sm:text-sm mt-1">
                  {profile.isAdmin ? (
                    <Badge className="bg-primary text-white">Admin</Badge>
                  ) : (
                    <span className="text-slate-300 font-medium">Regular User</span>
                  )}
                </div>
              </div>
              <Button
                onClick={() => handlePromoteUser(profile.id, profile.isAdmin)}
                variant={profile.isAdmin ? 'destructive' : 'default'}
                size="sm"
                className={`w-full sm:w-auto ${!profile.isAdmin ? 'gradient-accent text-white' : ''}`}
              >
                {profile.isAdmin ? 'Remove Admin' : 'Make Admin'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Countries Tab Component
function CountriesTab({ countries }: { countries: any[] }) {
  const [editingCountry, setEditingCountry] = useState<string | null>(null);
  const [population, setPopulation] = useState('');
  const [groups, setGroups] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleEditCountry = (country: any) => {
    setEditingCountry(country.id);
    setPopulation(country.population);
    setGroups(country.groups.toString());
    setPhotoUrl(country.photoUrl || '');
  };

  const handleSaveCountry = async (countryId: string) => {
    try {
      await db.transact(
        db.tx.countries[countryId].update({
          population,
          groups: parseInt(groups),
          photoUrl: photoUrl || undefined,
        })
      );
      setEditingCountry(null);
      alert('Country data updated successfully!');
    } catch (err) {
      console.error('Error updating country:', err);
      alert('Error updating country data');
    }
  };

  // Get all countries including those not yet in DB
  const allCountries = COUNTRIES.map(c => {
    const existing = countries.find(country => country.slug === c.slug);
    return existing || { ...c, groups: 12, photoUrl: '', id: null };
  });

  return (
    <Card className="border-cyan-400/20/50 glass-card backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">Manage Countries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {allCountries.map((country) => (
            <div key={country.slug} className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-cyan-400/20/20 hover:border-cyan-400/20/40 transition-all duration-300">
              {editingCountry === country.id ? (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-3 sm:mb-4">{country.name}</h3>
                  <div className="space-y-2">
                    <Label htmlFor={`pop-${country.slug}`}>Population</Label>
                    <Input
                      id={`pop-${country.slug}`}
                      type="text"
                      value={population}
                      onChange={(e) => setPopulation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`groups-${country.slug}`}>Number of Groups</Label>
                    <Input
                      id={`groups-${country.slug}`}
                      type="number"
                      value={groups}
                      onChange={(e) => setGroups(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`photo-${country.slug}`}>Photo URL</Label>
                    <Input
                      id={`photo-${country.slug}`}
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleSaveCountry(country.id)}
                      className="gradient-accent text-white"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setEditingCountry(null)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-100">{country.name}</h3>
                    <div className="mt-2 space-y-1 text-xs sm:text-sm text-slate-300">
                      <div>Population: <span className="font-bold break-all">{country.population}</span></div>
                      <div>Groups: <span className="font-bold">{country.groups}</span></div>
                      <div>Photo: <span className="font-bold">{country.photoUrl ? 'Set' : 'Not set'}</span></div>
                    </div>
                  </div>
                  {country.id && (
                    <Button
                      onClick={() => handleEditCountry(country)}
                      className="w-full sm:w-auto gradient-accent text-white"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Gallery Tab Component
function GalleryTab({ galleryImages }: { galleryImages: any[] }) {
  const [selectedCountry, setSelectedCountry] = useState<string>(COUNTRIES[0].slug);
  const [imageUrls, setImageUrls] = useState(['', '', '', '', '']);

  const countryImages = galleryImages.filter(img => img.countrySlug === selectedCountry);

  useEffect(() => {
    if (countryImages.length > 0) {
      const urls = countryImages
        .sort((a, b) => a.order - b.order)
        .map(img => img.imageUrl);
      setImageUrls([...urls, ...Array(5 - urls.length).fill('')]);
    } else {
      setImageUrls(['', '', '', '', '']);
    }
  }, [selectedCountry, galleryImages]);

  const handleSaveGallery = async () => {
    try {
      // Delete existing images for this country
      const deleteTransactions = countryImages.map(img => db.tx.galleryImages[img.id].delete());
      if (deleteTransactions.length > 0) {
        await db.transact(deleteTransactions);
      }

      // Create new images
      const createTransactions = imageUrls
        .filter(url => url.trim() !== '')
        .map((url, index) =>
          db.tx.galleryImages[id()].update({
            countrySlug: selectedCountry,
            imageUrl: url,
            order: index + 1,
          })
        );

      if (createTransactions.length > 0) {
        await db.transact(createTransactions);
      }

      alert('Gallery updated successfully!');
    } catch (err) {
      console.error('Error updating gallery:', err);
      alert('Error updating gallery');
    }
  };

  return (
    <Card className="border-cyan-400/20/50 glass-card backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">Manage Gallery Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="country-select">Select Country</Label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger id="country-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.slug} value={country.slug}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`image-${index}`}>
                Image {index + 1} URL
              </Label>
              <Input
                id={`image-${index}`}
                type="text"
                value={url}
                onChange={(e) => {
                  const newUrls = [...imageUrls];
                  newUrls[index] = e.target.value;
                  setImageUrls(newUrls);
                }}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleSaveGallery}
          className="w-full gradient-accent text-white"
          size="lg"
        >
          Save Gallery
        </Button>
      </CardContent>
    </Card>
  );
}
