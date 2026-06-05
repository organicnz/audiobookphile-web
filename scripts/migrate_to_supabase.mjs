import { Database } from "bun:sqlite";
import path from "path";
import dotenv from "dotenv";

const envPath = path.resolve(import.meta.dir, "../.env.local");
dotenv.config({ path: envPath });

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const edgeApiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + "/functions/v1/api/migrate-batch";

const sqliteDbPath = path.resolve(import.meta.dir, "../../audiobookphile/config/absdatabase.sqlite");
const db = new Database(sqliteDbPath, { readonly: true });

// Ordered by dependencies (parents before children)
const tables = [
  { name: "settings", target: "settings" },
  { name: "libraries", target: "libraries" },
  { name: "libraryFolders", target: "library_folders" },
  { name: "authors", target: "authors" },
  { name: "series", target: "series" },
  { name: "books", target: "books" },
  { name: "libraryItems", target: "library_items" },
  { name: "bookAuthors", target: "book_authors" },
  { name: "bookSeries", target: "book_series" },
];

// Helper to convert camelCase to snake_case
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

async function migrate() {
  console.log("🚀 Starting migration from SQLite to Supabase...");
  
  for (const tableConf of tables) {
    const sourceTable = tableConf.name;
    const targetTable = tableConf.target;
    
    console.log(`\n📦 Migrating ${sourceTable} -> ${targetTable}...`);
    
    try {
      const rows = db.query(`SELECT * FROM "${sourceTable}"`).all();
      
      if (rows.length === 0) {
        console.log(`✅ ${sourceTable} is empty, skipping.`);
        continue;
      }
      
      console.log(`   Found ${rows.length} rows to migrate.`);
      
      // We parse JSON fields since SQLite stores them as strings
      const parsedRows = rows.map(row => {
        const newRow = {};
        for (const [key, value] of Object.entries(row)) {
          const newKey = toSnakeCase(key);
          
          // OMIT COLUMNS THAT DON'T EXIST IN SUPABASE SCHEMA
          if (newKey === 'title_ignore_prefix') continue;
          if (newKey === 'library_folder_id') continue;
          if (newKey === 'last_scan') continue;
          if (newKey === 'current_time') continue; 
          if (targetTable === 'playback_sessions' && newKey === 'date') continue;
          if (targetTable === 'media_progress' && newKey === 'created_at') continue;
          if (targetTable === 'media_progress' && newKey === 'last_update') continue;
          if (targetTable === 'media_progress' && newKey === 'ebook_location') continue;
          if (targetTable === 'media_progress' && newKey === 'ebook_progress') continue;
          if (targetTable === 'libraries' && newKey === 'last_scan_version') continue;

          newRow[newKey] = value;
          if (typeof value === "string" && (value.startsWith("{") || value.startsWith("["))) {
            try {
              newRow[newKey] = JSON.parse(value);
            } catch (e) {
              // Ignore if not valid JSON
            }
          }
        }
        return newRow;
      });

      let successCount = 0;
      let errorCount = 0;

      // Batch insert
      const BATCH_SIZE = 500;
      
      for (let i = 0; i < parsedRows.length; i += BATCH_SIZE) {
        const batch = parsedRows.slice(i, i + BATCH_SIZE);
        
        const res = await fetch(edgeApiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`
          },
          body: JSON.stringify({ table: targetTable, rows: batch })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error(`   ❌ Error inserting batch:`, errData.error || res.statusText);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }
      
      console.log(`✅ Completed ${sourceTable}: ${successCount} successful, ${errorCount} failed.`);
      
    } catch (err) {
      console.error(`   ❌ Failed to read from ${sourceTable}:`, err.message);
    }
  }
  
  console.log("\n🎉 Migration finished!");
  db.close();
}

migrate();
