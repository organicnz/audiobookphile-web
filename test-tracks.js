import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase
    .from('library_items')
    .select('id, title, books!media_id(id, title, audio_files)')
    .limit(5)

  if (error) { console.error(error.message); return }
  
  data.forEach(item => {
    const book = Array.isArray(item.books) ? item.books[0] : item.books
    const audioFiles = book?.audio_files || []
    console.log(`Item: ${item.title}`)
    console.log(`  Book: ${book?.title}`)
    console.log(`  audio_files type: ${typeof audioFiles}, isArray: ${Array.isArray(audioFiles)}, length: ${audioFiles.length}`)
    if (audioFiles.length > 0) {
      console.log(`  First audio file keys: ${Object.keys(audioFiles[0]).join(', ')}`)
      console.log(`  Has metadata: ${!!audioFiles[0].metadata}`)
    }
    console.log()
  })
}
test()
