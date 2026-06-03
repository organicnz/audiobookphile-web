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
      fs.writeFileSync('migration_output.json', JSON.stringify(parsed, null, 2));
      child.kill();
    } catch(e) {}
  }
});

const sql = fs.readFileSync('supabase/migrations/20240001000012_add_missing_foreign_key_indexes.sql', 'utf8');

const req = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'apply_migration',
    arguments: {
      project_id: 'iambzzclljayqdxkeepy',
      name: 'add_missing_foreign_key_indexes',
      query: sql
    }
  }
};

child.stdin.write(JSON.stringify(req) + '\n');
