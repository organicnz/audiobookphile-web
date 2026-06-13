import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  const { data, error } = await supabase
    .from('library_items')
    .select('id, title, media_type, media_id')
    .ilike('title', '%Three%Body%')
    
  console.log("ITEMS", data)

  const { data: bdata } = await supabase
    .from('books')
    .select('id, title, duration, audio_files')
    .ilike('title', '%Three%Body%')
    
  console.log("BOOKS", JSON.stringify(bdata, null, 2))
}
main()
