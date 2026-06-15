import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@audiobookphile.com',
    password: 'password123'
  })
  if (authError) {
    console.log("Auth error:", authError)
    // fallback to just anon key
  }
  const token = session?.access_token || supabaseKey
  
  const presignUrl = `${supabaseUrl}/functions/v1/upload-presign`
  const presignRes = await fetch(presignUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ filename: 'test-folder/test.mp3', contentType: 'audio/mpeg', size: 1024 })
  })
  if (!presignRes.ok) {
    console.log('Presign failed:', await presignRes.text())
    return
  }
  const { url } = await presignRes.json()
  
  const uploadRes = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'audio/mpeg', 'x-upsert': 'true' },
    body: 'hello world'
  })
  
  console.log('Upload status:', uploadRes.status)
  console.log('Upload response:', await uploadRes.text())
}

test()
