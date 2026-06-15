import path from 'path'

export const SupportedFileTypes = {
  image: ['png', 'jpg', 'jpeg', 'webp'],
  audio: ['m4b', 'mp3', 'm4a', 'flac', 'opus', 'ogg', 'oga', 'mp4', 'aac', 'wma', 'aiff', 'aif', 'wav', 'webm', 'webma', 'mka', 'awb', 'caf', 'mpeg', 'mpg', 'mkv', 'avi', 'mov', 'm4v', 'wmv', 'flv', 'mts', 'm2ts', 'vob', 'ogv', 'rmvb', 'asf', '3gp'],
  ebook: ['epub', 'pdf', 'mobi', 'azw3', 'cbr', 'cbz'],
  info: ['nfo'],
  text: ['txt'],
  metadata: ['opf', 'abs', 'xml', 'json']
}

export const sanitizeFileName = (filename: string, colonReplacement = ' - '): string => {
  if (typeof filename !== 'string') {
    return ''
  }

  // Most file systems use number of bytes for max filename
  //   to support most filesystems we will use max of 255 bytes in utf-16
  //   Ref: https://doc.owncloud.com/server/next/admin_manual/troubleshooting/path_filename_length.html
  //   Issue: https://github.com/advplyr/audiobookphile/issues/1261
  const MAX_FILENAME_BYTES = 255
  const replacement = ''
  const illegalRe = /[\/\?<>\\:\*\|"]/g
  const controlRe = /[\x00-\x1f\x80-\x9f]/g
  const reservedRe = /^\.+$/
  const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i
  const windowsTrailingRe = /[\. ]+$/
  const lineBreaks = /[\n\r]/g

  let sanitized = filename
    .replace(':', colonReplacement) // Replace first occurrence of a colon
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(lineBreaks, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement)
    .replace(/\s+/g, ' ') // Replace consecutive spaces with a single space

  // Check if basename is too many bytes
  const ext = path.extname(sanitized) // separate out file extension
  const basename = path.basename(sanitized, ext)
  // Use Blob instead of Node.js Buffer for browser compatibility
  const getByteLength = (str: string) => new Blob([str]).size
  const extByteLength = getByteLength(ext)
  const basenameByteLength = getByteLength(basename)
  
  if (basenameByteLength + extByteLength > MAX_FILENAME_BYTES) {
    const MaxBytesForBasename = MAX_FILENAME_BYTES - extByteLength
    let totalBytes = 0
    let trimmedBasename = ''

    // Add chars until max bytes is reached
    for (const char of basename) {
      totalBytes += getByteLength(char)
      if (totalBytes > MaxBytesForBasename) break
      else trimmedBasename += char
    }

    trimmedBasename = trimmedBasename.trim()
    sanitized = trimmedBasename + ext
  }

  return sanitized
}
