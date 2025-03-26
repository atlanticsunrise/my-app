'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

// Example tags - you might fetch these or define them elsewhere
const allSkills = ['Problem Solving', 'Teamwork', 'Coding', 'Writing', 'Drawing', 'Building', 'Talking', 'Math'];
const allInterests = ['Computers', 'Art', 'Nature', 'Helping People', 'Business', 'Science', 'Music', 'Sports'];

export default function PreferencesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [hobbies, setHobbies] = useState(''); // Simple text for now
  const [skills, setSkills] = useState([]);
  const [workStyles, setWorkStyles] = useState([]); // Example work styles
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      // Fetch existing preferences
      const fetchPreferences = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('UserPreferences')
          .select('*')
          .eq('user_id', user.id)
          .single(); // Expect only one row per user

        if (data) {
          setLikes(data.likes || []);
          setDislikes(data.dislikes || []);
          setHobbies(data.hobbies ? data.hobbies.join(', ') : ''); // Join array back to string for text input
          setSkills(data.skills || []);
          setWorkStyles(data.work_styles || []);
        } else if (error && error.code !== 'PGRST116') { // Ignore 'No rows found' error
          console.error('Error fetching preferences:', error);
          setMessage(`Error loading preferences: ${error.message}`);
        }
        setLoading(false);
      };
      fetchPreferences();
    }
  }, [user, authLoading, router]);

  const handleCheckboxChange = (setter, value) => {
    setter(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage('');
    const preferencesData = {
      user_id: user.id,
      likes: likes,
      dislikes: dislikes,
      // Split hobbies string back into array, trimming whitespace
      hobbies: hobbies.split(',').map(h => h.trim()).filter(h => h),
      skills: skills,
      work_styles: workStyles,
      // Supabase automatically adds 'created_at', 'id'
    };

    // Upsert: Insert if no row exists for user, update if it does
    const { error } = await supabase
      .from('UserPreferences')
      .upsert(preferencesData, { onConflict: 'user_id' }); // Use user_id as the conflict target

    if (error) {
      console.error("Error saving preferences:", error);
      setMessage(`Error saving: ${error.message}`);
    } else {
      setMessage('Preferences saved successfully!');
      // Optional: Redirect after save
      // router.push('/my-matches');
    }
    setSaving(false);
  };

  if (authLoading || loading) return <div>Loading preferences...</div>;
  if (!user) return null; // Should be redirected

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Preferences</h1>
      <p className="mb-4">Help us understand what you enjoy and what you're good at!</p>
      <form onSubmit={handleSubmit}>

        {/* Interests/Likes */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">What kind of things do you LIKE?</h3>
          <div className="flex flex-wrap gap-2">
            {allInterests.map(interest => (
              <label key={interest} className="flex items-center space-x-2 p-2 border rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={likes.includes(interest)}
                  onChange={() => handleCheckboxChange(setLikes, interest)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>{interest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">What SKILLS do you have or want to use?</h3>
           <div className="flex flex-wrap gap-2">
            {allSkills.map(skill => (
              <label key={skill} className="flex items-center space-x-2 p-2 border rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={skills.includes(skill)}
                  onChange={() => handleCheckboxChange(setSkills, skill)}
                  className="form-checkbox h-5 w-5 text-green-600"
                />
                <span>{skill}</span>
              </label>
            ))}
          </div>
        </div>

         {/* Hobbies (Text Input) */}
         <div className="mb-6">
            <label htmlFor="hobbies" className="block text-lg font-semibold mb-2">What are your HOBBIES? (Separate with commas)</label>
            <input
                type="text"
                id="hobbies"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                placeholder="e.g., Reading, Video Games, Hiking"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
         </div>

        {/* Add similar sections for Dislikes, Work Styles if needed */}

        {message && <p className={`mb-4 ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}
