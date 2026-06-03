const fs = require('fs');
fetch('http://localhost:54321/functions/v1/api/libraries', {
  headers: {
    'Authorization': 'Bearer ' + process.env.SUPABASE_KEY
  }
}).then(res => res.json()).then(console.log).catch(console.error);
