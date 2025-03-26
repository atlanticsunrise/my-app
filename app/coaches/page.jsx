// Can use server component, reads searchParams for filtering
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

// Make sure page component accepts searchParams
export default async function CoachesPage({ searchParams }) {
  const supabase = createServerComponentClient({ cookies });
  const fieldIdFilter = searchParams?.fieldId; // Get filter from URL ?fieldId=...

  let query = supabase
    .from('Coaches')
    .select('id, name, bio, photo_url, specialization_ids') // Select fields for list cards
    .eq('is_verified', true); // Only show verified coaches

  // Apply filter if fieldIdFilter exists in the URL
  if (fieldIdFilter) {
    // Use 'cs' (contains) operator for array column
    query = query.cs('specialization_ids', `{${fieldIdFilter}}`);
  }

  query = query.order('name', { ascending: true });

  const { data: coaches, error } = await query;

  if (error) {
    console.error('Error fetching coaches:', error);
    // Handle error display appropriately
  }

  // Optional: Fetch field name if filtering
  let fieldName = '';
  if (fieldIdFilter) {
    const { data: fieldData } = await supabase
      .from('CareerFields')
      .select('name')
      .eq('field_id', fieldIdFilter)
      .single();
    fieldName = fieldData?.name;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {fieldName ? `Find a Coach for ${fieldName}` : 'Find a Career Coach'}
      </h1>
      {error && <p className="text-red-500 mb-4">Error loading coaches: {error.message}</p>}

      {!error && coaches && coaches.length === 0 ? (
         <p>No coaches found {fieldName ? `for ${fieldName}` : ''}.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches?.map((coach) => (
            <div key={coach.id} className="border rounded-lg shadow p-4 flex flex-col">
              <img
                  src={coach.photo_url || 'https://via.placeholder.com/100'} // Default image
                  alt={`Photo of ${coach.name}`}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h2 className="text-xl font-semibold text-center mb-2">{coach.name}</h2>
              <p className="text-sm text-gray-600 text-center mb-4 line-clamp-3 flex-grow">{coach.bio}</p>
               {/* Optional: Display specializations */}
               {/* <p className="text-xs text-center text-gray-500 mb-4">Specializes in: {coach.specialization_ids.join(', ')}</p> */}
               <Link
                href={`/coaches/${coach.id}`}
                className="mt-auto text-center bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full"
               >
                 View Profile & Schedule
               </Link>
            </div>
          ))}
        </div>
      )}
       {fieldIdFilter && (
         <div className="mt-6">
           <Link href="/coaches" className="text-blue-500 hover:underline">
             View all coaches
           </Link>
         </div>
       )}
    </div>
  );
}
