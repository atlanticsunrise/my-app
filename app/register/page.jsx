'use client';

import { useState } from 'react';
import { useRouter, Link } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Add fields for Name if needed in your User Profile later
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        // options: { data: { name: 'User Name' } } // Add extra data if needed
      });
      if (error) throw error;

      // Check if email confirmation is required (based on Supabase settings)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
         setMessage('Signup successful, but please check your email to confirm your account!');
         // Don't redirect immediately, let them know to check email
      } else if (data.session) {
         // If no confirmation needed or user already confirmed & logged in
         setMessage('Signup successful! Redirecting...');
         // Force refresh to update auth state and redirect
         router.push('/dashboard');
         router.refresh();
      } else {
         // Should ideally not happen if confirmation is off, but good fallback
         setMessage('Signup successful! Please log in.');
         router.push('/login');
      }

    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleRegister}>
        {/* Add Name input if collecting it */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
        <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-500 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
