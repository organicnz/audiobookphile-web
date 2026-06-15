import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// To delete, we need service role key, but if RLS allows delete for auth users, maybe we can delete.
// Let's use the service role key if available.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function clean() {
  const { data, error } = await supabase.storage.from('audio-files').list()
  if (error) {
    console.log('List error:', error)
    return
  }
  
  if (!data || data.length === 0) {
    console.log('Bucket is empty.')
    return
  }
  
  console.log(`Found ${data.length} items at root.`)
  for (const item of data) {
    console.log(`- ${item.name} (isFolder: ${!item.id})`)
  }
}
clean()
