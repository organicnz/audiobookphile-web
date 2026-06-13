import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/app/(main)/upload/actions.ts', 'utf8')

code = code.replace(
  `    const { data } = await query.limit(1).maybeSingle()
    return data?.media_id || undefined`,
  `    const { data } = await query.limit(1).maybeSingle()
    if (data?.media_id) {
      return data.media_id
    }
    
    // Fuzzy match fallback
    const { data: allBooks } = await supabase
      .from('library_items')
      .select('media_id, title')
      .eq('library_id', libraryId)
      .eq('media_type', mediaType)
      
    if (allBooks) {
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
      const normalizedQuery = normalize(title)
      
      for (const book of allBooks) {
        const normalizedBookTitle = normalize(book.title || '')
        if (normalizedBookTitle && (normalizedQuery.includes(normalizedBookTitle) || normalizedBookTitle.includes(normalizedQuery))) {
          console.log(\`[upload/actions] Fuzzy matched "\${title}" to existing book "\${book.title}"\`)
          return book.media_id
        }
      }
    }
    
    return undefined`
)

writeFileSync('src/app/(main)/upload/actions.ts', code)
