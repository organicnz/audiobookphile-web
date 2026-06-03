async function main() {
  const res = await fetch('https://iambzzclljayqdxkeepy.supabase.co/functions/v1/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'organic@gmail.com', password: 'password' })
  });
  let data = await res.json();
  if (data.error) {
    const res2 = await fetch('https://iambzzclljayqdxkeepy.supabase.co/functions/v1/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'organic', password: 'LoQNe24kdqKVC!#UhEPwjxhBmgA%R#VL' })
    });
    data = await res2.json();
  }
  
  const token = data.user?.token;
  console.log("Got token?", !!token);

  const playRes = await fetch('https://iambzzclljayqdxkeepy.supabase.co/functions/v1/api/items/47b2e2a1-80c9-4f3b-b8b6-d172212247b5', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('playRes status:', playRes.status);
  const playData = await playRes.text();
  console.log('playRes data:', playData.substring(0, 200));
}
main();
