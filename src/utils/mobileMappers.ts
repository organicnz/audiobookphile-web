export function mapLibraryForMobile(lib: any): any {
  return {
    id: lib.id,
    name: lib.name || 'Library',
    display_order: lib.display_order ?? 0,
    displayOrder: lib.display_order ?? 0,
    icon: lib.icon || 'bookshelf',
    media_type: lib.media_type || 'book',
    mediaType: lib.media_type || 'book',
    provider: lib.provider || 'local',
    settings: {
      cover_aspect_ratio: lib.settings?.coverAspectRatio ?? lib.settings?.cover_aspect_ratio ?? 1,
      coverAspectRatio: lib.settings?.coverAspectRatio ?? lib.settings?.cover_aspect_ratio ?? 1,
      disable_watcher: lib.settings?.disableWatcher ?? lib.settings?.disable_watcher ?? false,
      disableWatcher: lib.settings?.disableWatcher ?? lib.settings?.disable_watcher ?? false,
      skip_matching_media_with_asin: lib.settings?.skipMatchingMediaWithAsin ?? lib.settings?.skip_matching_media_with_asin ?? false,
      skipMatchingMediaWithAsin: lib.settings?.skipMatchingMediaWithAsin ?? lib.settings?.skip_matching_media_with_asin ?? false,
      skip_matching_media_with_isbn: lib.settings?.skipMatchingMediaWithIsbn ?? lib.settings?.skip_matching_media_with_isbn ?? false,
      skipMatchingMediaWithIsbn: lib.settings?.skipMatchingMediaWithIsbn ?? lib.settings?.skip_matching_media_with_isbn ?? false,
      auto_scan_cron_expression: lib.settings?.autoScanCronExpression ?? lib.settings?.auto_scan_cron_expression ?? null,
      autoScanCronExpression: lib.settings?.autoScanCronExpression ?? lib.settings?.auto_scan_cron_expression ?? null
    },
    folders: lib.library_folders?.map((f: any) => ({
      id: f.id,
      full_path: f.path || '',
      fullPath: f.path || '',
      library_id: f.library_id,
      libraryId: f.library_id,
      added_at: new Date(f.created_at || f.added_at).getTime(),
      addedAt: new Date(f.created_at || f.added_at).getTime()
    })) || [],
    created_at: new Date(lib.created_at).getTime(),
    createdAt: new Date(lib.created_at).getTime(),
    last_update: new Date(lib.updated_at || lib.last_update || lib.created_at).getTime(),
    lastUpdate: new Date(lib.updated_at || lib.last_update || lib.created_at).getTime()
  }
}

