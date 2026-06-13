import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('supabase/functions/upload-finalize/index.ts', 'utf8')

// Fix the UPSERT issue
code = code.replace(
  "const { error: bookError } = await db.from('books').upsert({ id: bookId, title, audio_files: finalAudioFiles, duration: currentDuration }, { onConflict: 'id' })",
  `let bookError = null;
    if (existingBook) {
      const res = await db.from('books').update({ audio_files: finalAudioFiles, duration: currentDuration }).eq('id', bookId)
      bookError = res.error
    } else {
      const res = await db.from('books').insert({ id: bookId, title, author_names_first_last: author ? [author] : null, audio_files: finalAudioFiles, duration: currentDuration })
      bookError = res.error
    }`
)

// Fix baseIndex calculation
code = code.replace(
  "baseIndex = finalAudioFiles.length",
  "baseIndex = finalAudioFiles.reduce((max: number, af: any) => Math.max(max, af.index || 0), 0)"
)

// Fix index assignment
code = code.replace(
  "index: baseIndex + i,",
  "index: baseIndex + i + 1,"
)

writeFileSync('supabase/functions/upload-finalize/index.ts', code)
