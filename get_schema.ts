import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  
  // Using an introspection query to get tables
  const { data, error } = await supabase.rpc('get_tables');
  if (error) {
      console.log("No RPC get_tables, fetching via rest...");
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
      console.log(await res.json());
  } else {
      console.log(data);
  }
}
run();
