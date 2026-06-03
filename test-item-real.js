async function main() {
  const res = await fetch('https://iambzzclljayqdxkeepy.supabase.co/functions/v1/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'organic', password: 'LoQNe24kdqKVC!#UhEPwjxhBmgA%R#VL' })
  });
  const data = await res.json();
  const token = data.user?.token;
  
  if (!token) {
    console.log("No token! Did login fail? Response:", data);
    return;
  }

  const itemRes = await fetch('https://iambzzclljayqdxkeepy.supabase.co/functions/v1/api/items/47b2e2a1-80c9-4f3b-b8b6-d172212247b5?expanded=1&include=progress', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('itemRes status:', itemRes.status);
  const itemData = await itemRes.text();
  console.log('itemRes data:', itemData.substring(0, 200));
}
main();
