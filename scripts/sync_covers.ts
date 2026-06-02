import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import readline from 'readline'
import { fetchBookMetadata } from '../supabase/functions/_shared/coverFetch.ts'

const envPath = path.resolve(process.cwd(), ".env.local")
dotenv.config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, anonKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => new Promise((resolve) => rl.question(query, resolve))

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function run() {
  console.log("=== Automated Cover Sync & Fetch ===")
  const email = await question('Enter your Supabase Email: ')
  const password = await question('Enter your Supabase Password: ')

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError || !authData?.user) {
    console.error("Login failed:", authError?.message)
    process.exit(1)
  }

  const token = authData.session.access_token
  console.log("Login successful! Fetching library items...")

  const { data: items, error: itemsError } = await supabase
    .from('library_items')
    .select('id, cover_path, books(cover_path, title, author_names)')
  
  if (itemsError) {
    console.error("Failed to fetch library items:", itemsError.message)
    process.exit(1)
  }

  let successLocalCount = 0
  let successFetchCount = 0
  let missingCount = 0
  let errorCount = 0

  for (const item of items) {
    let legacyPath = item.cover_path
    let title = ""
    let author = ""
    
    // Normalize nested books fields
    if (item.books) {
       const book = Array.isArray(item.books) ? item.books[0] : item.books
       if (book) {
         if (!legacyPath) legacyPath = book.cover_path
         title = book.title
         // author_names is array
         if (book.author_names && Array.isArray(book.author_names) && book.author_names.length > 0) {
             author = book.author_names[0]
         }
       }
    }
    
    // Skip if it already looks like a supabase storage path (no leading slash and has ID)
    if (legacyPath && !legacyPath.startsWith('/')) {
        continue
    }

    let fileData: Uint8Array | null = null
    let ext = 'jpg'
    let source = ''

    if (legacyPath && legacyPath.startsWith('/')) {
      const localPath = legacyPath.replace(/^\/audiobooks/, '../audiobookshelf/audiobooks')
      const absPath = path.resolve(process.cwd(), localPath)
      
      if (fs.existsSync(absPath)) {
         try {
           fileData = fs.readFileSync(absPath)
           ext = path.extname(absPath).slice(1) || 'jpg'
           source = 'local'
         } catch (e) {
           console.warn(`Could not read local file ${absPath}: ${e.message}`)
         }
      }
    }

    if (!fileData && title) {
       console.log(`\nFetching cover for: "${title}" by ${author}...`)
       try {
           // Throttle slightly
           await sleep(1500)
           const result = await fetchBookMetadata(title, author)
           if (result && result.cover && result.cover.buffer) {
               fileData = new Uint8Array(result.cover.buffer)
               ext = result.cover.extension || 'jpg'
               source = 'api'
               console.log(` -> Found cover via API!`)
           } else {
               console.log(` -> No cover found for this item.`)
           }
       } catch(e) {
           console.warn(` -> Fetch failed: ${e.message}`)
       }
    }

    if (fileData) {
        try {
          const blob = new Blob([fileData], { type: `image/${ext === 'png' ? 'png' : 'jpeg'}` })
          const formData = new FormData()
          formData.append('cover', blob, `cover.${ext}`)
          
          process.stdout.write(`Uploading ${source} cover for item ${item.id}... `)
          const res = await fetch(`${supabaseUrl}/functions/v1/api/items/${item.id}/cover`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          })
          
          if (res.ok) {
            console.log("✅")
            if (source === 'local') successLocalCount++
            else successFetchCount++
          } else {
            console.log(`❌ (${res.statusText})`)
            errorCount++
          }
        } catch (e) {
          console.log(`❌ (${e.message})`)
          errorCount++
        }
    } else {
        missingCount++
    }
  }

  console.log(`\n=== Done! ===`)
  console.log(`Local Covers Migrated: ${successLocalCount}`)
  console.log(`New Covers Fetched: ${successFetchCount}`)
  console.log(`Still Missing: ${missingCount}`)
  console.log(`Errors: ${errorCount}`)
  
  process.exit(0)
}

run()
