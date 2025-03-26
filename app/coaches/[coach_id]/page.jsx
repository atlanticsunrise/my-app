import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getCoachDetails(coachId) {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase
    .from('Coaches')
    .select(`
        *,
        CareerFields ( name, field_id )
     `) // Select all coach fields
    .eq('id', coachId)
    .eq('is_verified', true) // Ensure only verified coaches are shown
    .single();

    // Note: The CareerFields part above won't work directly like this without setting up relationships
    // or doing a secondary query. Let's fetch specialization names separately.

  if (error || !data) {
    console.error('Error fetching coach details:', error);
    notFound();
  }

   // Fetch names for specialization IDs separately
  if (data.specialization_ids && data.specialization_ids.length > 0) {
      const { data: fieldsData, error: fieldError } = await supabase
          .from('CareerFields')
          .select('name, field_id')
          .in('field_id', data.specialization_ids);

      if (!fieldError) {
          data.specializations = fieldsData; // Add names to coach object
      }
  }


  return data;
}

export default async function CoachDetailPage({ params }) {
  const coachId = params.coach_id;
  const coach = await getCoachDetails(coachId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
         <img
            src={coach.photo_url || 'https://via.placeholder.com/150'}
            alt={`Photo of ${coach.name}`}
            className="w-40 h-40 rounded-full object-cover flex-shrink-0"
         />
         <div>
            <h1 className="text-4xl font-bold mb-2">{coach.name}</h1>
             {/* Display specialization names */}
             {coach.specializations && coach.specializations.length > 0 && (
               <p className="text-md text-gray-600 mb-4">
                 Specializes in: {coach.specializations.map(spec => spec.name).join(', ')}
               </p>
             )}
            <p className="text-gray-700">{coach.bio}</p>
         </div>
      </div>

      {/* --- Scheduling Section --- */}
      <div className="bg-gray-100 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Schedule a Session</h2>
        {coach.calendly_link ? (
          <div>
            <p className="mb-4">Click the link below to view {coach.name}'s availability and book a session via Calendly.</p>
            <a
              href={coach.calendly_link}
              target="_blank" // Open in new tab
              rel="noopener noreferrer" // Security measure
              className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Book on Calendly
            </a>
          </div>
        ) : (
          <p>Scheduling information is currently unavailable for this coach.</p>
        )}
      </div>


       <div className="mt-8">
         <Link href="/coaches" className="text-blue-500 hover:underline">
            ← Back to all coaches
         </Link>
       </div>
    </div>
  );
}