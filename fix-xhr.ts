import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/app/(main)/upload/UploadHelper.ts', 'utf8')

code = code.replace(
  "xhr.setRequestHeader('Content-Type', contentType)",
  "xhr.setRequestHeader('Content-Type', contentType)\n        xhr.setRequestHeader('x-upsert', 'true')"
)

writeFileSync('src/app/(main)/upload/UploadHelper.ts', code)
