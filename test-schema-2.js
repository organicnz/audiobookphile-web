import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data: d1, error: e1 } = await supabase.rpc('get_schema_info') || await supabase.from('library_items').select('id, podcasts!library_item_id(*)').limit(1)
  console.log('podcasts!library_item_id', e1 ? e1.message : 'success')
  
  const { data: d2, error: e2 } = await supabase.from('library_items').select('id, podcasts(*)').limit(1)
  console.log('podcasts(*)', e2 ? e2.message : 'success')
}
test()
