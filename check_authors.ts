import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(supabaseUrl, serviceKey)

async function check() {
  const { data, error } = await supabase.from('authors').select('id, name, image_path')
  if (error) console.error(error)
  console.log('Total authors:', data?.length)
  console.log('Missing image path:', data?.filter((a) => a.image_path === 'missing').length)
  console.log('Valid image path:', data?.filter((a) => a.image_path && a.image_path !== 'missing').length)
  console.log('Null image path:', data?.filter((a) => !a.image_path).length)
}
check()
