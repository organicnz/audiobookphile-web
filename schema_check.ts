import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  
  const { data, error } = await supabase.from('audio_files').select('*').limit(1);
  if (error) {
      console.log("Error querying audio_files:", error.message);
  } else {
      console.log("Audio files structure:", data);
  }
}
run();
