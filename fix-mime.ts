import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/app/(main)/upload/UploadHelper.ts', 'utf8')

code = code.replace(
  "const contentType = file.type || 'application/octet-stream'",
  "const contentType = file.type || file.mime_type || 'application/octet-stream'"
)

code = code.replace(
  "contentType: file.type || 'application/octet-stream'",
  "contentType: file.type || file.mime_type || 'application/octet-stream'"
)

writeFileSync('src/app/(main)/upload/UploadHelper.ts', code)
