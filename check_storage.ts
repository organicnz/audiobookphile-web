import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  
  const { data, error } = await supabase.storage.listBuckets();
  console.log("BUCKETS:", data);
  if (data) {
      for (const b of data) {
          const { data: files } = await supabase.storage.from(b.name).list();
          console.log(`FILES IN ${b.name}:`, files);
      }
  }
}
run();
