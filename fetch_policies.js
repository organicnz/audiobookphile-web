const { spawn } = require('child_process');
const fs = require('fs');

const child = spawn('bunx', ['--bun', '@supabase/mcp-server-supabase'], {
  stdio: ['pipe', 'pipe', process.stderr]
});

let out = '';
child.stdout.on('data', (data) => {
  out += data.toString();
  if (out.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(out);
      fs.writeFileSync('pg_policies.json', JSON.stringify(parsed, null, 2));
      child.kill();
    } catch(e) {}
  }
});

const req = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'execute_sql',
    arguments: {
      project_id: 'iambzzclljayqdxkeepy',
      query: "SELECT schemaname, tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public';"
    }
  }
};

child.stdin.write(JSON.stringify(req) + '\n');
