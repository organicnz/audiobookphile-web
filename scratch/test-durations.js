import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: books, error: bookErr } = await supabase.from('books').select('*').limit(1);
  if (books && books.length > 0) console.log('books columns:', Object.keys(books[0]));
  else console.log('No books found or error:', bookErr?.message);
  
  const { data: items, error: itemErr } = await supabase.from('library_items').select('*').limit(1);
  if (items && items.length > 0) console.log('library_items columns:', Object.keys(items[0]));
  else console.log('No library_items found or error:', itemErr?.message);
}

run();
