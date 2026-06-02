require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
client.from('library_items').select('*, books(*, book_authors(authors(*)), book_series(series(*)))').eq('id', '4cde7fec-da53-4d8e-98e0-7934155b2856').single().then(res => {
  console.log(JSON.stringify(res.data.books.audio_files, null, 2));
});
