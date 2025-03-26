import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts'; // We'll create this shared file

console.log(`Function "get-matches" up and running!`);

// Define interfaces for expected data structures
interface UserPreference {
  likes: string[] | null;
  hobbies: string[] | null;
  skills: string[] | null;
  // Add other fields if used in matching
}

interface CareerField {
  field_id: string;
  name: string;
  keywords: string[] | null;
  // description: string | null; // Add if matching description
}

interface MatchResult {
  fieldId: string;
  name: string;
  score: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Create Supabase client with Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 2. Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 3. Fetch user preferences
    const { data: prefsData, error: prefsError } = await supabaseClient
      .from<UserPreference>('UserPreferences') // Use interface type
      .select('likes, hobbies, skills')
      .eq('user_id', user.id)
      .single();

    if (prefsError && prefsError.code !== 'PGRST116') { // Allow 'No rows found'
      console.error('Prefs fetch error:', prefsError);
      throw prefsError;
    }
    if (!prefsData) {
       // No preferences saved yet, return empty matches
       return new Response(JSON.stringify({ matches: [] }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       });
    }


    // 4. Fetch all career fields
    const { data: fieldsData, error: fieldsError } = await supabaseClient
      .from<CareerField>('CareerFields') // Use interface type
      .select('field_id, name, keywords');

    if (fieldsError) {
      console.error('Fields fetch error:', fieldsError);
      throw fieldsError;
    }
    if (!fieldsData) {
       return new Response(JSON.stringify({ error: 'Could not load career fields' }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 500,
       });
    }


    // 5. Perform Simple Matching Logic
    const scores: MatchResult[] = [];
    const userTags = new Set<string>(); // Use a Set for efficient lookup

    // Combine user preferences into lowercase tags
    [...(prefsData.likes || []), ...(prefsData.hobbies || []), ...(prefsData.skills || [])].forEach(tag => {
      if (tag) userTags.add(tag.toLowerCase());
    });


    if (userTags.size === 0) {
        // No tags to match against
        return new Response(JSON.stringify({ matches: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    fieldsData.forEach(field => {
      let score = 0;
      const fieldTags = new Set<string>();
      (field.keywords || []).forEach(kw => {
        if (kw) fieldTags.add(kw.toLowerCase());
      });

      // Basic keyword overlap score
      userTags.forEach(userTag => {
        if (fieldTags.has(userTag)) {
          score++;
        }
      });

       // Optional: Add description matching later if needed

      if (score > 0) {
        scores.push({ fieldId: field.field_id, name: field.name, score: score });
      }
    });

    // 6. Sort and return top 3
    scores.sort((a, b) => b.score - a.score);
    const topMatches = scores.slice(0, 3);

    return new Response(JSON.stringify({ matches: topMatches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
