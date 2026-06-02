import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  // Let's just select the first book directly from the books table
  const { data, error } = await supabase
    .from('books')
    .select('id, title, chapters')
    .limit(1)

  if (error) { console.error(error.message); return }
  
  data.forEach(book => {
    console.log(`Book: ${book?.title}`)
    console.log(`Chapters:`, JSON.stringify(book?.chapters, null, 2))
  })
}
test()
