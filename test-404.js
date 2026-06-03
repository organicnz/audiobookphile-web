import { createClient } from '@supabase/supabase-js'

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://iambzzclljayqdxkeepy.supabase.co'
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
  
  // Actually, I can just use the login endpoint I made!
  const loginRes = await fetch('https://iambzzclljayqdxkeepy.supabase.co/functions/v1/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser', password: 'testpassword123' })
  })
  
  const loginData = await loginRes.json()
  const token = loginData.user?.token
  if (!token) {
    console.log("Login failed", loginData);
    return;
  }
  
  console.log("Logged in!");
  
  const itemRes = await fetch('https://iambzzclljayqdxkeepy.supabase.co/functions/v1/api/items/47b2e2a1-80c9-4f3b-b8b6-d172212247b5?expanded=1&include=progress', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log("Status:", itemRes.status);
  console.log("Text:", await itemRes.text());
}
main()
