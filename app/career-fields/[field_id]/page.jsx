import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation'; // Import notFound

async function getFieldDetails(fieldId) {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase
    .from('CareerFields')
    .select('*') // Select all details for this page
    .eq('field_id', fieldId)
    .single(); // Expect only one

  if (error || !data) {
    console.error('Error fetching field details:', error);
    notFound(); // Trigger 404 if not found or error
  }
  return data;
}

// Props passed to page include 'params' which contains route segments
export default async function FieldDetailPage({ params }) {
  const fieldId = params.field_id; // Get the ID from the URL
  const field = await getFieldDetails(fieldId);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">{field.name}</h1>
      <p className="text-lg mb-6">{field.description}</p>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Keywords:</h3>
        <div className="flex flex-wrap gap-2">
          {field.keywords?.map((kw) => (
            <span key={kw} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Typical Roles:</h3>
        <p>{field.typical_roles}</p>
      </div>

      {/* Add sections for Education Info, Salary Info later */}

      <div className="mt-8">
        <Link
          href={`/coaches?fieldId=${field.field_id}`} // Link to coaches page, pre-filtered
          className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
        >
          Find Coaches for {field.name}
        </Link>
      </div>

       <div className="mt-4">
         <Link href="/career-fields" className="text-blue-500 hover:underline">
            ← Back to all fields
         </Link>
       </div>
    </div>
  );
}
