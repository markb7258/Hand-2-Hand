'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { init } from '@instantdb/react';
import { COUNTRIES, DEFAULT_GROUPS } from '@/lib/countries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { logoutUser } from '@/app/actions/auth';

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || 'fd93719b-b44d-4edf-a070-819097ba20a3';
const db = init({ appId: APP_ID });

interface CountryPageClientProps {
  userId: string;
  countrySlug: string;
}

export default function CountryPageClient({ userId, countrySlug }: CountryPageClientProps) {
  const router = useRouter();
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Find the country data
  const country = COUNTRIES.find(c => c.slug === countrySlug);

  // Query country data and user notes
  const { isLoading, error, data } = db.useQuery({
    countries: {
      $: { where: { slug: countrySlug } }
    },
    notes: {
      $: { where: { userId, countrySlug } }
    },
    galleryImages: {
      $: { where: { countrySlug } }
    }
  });

  // Load existing note
  useEffect(() => {
    if (data && data.notes && data.notes.length > 0) {
      setNoteContent(data.notes[0].content);
    }
  }, [data]);

  // Initialize country data if doesn't exist
  useEffect(() => {
    const initCountryData = async () => {
      if (!country || isLoading) return;
      
      if (data && data.countries.length === 0) {
        // Create country data
        const countryId = crypto.randomUUID();
        await db.transact([
          db.tx.countries[countryId].update({
            name: country.name,
            slug: country.slug,
            population: country.population,
            groups: DEFAULT_GROUPS,
            flag: country.flag,
          })
        ]);
        
        // Create demo gallery images
        const imagePromises = [];
        for (let i = 1; i <= 5; i++) {
          const imageId = crypto.randomUUID();
          imagePromises.push(
            db.transact([
              db.tx.galleryImages[imageId].update({
                countrySlug: country.slug,
                imageUrl: `/demo-images/placeholder-${i}.jpg`,
                order: i,
              })
            ])
          );
        }
        await Promise.all(imagePromises);
      }
    };
    
    initCountryData();
  }, [country, isLoading, data]);

  const handleSaveNote = async () => {
    setIsSaving(true);
    setSaveStatus('');
    
    try {
      // Check if note exists
      const existingNote = data?.notes[0];
      
      if (existingNote) {
        // Update existing note
        await db.transact([
          db.tx.notes[existingNote.id].update({
            content: noteContent,
            updatedAt: Date.now(),
          })
        ]);
      } else {
        // Create new note
        const noteId = crypto.randomUUID();
        await db.transact([
          db.tx.notes[noteId].update({
            userId,
            countrySlug,
            content: noteContent,
            updatedAt: Date.now(),
          })
        ]);
      }
      
      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Error saving note:', err);
      setSaveStatus('Error saving note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  if (!country) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg bg-pattern">
        <div className="text-xl text-red-300 mb-4">Country not found</div>
        <Link href="/dashboard" className="text-accent-600 hover:text-slate-300 font-medium">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg bg-pattern">
        <div className="text-lg text-slate-300 animate-pulse">Loading...</div>
      </div>
    );
  }

  const countryData = data?.countries[0] || {
    population: country.population,
    groups: DEFAULT_GROUPS,
    photoUrl: '',
    countryDetails: '',
    primaryContacts: '',
    adminNotes: '',
  };
  
  const galleryImages = data?.galleryImages?.filter(img => img.imageUrl && !img.imageUrl.includes('placeholder')) || [];

  // Slideshow navigation
  const nextImage = () => {
    if (galleryImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }
  };

  const prevImage = () => {
    if (galleryImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  return (
    <div className="min-h-screen gradient-bg bg-pattern">
      {/* Header */}
      <header className="glass-morphism shadow-md sticky top-0 z-10 border-b border-cyan-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <Link href="/dashboard" className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300 text-center sm:text-left touch-manipulation hover:scale-105 transition-all duration-300">
              ← Hand 2 Hand
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-400 rounded-full flex items-center justify-center text-4xl shadow-cyan-glow border-2 border-cyan-300">
            {country.flag}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 drop-shadow-lg animate-fade-in">{country.name}</h1>
        </div>

        {/* Map / Photo Section */}
        <Card className="mb-6 sm:mb-8 animate-slide-up border-cyan-400/20 glass-card backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-cyan-400">Place for Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center border-2 border-cyan-400/30 overflow-hidden">
              {countryData.photoUrl ? (
                <img src={countryData.photoUrl} alt={country.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-300 text-sm sm:text-lg text-center px-4 font-medium">Map / Photo - Admin will upload</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mb-6 sm:mb-8 animate-slide-up border-cyan-400/20 glass-card backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-cyan-400">Country Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-6 rounded-xl border-2 border-primary/20 shadow-lg transform hover:scale-105 transition-all duration-300">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Population</h3>
                <p className="text-2xl sm:text-3xl font-bold text-slate-100">{countryData.population}</p>
              </div>
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 p-4 sm:p-6 rounded-xl border-2 border-accent/20 shadow-lg transform hover:scale-105 transition-all duration-300">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Number of Groups</h3>
                <p className="text-2xl sm:text-3xl font-bold text-slate-100">{countryData.groups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Country Details Section */}
        <Card className="mb-6 sm:mb-8 animate-slide-up border-cyan-400/20 glass-card backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-cyan-400">Country Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              {countryData.countryDetails ? (
                <div className="text-slate-200 whitespace-pre-wrap">{countryData.countryDetails}</div>
              ) : (
                <div className="text-slate-400 italic">Admin will add country details</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Primary Contacts Section */}
        <Card className="mb-6 sm:mb-8 animate-slide-up border-cyan-400/20 glass-card backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-cyan-400">Primary Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              {countryData.primaryContacts ? (
                <div className="text-slate-200 whitespace-pre-wrap">{countryData.primaryContacts}</div>
              ) : (
                <div className="text-slate-400 italic">Admin will add primary contacts</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Notes Section */}
        <Card className="mb-6 sm:mb-8 animate-slide-up border-cyan-400/20 glass-card backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-cyan-400">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              {countryData.adminNotes ? (
                <div className="text-slate-200 whitespace-pre-wrap">{countryData.adminNotes}</div>
              ) : (
                <div className="text-slate-400 italic">Admin will add notes</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Notes Section */}
        <Card className="mb-6 sm:mb-8 animate-slide-up border-cyan-400/20 glass-card backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-cyan-400">My Personal Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter your personal notes about this country..."
              className="h-48 resize-none bg-white/90"
            />
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Button
                onClick={handleSaveNote}
                disabled={isSaving}
                className="gradient-accent text-navy-900 w-full sm:w-auto"
                size="lg"
              >
                {isSaving ? 'Saving...' : 'Save My Notes'}
              </Button>
              {saveStatus && (
                <Alert className={saveStatus.includes('Error') ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                  {saveStatus}
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gallery Slideshow Section */}
        {galleryImages.length > 0 && (
          <Card className="animate-slide-up border-cyan-400/20 glass-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl text-cyan-400">Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden border-2 border-cyan-400/20 shadow-md">
                {/* Current Image */}
                <img 
                  src={galleryImages[currentImageIndex].imageUrl} 
                  alt={`Gallery ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover"
                />
                
                {/* Previous Arrow */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-navy-900/80 hover:bg-navy-900 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Next Arrow */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-navy-900/80 hover:bg-navy-900 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-navy-900/80 text-cyan-400 px-4 py-2 rounded-full text-sm font-semibold">
                  {currentImageIndex + 1} / {galleryImages.length}
                </div>
              </div>
              
              {/* Thumbnail Navigation */}
              <div className="mt-4 flex gap-2 justify-center flex-wrap">
                {galleryImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'border-cyan-400 scale-110' 
                        : 'border-cyan-400/30 hover:border-cyan-400/60'
                    }`}
                  >
                    <img src={img.imageUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
