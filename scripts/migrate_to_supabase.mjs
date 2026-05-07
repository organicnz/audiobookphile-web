import { Database } from "bun:sqlite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import dotenv from "dotenv";

// Try loading from catch-22-next by default if missing in env
const envPath = path.resolve(import.meta.dir, "../../../catch-22-next/.env.local");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // Service role key needed for bulk insert and admin auth

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sqliteDbPath = path.resolve(import.meta.dir, "../../audiobookshelf/config/absdatabase.sqlite");
const db = new Database(sqliteDbPath, { readonly: true });

// Ordered by dependencies (parents before children)
const tables = [
  "settings",
  "libraries",
  "libraryFolders",
  { name: "users", target: "profiles", isAuth: true },
  "authors",
  "series",
  "books",
  "libraryItems",
  "bookAuthors",
  "bookSeries",
  "devices",
  "playbackSessions",
  "mediaProgresses",
];

async function migrate() {
  console.log("🚀 Starting migration from SQLite to Supabase...");
  
  for (const tableConf of tables) {
    const sourceTable = typeof tableConf === "string" ? tableConf : tableConf.name;
    const targetTable = typeof tableConf === "string" ? tableConf : tableConf.target;
    const isAuth = typeof tableConf === "object" ? tableConf.isAuth : false;
    
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
        const newRow = { ...row };
        for (const [key, value] of Object.entries(newRow)) {
          if (typeof value === "string" && (value.startsWith("{") || value.startsWith("["))) {
            try {
              newRow[key] = JSON.parse(value);
            } catch (e) {
              // Ignore if not valid JSON
            }
          }
        }
        return newRow;
      });

      let successCount = 0;
      let errorCount = 0;

      if (isAuth) {
        // Special logic for Users -> Auth.Users + Profiles
        for (const user of parsedRows) {
          const email = user.email || `${user.username || 'user'}_${user.id.substring(0, 8)}@legacy.audiobookshelf`;
          const { data, error } = await supabase.auth.admin.createUser({
            email,
            password: 'PlaceholderPassword123!', // Legacy users will need to reset this
            email_confirm: true,
            user_metadata: {
              username: user.username,
              is_legacy_migration: true,
              type: user.type
            }
          });

          if (error) {
            // Check if user already exists
            if (error.message.includes('already registered')) {
              successCount++;
            } else {
              console.error(`   ❌ Error creating auth user ${user.username}:`, error.message);
              errorCount++;
            }
          } else {
            // Wait briefly to allow trigger to create profile
            await new Promise(r => setTimeout(r, 200));
            
            // Optionally, update the profile with the legacy ID if you want to keep references intact
            // However, Supabase Auth creates a new UUID. If we need to preserve the UUID for foreign keys:
            // The best way is to use the Auth API to create users and map the new IDs, OR we just let the 
            // script insert the old UUID into `profiles` manually if we bypass the trigger.
            // For now, we will just count it as success and let the Catch-22 trigger handle it.
            successCount++;
          }
        }
        console.log(`✅ Completed ${sourceTable}: ${successCount} successful, ${errorCount} failed.`);
        continue;
      }

      // Batch insert (up to 1000 rows at a time) for non-auth tables
      const BATCH_SIZE = 1000;
      
      for (let i = 0; i < parsedRows.length; i += BATCH_SIZE) {
        const batch = parsedRows.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from(targetTable).upsert(batch, { onConflict: 'id' });
        
        if (error) {
          console.error(`   ❌ Error inserting batch:`, error.message);
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
