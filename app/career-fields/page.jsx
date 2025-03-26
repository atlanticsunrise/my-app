// Use server component for initial data fetching
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

// Function to fetch data on the server
async function getCareerFields() {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase
    .from('CareerFields')
    .select('field_id, name, description') // Select only needed fields for list
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching career fields:', error);
    return []; // Return empty array on error
  }
  return data;
}

export default async function CareerFieldsPage() {
  const fields = await getCareerFields();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explore Career Fields</h1>
      {fields.length === 0 ? (
        <p>No career fields found. Check database connection or seeding.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => (
            <Link
              key={field.field_id}
              href={`/career-fields/${field.field_id}`}
              className="block p-4 border rounded shadow hover:bg-gray-100"
            >
              <h2 className="text-xl font-semibold mb-2">{field.name}</h2>
              <p className="text-sm text-gray-600 line-clamp-3">{field.description}</p> {/* Truncate description */}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Optional: Add revalidation if data changes often
// export const revalidate = 60; // Revalidate data every 60 seconds
