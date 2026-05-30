import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  console.log("Testing books join...")
  const { data: d1, error: e1 } = await supabase.from('library_items').select('id, books!media_id(*)').limit(1)
  console.log('books', e1 ? e1.message : 'success')

  console.log("Testing podcasts join...")
  const { data: d2, error: e2 } = await supabase.from('library_items').select('id, podcasts!media_id(*)').limit(1)
  console.log('podcasts', e2 ? e2.message : 'success')
  
  console.log("Testing podcasts!media_id(*, podcast_episodes(*)) ...")
  const { data: d3, error: e3 } = await supabase.from('library_items').select('id, podcasts!media_id(*, podcast_episodes(*))').limit(1)
  console.log('podcasts with episodes', e3 ? e3.message : 'success')
}
test()
