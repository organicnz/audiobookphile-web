import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/app/(main)/upload/actions.ts', 'utf8')

code = code.replace(
  `      for (const book of allBooks) {
        const normalizedBookTitle = normalize(book.title || '')
        if (normalizedBookTitle && (normalizedQuery.includes(normalizedBookTitle) || normalizedBookTitle.includes(normalizedQuery))) {
          console.log(\`[upload/actions] Fuzzy matched "\${title}" to existing book "\${book.title}"\`)
          return book.media_id || undefined
        }
      }`,
  `      for (const book of allBooks) {
        const normalizedBookTitle = normalize(book.title || '')
        if (!normalizedBookTitle) continue
        
        if (normalizedBookTitle === normalizedQuery) {
          console.log(\`[upload/actions] Fuzzy matched "\${title}" to existing book "\${book.title}" (exact norm)\`)
          return book.media_id
        }

        if (normalizedBookTitle.length > 5) {
          if (normalizedQuery.includes(normalizedBookTitle) || normalizedBookTitle.includes(normalizedQuery)) {
            const ratio1 = normalizedBookTitle.length / normalizedQuery.length
            const ratio2 = normalizedQuery.length / normalizedBookTitle.length
            if (ratio1 > 0.5 || ratio2 > 0.5) {
              console.log(\`[upload/actions] Fuzzy matched "\${title}" to existing book "\${book.title}" (ratio)\`)
              return book.media_id
            }
          }
        }
      }`
)

writeFileSync('src/app/(main)/upload/actions.ts', code)
