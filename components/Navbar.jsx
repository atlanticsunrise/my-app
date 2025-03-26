'use client'; // Uses client hooks like useAuth

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider'; // Use the custom hook
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, signOut, loading } = useAuth(); // Get user and signOut from context
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      // No need to push, AuthProvider state change will trigger re-renders/redirects
      router.push('/'); // Go to home page after logout
      router.refresh(); // Refresh server components
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Don't render navbar content until auth state is loaded
  if (loading) {
    return (
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">CareerConnect</Link>
          <div>Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold">CareerConnect</Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
              <Link href="/preferences" className="hover:text-gray-300">Preferences</Link>
              <Link href="/my-matches" className="hover:text-gray-300">My Matches</Link>
              <Link href="/career-fields" className="hover:text-gray-300">Careers</Link>
              <Link href="/coaches" className="hover:text-gray-300">Coaches</Link>
              {/* Add Profile link later */}
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 px-3 py-1 rounded">
                Logout
              </button>
              <span className="text-sm text-gray-400">({user.email})</span>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">Login</Link>
              <Link href="/register" className="hover:text-gray-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
