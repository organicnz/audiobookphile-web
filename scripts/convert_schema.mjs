import fs from 'fs';
import path from 'path';

const sqliteSqlPath = path.resolve(import.meta.dir, 'sqlite_schema.sql');
const pgSqlPath = path.resolve(import.meta.dir, '../../../catch-22-next/supabase/migrations/20260507000000_audiobookphile_schema.sql');

let sql = fs.readFileSync(sqliteSqlPath, 'utf8');

// Basic replacements for data types
sql = sql.replace(/DATETIME/g, 'TIMESTAMP WITH TIME ZONE');
sql = sql.replace(/TINYINT\(1\)/g, 'BOOLEAN');
sql = sql.replace(/JSON/g, 'JSONB');

// Remove COLLATE NOCASE
sql = sql.replace(/COLLATE `NOCASE`/g, '');
sql = sql.replace(/COLLATE NOCASE/g, '');

// Clean up SQLite specific statements (like PRAGMA, triggers, stat1)
const lines = sql.split('\n');
const cleanedLines = [];

for (const line of lines) {
  if (line.trim().startsWith('CREATE TRIGGER') || 
      line.trim() === 'BEGIN' || 
      line.trim().startsWith('UPDATE ') || 
      line.trim().startsWith('SET ') || 
      line.trim().startsWith('WHERE ') || 
      line.trim().startsWith('SELECT ') || 
      line.trim() === 'END;' ||
      line.trim().startsWith('FROM ') ||
      line.trim().startsWith('CREATE TABLE sqlite_stat1')) {
    // Skip SQLite triggers for now as they require PL/pgSQL conversion
    continue;
  }
  
  // Replace backticks with double quotes for PostgreSQL
  let cleanLine = line.replace(/`/g, '"');
  
  // Fix boolean defaults
  cleanLine = cleanLine.replace(/DEFAULT 0/g, 'DEFAULT false');
  cleanLine = cleanLine.replace(/DEFAULT 1/g, 'DEFAULT true');
  
  // Fix JSONB constraints
  cleanLine = cleanLine.replace(/JSONB/g, 'JSONB DEFAULT \'{}\'::jsonb');
  
  // We can skip users table if Catch-22 already handles it, but since we are inserting into profiles,
  // we actually don't need to create `users` or `profiles` if it exists.
  // We'll leave `users` here just in case, but comment it out.
  if (cleanLine.includes('CREATE TABLE "users"')) {
    cleanLine = '-- ' + cleanLine + ' (Skipped: Using Catch-22 profiles instead)';
  }

  cleanedLines.push(cleanLine);
}

fs.writeFileSync(pgSqlPath, cleanedLines.join('\n'));
console.log('Successfully generated PostgreSQL schema at:', pgSqlPath);
