'use client'; // Need client hooks for auth check

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in after loading
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state or placeholder if auth is still loading
  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  // If user is null after loading, the redirect should have happened,
  // but rendering null prevents brief flashing of content.
  if (!user) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.email}!</h1>
      <p className="mb-6">What would you like to do today?</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/preferences" className="p-4 bg-blue-100 hover:bg-blue-200 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Update My Preferences</h2>
          <p>Tell us what you like to get career matches.</p>
        </Link>
        <Link href="/my-matches" className="p-4 bg-green-100 hover:bg-green-200 rounded shadow">
          <h2 className="font-bold text-lg mb-2">View My Career Matches</h2>
          <p>See the careers that might suit you.</p>
        </Link>
        <Link href="/career-fields" className="p-4 bg-purple-100 hover:bg-purple-200 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Explore Career Fields</h2>
          <p>Browse all available career paths.</p>
        </Link>
        <Link href="/coaches" className="p-4 bg-yellow-100 hover:bg-yellow-200 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Find a Career Coach</h2>
          <p>Connect with a guide for your chosen field.</p>
        </Link>
         {/* Add My Appointments link later */}
      </div>
    </div>
  );
}
