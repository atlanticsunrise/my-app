'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

export default function MatchResultsPage() {
  const { user, loading: authLoading, session } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && session) { // Need session for the Authorization header
      setLoading(true);
      setError(null);

      // Fetch matches by invoking the Edge Function
      supabase.functions.invoke('get-matches', {
        headers: {
           // Pass the auth token to the function
           Authorization: `Bearer ${session.access_token}`,
        }
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error invoking get-matches:", error);
          throw new Error(error.message || 'Failed to get matches');
        }
        if (data && data.matches) {
          setMatches(data.matches);
        } else {
          // Handle case where function returns unexpected data
          setMatches([]);
          console.warn("Received unexpected data from get-matches:", data);
        }
      })
      .catch(err => {
        setError(err.message);
        setMatches([]); // Clear matches on error
      })
      .finally(() => {
        setLoading(false);
      });
    } else if (!authLoading && !session) {
        // Handle case where user exists but session somehow doesn't (shouldn't happen often)
        setLoading(false);
        setError("Not properly authenticated to fetch matches.");
    }

  }, [user, authLoading, session, router]);


  if (authLoading || loading) return <div>Loading your matches...</div>;
  if (!user) return null; // Redirect handled in useEffect

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Top Career Matches</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {!error && matches.length === 0 && !loading && (
        <p className="mb-4">No matches found yet. Make sure you've saved some preferences!</p>
      )}

      {!error && matches.length > 0 && (
         <div className="space-y-4">
           {matches.map((match, index) => (
             <div key={match.fieldId} className="p-4 border rounded shadow bg-white">
               <div className="flex justify-between items-start">
                 <div>
                   <span className="text-sm font-bold text-indigo-600">Match #{index + 1} (Score: {match.score})</span>
                   <h2 className="text-2xl font-semibold mt-1">{match.name}</h2>
                 </div>
                 <div className="space-x-2 flex-shrink-0 mt-1">
                    <Link
                        href={`/career-fields/${match.fieldId}`}
                        className="text-sm bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                    >
                        Explore Field
                    </Link>
                    <Link
                        href={`/coaches?fieldId=${match.fieldId}`}
                        className="text-sm bg-teal-500 hover:bg-teal-700 text-white font-bold py-1 px-3 rounded"
                    >
                        Find Coaches
                    </Link>
                 </div>
               </div>
             </div>
           ))}
         </div>
      )}

       <div className="mt-6 space-x-4">
          <Link href="/preferences" className="text-blue-500 hover:underline">
            Update Preferences
          </Link>
           <Link href="/career-fields" className="text-purple-500 hover:underline">
            Explore All Fields
          </Link>
       </div>
    </div>
  );
}
