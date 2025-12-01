import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CountryPageClient from './CountryPageClient';

export default function CountryPage({ params }: { params: { country: string } }) {
  // Check authentication
  const user = getCurrentUser();
  
  if (!user || !user.isVerified) {
    redirect('/login');
  }

  return <CountryPageClient userId={user.userId} countrySlug={params.country} />;
}
