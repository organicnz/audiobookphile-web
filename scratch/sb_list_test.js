const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
  const folder = '25b44a7d-8cea-4479-bb3b-8e218ec8870f';
  const { data, error } = await supabase.storage.from('audio-files').list(folder);
  console.log("Supabase files:", data);
}

test();
