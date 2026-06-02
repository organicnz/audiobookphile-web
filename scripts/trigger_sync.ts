import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import readline from 'readline'

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

async function run() {
  console.log("=== Edge Function Cover Sync Trigger ===")
  const email = await question('Enter your Supabase Email: ')
  const password = await question('Enter your Supabase Password: ')

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError || !authData?.user) {
    console.error("Login failed:", authError?.message)
    process.exit(1)
  }

  const token = authData.session.access_token
  console.log("Login successful! Starting sync batches...")

  let remaining = 1
  let totalProcessed = 0
  
  while (remaining > 0) {
    console.log(`Sending batch request...`)
    const res = await fetch(`${supabaseUrl}/functions/v1/sync-covers?limit=10`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!res.ok) {
       console.error(`Edge function error: ${res.statusText}`)
       const errBody = await res.text()
       console.error(errBody)
       break
    }
    
    const data = await res.json()
    console.log(`Processed ${data.processed}. Success: ${data.successCount}, Not Found: ${data.notFoundCount}, Errors: ${data.errorCount}`)
    remaining = data.remaining || 0
    totalProcessed += data.processed
    
    if (remaining > 0) {
      console.log(`Waiting 2 seconds before next batch... (${remaining} remaining in DB)`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  
  console.log(`\n=== All Done! ===`)
  console.log(`Total batches processed: ${totalProcessed}`)
  process.exit(0)
}

run()
