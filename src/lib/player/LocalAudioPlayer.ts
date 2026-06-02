import type { LibraryItem } from '@/types/api'
import { PlayerState } from '@/types/api'
import type { AudioTrack } from './AudioTrack'
import { AUDIO_MIME_TYPES } from './constants'
import { PlayerEventEmitter } from './PlayerEventEmitter'
import type { IAudioProvider } from './types'
import { NativeAudioProvider } from './providers/NativeAudioProvider'
import { HlsAudioProvider } from './providers/HlsAudioProvider'

export class LocalAudioPlayer extends PlayerEventEmitter {
  private player: HTMLAudioElement | null = null
  private provider: IAudioProvider | null = null

  // Track state
  private libraryItem: LibraryItem | null = null
  private audioTracks: AudioTrack[] = []
  private isHlsTranscode = false
  private startTime = 0
  private trackStartTime = 0
  private playWhenReady = false

  readonly playableMimeTypes: string[] = []

  constructor() {
    super()
    this.initialize()
  }

  private get currentTrack(): AudioTrack | null {
    const index = this.provider?.getCurrentTrackIndex() ?? 0
    return this.audioTracks[index] ?? null
  }

  private initialize(): void {
    const existing = document.getElementById('audio-player')
    if (existing) {
      existing.remove()
    }

    const audioEl = document.createElement('audio')
    audioEl.id = 'audio-player'
    audioEl.style.display = 'none'
    audioEl.preload = 'metadata'
    audioEl.crossOrigin = 'anonymous'
    document.body.appendChild(audioEl)
    this.player = audioEl

    this.player.addEventListener('play', this.handlePlay)
    this.player.addEventListener('pause', this.handlePause)
    this.player.addEventListener('progress', this.handleProgress)
    this.player.addEventListener('ended', this.handleEnded)
    this.player.addEventListener('error', this.handleError)
    this.player.addEventListener('loadedmetadata', this.handleLoadedMetadata)
    this.player.addEventListener('timeupdate', this.handleTimeUpdate)

    for (const mimeType of AUDIO_MIME_TYPES) {
      const canPlay = this.player.canPlayType(mimeType)
      if (canPlay) {
        this.playableMimeTypes.push(mimeType)
      }
    }
  }

  private handlePlay = (): void => {
    this.emit('stateChange', PlayerState.PLAYING)
  }

  private handlePause = (): void => {
    this.emit('stateChange', PlayerState.PAUSED)
  }

  private handleProgress = (): void => {
    const lastBufferTime = this.getLastBufferedTime()
    this.emit('buffertimeUpdate', lastBufferTime)
  }

  private handleEnded = (): void => {
    if (this.provider?.nextTrack()) {
      // next track will start loading
    } else {
      this.emit('stateChange', PlayerState.FINISHED)
      this.emit('finished', undefined)
    }
  }

  private handleError = (event: Event): void => {
    const error = new Error('Audio playback error')
    console.error('[LocalAudioPlayer] Error:', event)
    this.emit('stateChange', PlayerState.ERROR)
    this.emit('error', error)
  }

  private handleLoadedMetadata = (): void => {
    if (!this.isHlsTranscode && this.player) {
      this.player.currentTime = this.trackStartTime
    }

    this.emit('stateChange', PlayerState.LOADED)
    this.emit('durationChange', this.getDuration())

    if (this.playWhenReady) {
      this.playWhenReady = false
      this.play()
    }
  }

  private handleTimeUpdate = (): void => {
    if (this.player?.paused) {
      this.emit('timeupdate', this.getCurrentTime())
    }
  }

  private handleTrackLoad = (trackStartTime: number) => {
    this.trackStartTime = trackStartTime
  }

