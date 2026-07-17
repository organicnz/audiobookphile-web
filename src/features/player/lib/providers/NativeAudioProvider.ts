import type { AudioTrack } from '../AudioTrack'
import { IAudioProvider } from '../types'

export class NativeAudioProvider implements IAudioProvider {
  constructor(
    private player: HTMLAudioElement,
    private audioTracks: AudioTrack[],
    private startTime: number,
    private onTrackLoad: (trackStartTime: number) => void
  ) {}

  private currentTrackIndex = 0

  load(): void {
    const trackIndex = this.audioTracks.findIndex((track) => track.containsTime(this.startTime))
    this.currentTrackIndex = trackIndex >= 0 ? trackIndex : 0
    this.loadCurrentTrack()
  }

  private get currentTrack(): AudioTrack | null {
    return this.audioTracks[this.currentTrackIndex] ?? null
  }

  private loadCurrentTrack(): void {
    const track = this.currentTrack
    if (!track) return

    const trackStartTime = Math.max(0, this.startTime - track.startOffset)
    this.onTrackLoad(trackStartTime)

    this.player.src = track.relativeContentUrl
    this.player.load()
  }

  seek(time: number): void {
    const currentTrack = this.currentTrack
    if (!currentTrack) return

    const trackDuration = currentTrack.duration || this.player.duration || 0
    const trackEnd = currentTrack.startOffset + trackDuration

    if (trackDuration === 0 || (time >= currentTrack.startOffset && time <= trackEnd)) {
      const offsetTime = time - currentTrack.startOffset
      this.player.currentTime = Math.max(0, offsetTime)
    } else {
      const trackIndex = this.audioTracks.findIndex((t) => t.containsTime(time))
      if (trackIndex >= 0) {
        this.startTime = time
        this.currentTrackIndex = trackIndex
        this.loadCurrentTrack()
      } else {
        const offsetTime = time - currentTrack.startOffset
        this.player.currentTime = Math.max(0, offsetTime)
      }
    }
  }

  getCurrentTrackIndex(): number {
    return this.currentTrackIndex
  }

  nextTrack(): boolean {
    if (this.currentTrackIndex < this.audioTracks.length - 1) {
      this.currentTrackIndex++
      this.startTime = 0
      this.loadCurrentTrack()
      return true
    }
    return false
  }

  destroy(): void {
    this.player.removeAttribute('src')
    this.player.load()
  }
}
