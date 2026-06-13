import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/app/(main)/upload/actions.ts', 'utf8')

code = code.replace(
  "return book.media_id",
  "return book.media_id || undefined"
)

writeFileSync('src/app/(main)/upload/actions.ts', code)