export function mapBookForMobile(item: any, progressRecord: any): any {
  // 1. Authors
  const authors = item.books?.book_authors?.map((ba: any) => ba.authors).filter(Boolean) || []
  const authorNames = authors.map((a: any) => a.name)
  const authorName = authorNames.join(', ') || 'Unknown Author'
  const authorNameLF = authors.map((a: any) => a.name_lf || a.name).join(', ') || 'Unknown Author'

  // 2. Narrators
  const narrators = item.books?.narrators || []
  const narratorName = Array.isArray(narrators) ? narrators.join(', ') : (narrators || null)

  // 3. Series
  const bookSeries = item.books?.book_series || []
  const seriesInfo = bookSeries[0]
  const seriesName = seriesInfo?.series?.name || null

  // 4. Audio Files
  const audioFilesList = item.books?.audio_files || []
  const audioFiles = audioFilesList.map((af: any) => {
    const meta = af.metadata || {}
    const filename = af.filename || meta.filename || ''
    const size = Number(af.size || meta.size) || 0
    const path = af.path || meta.path || af.storage_path || ''
    const rel_path = af.relPath || af.rel_path || meta.relPath || meta.rel_path || af.storage_path || af.path || ''
    
    return {
      ino: af.id || af.ino,
      index: af.track_index !== undefined ? af.track_index : (af.index !== undefined ? af.index : 0),
      filename: filename,
      duration: Number(af.duration) || 0,
      size: size,
      mime_type: af.mime_type || af.mimeType || 'audio/mpeg',
      mimeType: af.mime_type || af.mimeType || 'audio/mpeg',
      bit_rate: af.bit_rate || af.bitRate || null,
      bitRate: af.bit_rate || af.bitRate || null,
      codec: af.codec || null,
      language: af.language || null,
      metadata: {
        filename: filename,
        ext: filename.split('.').pop() || '',
        path: path,
        rel_path: rel_path,
        relPath: rel_path,
        size: size,
        mtime_ms: Number(meta.mtimeMs || meta.mtime_ms) || new Date().getTime(),
        mtimeMs: Number(meta.mtimeMs || meta.mtime_ms) || new Date().getTime(),
        ctime_ms: Number(meta.ctimeMs || meta.ctime_ms) || new Date().getTime(),
        ctimeMs: Number(meta.ctimeMs || meta.ctime_ms) || new Date().getTime(),
        birthtime_ms: Number(meta.birthtimeMs || meta.birthtime_ms) || new Date().getTime(),
        birthtimeMs: Number(meta.birthtimeMs || meta.birthtime_ms) || new Date().getTime()
      }
    }
  }).sort((a: any, b: any) => a.index - b.index) || []

  // 5. Chapters
  const chaptersList = item.books?.chapters || []
  const chapters = chaptersList.map((ch: any) => ({
    id: ch.chapter_index !== undefined ? ch.chapter_index : ch.id,
    title: ch.title,
    start: Number(ch.start_time !== undefined ? ch.start_time : ch.start) || 0,
    end: Number(ch.end_time !== undefined ? ch.end_time : ch.end) || 0
  })).sort((a: any, b: any) => a.id - b.id) || []

  // 6. User Media Progress
  const userMediaProgress = progressRecord ? {
    id: progressRecord.id,
    library_item_id: item.id,
    libraryItemId: item.id,
    episode_id: progressRecord.episode_id || null,
    episodeId: progressRecord.episode_id || null,
    duration: Number(progressRecord.duration) || Number(item.books?.duration || item.duration) || 0,
    progress: Number(progressRecord.progress) || 0,
    current_time: Number(progressRecord.current_time_pos) || Number(progressRecord.current_time) || 0,
    currentTime: Number(progressRecord.current_time_pos) || Number(progressRecord.current_time) || 0,
    is_finished: progressRecord.is_finished || false,
    isFinished: progressRecord.is_finished || false,
    hide_from_continue_listening: progressRecord.hide_from_continue_listening ?? false,
    hideFromContinueListening: progressRecord.hide_from_continue_listening ?? false,
    last_update: new Date(progressRecord.last_update || progressRecord.updated_at).getTime(),
    lastUpdate: new Date(progressRecord.last_update || progressRecord.updated_at).getTime(),
    started_at: new Date(progressRecord.started_at || progressRecord.created_at || progressRecord.last_update).getTime(),
    startedAt: new Date(progressRecord.started_at || progressRecord.created_at || progressRecord.last_update).getTime(),
    finished_at: progressRecord.is_finished ? new Date(progressRecord.finished_at || progressRecord.last_update).getTime() : null,
    finishedAt: progressRecord.is_finished ? new Date(progressRecord.finished_at || progressRecord.last_update).getTime() : null
  } : null

  return {
    id: item.id,
    ino: item.id,
    library_id: item.library_id,
    libraryId: item.library_id,
    folder_id: item.folder_id || 'default',
    folderId: item.folder_id || 'default',
    path: item.path || '',
    rel_path: item.rel_path || item.path || '',
    relPath: item.rel_path || item.path || '',
    is_file: item.is_file ?? false,
    isFile: item.is_file ?? false,
    mtime_ms: new Date(item.updated_at || item.mtime).getTime(),
    mtimeMs: new Date(item.updated_at || item.mtime).getTime(),
    ctime_ms: new Date(item.created_at || item.ctime).getTime(),
    ctimeMs: new Date(item.created_at || item.ctime).getTime(),
    birthtime_ms: new Date(item.created_at || item.birthtime).getTime(),
    birthtimeMs: new Date(item.created_at || item.birthtime).getTime(),
    added_at: new Date(item.added_at || item.created_at).getTime(),
    addedAt: new Date(item.added_at || item.created_at).getTime(),
    updated_at: new Date(item.updated_at).getTime(),
    updatedAt: new Date(item.updated_at).getTime(),
    is_missing: item.is_missing ?? false,
    isMissing: item.is_missing ?? false,
    is_invalid: item.is_invalid ?? false,
    isInvalid: item.is_invalid ?? false,
    media_type: item.media_type || 'book',
    mediaType: item.media_type || 'book',
    media: {
      library_files: audioFiles.map((af: any) => ({
        ino: af.ino,
        metadata: af.metadata,
        is_supplementary: false,
        isSupplementary: false,
        file_type: 'audio',
        fileType: 'audio'
      })),
      chapters: chapters,
      duration: Number(item.books?.duration || item.duration) || 0,
      size: Number(item.books?.size || item.size) || 0,
      cover_path: item.cover_path || item.books?.cover_path || null,
      coverPath: item.cover_path || item.books?.cover_path || null,
      tags: item.books?.tags || [],
      audio_files: audioFiles,
      audioFiles: audioFiles,
      ebook_file: item.books?.ebook_file || null,
      ebookFile: item.books?.ebook_file || null,
      metadata: {
        title: item.books?.title || item.title || 'Unknown Title',
        subtitle: item.books?.subtitle || item.subtitle || null,
        author_name: authorName,
        authorName: authorName,
        author_name_lf: authorNameLF,
        authorNameLF: authorNameLF,
        narrator_name: narratorName,
        narratorName: narratorName,
        series_name: seriesName,
        seriesName: seriesName,
        genres: item.books?.genres || [],
        published_year: item.books?.published_year || null,
        publishedYear: item.books?.published_year || null,
        published_date: item.books?.published_date || null,
        publishedDate: item.books?.published_date || null,
        publisher: item.books?.publisher || null,
        description: item.books?.description || null,
        isbn: item.books?.isbn || null,
        asin: item.books?.asin || null,
        language: item.books?.language || null,
        explicit: item.books?.explicit || false,
        abridged: item.books?.abridged || false
      }
    },
    user_media_progress: userMediaProgress,
    userMediaProgress: userMediaProgress
  }
}
