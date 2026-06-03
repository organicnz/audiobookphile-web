async function main() {
  const res = await fetch('https://iambzzclljayqdxkeepy.supabase.co/functions/v1/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'organic', password: 'LoQNe24kdqKVC!#UhEPwjxhBmgA%R#VL' })
  });
  let data = await res.text();
  console.log("Login res:", data);
}
main();
