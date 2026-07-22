const { createClient } = require('@supabase/supabase-js')
const supabase = createClient('https://iambzzclljayqdxkeepy.supabase.co', process.env.SUPABASE_SERVICE_KEY)
async function run() {
  const { data } = await supabase.from('library_items').select('id, cover_path').limit(5)
  console.log(data)
}
run()
