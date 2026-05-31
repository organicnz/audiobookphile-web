import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })

import { createClient } from '@supabase/supabase-js'

async function test() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
  
  const { data, error } = await supabase
      .from('library_items')
      .select('*, books(*, book_authors(authors(*)), book_series(series(*)))')
      .limit(1)
      
  console.log('Error 1:', error?.message)

  const { data: data2, error: error2 } = await supabase
      .from('library_items')
      .select('*, book_authors(authors(*)), book_series(series(*))')
      .limit(1)
      
  console.log('Error 2:', error2?.message)
}

test()
