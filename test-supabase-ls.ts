import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase.storage.from('audio-files').list('e8fe3c3e-cf0c-4908-8d47-7e4b9ff1ab09')
  console.log(error || data)
}
run()
