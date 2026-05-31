import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })

import { createClient } from '@supabase/supabase-js'

async function test() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars')
    return
  }

  const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)
  
  const { data: cols } = await supabase.rpc('get_columns_for_table', { table_name: 'library_items' })
  console.log('library_items columns:', cols)
}

test()
