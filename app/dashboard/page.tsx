import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { init } from '@instantdb/admin';
import DashboardClient from './DashboardClient';

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || 'fd93719b-b44d-4edf-a070-819097ba20a3';
const ADMIN_SECRET = process.env.INSTANT_APP_SECRET || 'db4b4adc-6730-4a81-9ec8-8da0b4699775';

const db = init({ appId: APP_ID, adminToken: ADMIN_SECRET });

export default async function Dashboard() {
  // Check authentication
  const user = getCurrentUser();
  
  if (!user || !user.isVerified) {
    redirect('/login');
  }

  // Fetch user profile
  const { profiles } = await db.query({
    profiles: {
      $: { where: { email: user.email } }
    }
  });

  const userProfile = profiles && profiles.length > 0 ? profiles[0] : null;

  if (!userProfile) {
    redirect('/login');
  }

  return <DashboardClient user={user} isAdmin={userProfile.isAdmin} />;
}