  set(libraryItem: LibraryItem | null, tracks: AudioTrack[], isHlsTranscode: boolean, startTime: number, playWhenReady = false): void {
    this.libraryItem = libraryItem
    this.audioTracks = tracks
    this.isHlsTranscode = isHlsTranscode
    this.playWhenReady = playWhenReady
    this.startTime = startTime

    if (this.provider) {
      this.provider.destroy()
      this.provider = null
    }

    if (!this.player) return

    if (this.isHlsTranscode) {
      this.provider = new HlsAudioProvider(this.player, this.audioTracks, this.startTime, this.handleTrackLoad)
    } else {
      this.provider = new NativeAudioProvider(this.player, this.audioTracks, this.startTime, this.handleTrackLoad)
    }

    this.provider.load()
  }

  destroy(): void {
    if (this.provider) {
      this.provider.destroy()
      this.provider = null
    }

    if (this.player) {
      this.player.removeEventListener('play', this.handlePlay)
      this.player.removeEventListener('pause', this.handlePause)
      this.player.removeEventListener('progress', this.handleProgress)
      this.player.removeEventListener('ended', this.handleEnded)
      this.player.removeEventListener('error', this.handleError)
      this.player.removeEventListener('loadedmetadata', this.handleLoadedMetadata)
      this.player.removeEventListener('timeupdate', this.handleTimeUpdate)
      this.player.remove()
      this.player = null
    }

    this.clearListeners()
    this.audioTracks = []
    this.libraryItem = null
  }

  async resetStream(startTime: number): Promise<void> {
    if (this.provider) {
      this.provider.destroy()
      this.provider = null
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (this.libraryItem) {
      this.set(this.libraryItem, this.audioTracks, this.isHlsTranscode, startTime, true)
    }
  }

  playPause(): void {
    if (!this.player) return
    if (this.player.paused) {
      this.play()
    } else {
      this.pause()
    }
  }

  play(): void {
    this.playWhenReady = true
    this.player?.play()
  }

  pause(): void {
    this.playWhenReady = false
    this.player?.pause()
  }

  getCurrentTime(): number {
    const trackOffset = this.currentTrack?.startOffset ?? 0
    return this.player ? trackOffset + this.player.currentTime : 0
  }

  getDuration(): number {
    if (!this.audioTracks.length) return 0
    const lastTrack = this.audioTracks[this.audioTracks.length - 1]
    const sumDuration = lastTrack.startOffset + lastTrack.duration
    if (sumDuration === 0 && this.player && !isNaN(this.player.duration) && this.player.duration !== Infinity) {
      return this.player.duration
    }
    return sumDuration
  }

  setPlaybackRate(rate: number): void {
    if (this.player) {
      this.player.playbackRate = rate
    }
  }

  setVolume(volume: number): void {
    if (this.player) {
      this.player.volume = volume
    }
  }

  seek(time: number, playWhenReady: boolean): void {
    if (!this.player || !this.provider) return

    this.playWhenReady = playWhenReady
    this.provider.seek(time)

    if (playWhenReady && this.player.paused) {
      this.play()
    }
  }

  private isValidDuration(duration: number): boolean {
    return duration != null && !isNaN(duration) && duration !== Infinity && duration !== -Infinity
  }

  private getBufferedRanges(): Array<{ start: number; end: number }> {
    if (!this.player) return []

    const ranges: Array<{ start: number; end: number }> = []
    const buffered = this.player.buffered

    for (let i = 0; i < buffered.length; i++) {
      let start = buffered.start(i)
      const end = buffered.end(i)

      if (!this.isValidDuration(start)) start = 0
      if (!this.isValidDuration(end)) continue

      ranges.push({ start, end })
    }

    return ranges
  }

  private getLastBufferedTime(): number {
    const ranges = this.getBufferedRanges()
    if (!ranges.length || !this.player) return 0

    const currentRange = ranges.find((r) => r.start < this.player!.currentTime && r.end > this.player!.currentTime)
    if (currentRange) return currentRange.end

    return ranges[ranges.length - 1].end
  }
}
