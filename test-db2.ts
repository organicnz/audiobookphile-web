import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })

import { createClient } from '@supabase/supabase-js'

async function test() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl!, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey!)
  
  const { data: items } = await supabase.from('library_items').select('*').limit(1)
  console.log('library_items:', items?.[0])

  const { data: progress } = await supabase.from('media_progress').select('*').limit(1)
  console.log('media_progress:', progress?.[0])
}

test()
