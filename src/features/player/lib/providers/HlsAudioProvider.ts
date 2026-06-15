import Hls from 'hls.js'
import type { AudioTrack } from '../AudioTrack'
import { IAudioProvider } from '../types'

export class HlsAudioProvider implements IAudioProvider {
  private hlsInstance: Hls | null = null
  private currentTrackIndex = 0

  constructor(
    private player: HTMLAudioElement,
    private audioTracks: AudioTrack[],
    private startTime: number,
    private onTrackLoad: (trackStartTime: number) => void
  ) {}

  private get currentTrack(): AudioTrack | null {
    return this.audioTracks[this.currentTrackIndex] ?? null
  }

  load(): void {
    this.currentTrackIndex = 0
    this.onTrackLoad(0)

    if (!this.currentTrack) return

    if (!Hls.isSupported()) {
      console.warn('[HlsAudioProvider] HLS.js not supported - fallback to native player')
      this.player.src = this.currentTrack.relativeContentUrl
      this.player.currentTime = this.startTime
      return
    }

    const hlsOptions: Partial<Hls['config']> = {
      startPosition: this.startTime || -1,
      fragLoadPolicy: {
        default: {
          maxTimeToFirstByteMs: 10000,
          maxLoadTimeMs: 120000,
          timeoutRetry: {
            maxNumRetry: 4,
            retryDelayMs: 0,
            maxRetryDelayMs: 0
          },
          errorRetry: {
            maxNumRetry: 8,
            retryDelayMs: 1000,
            maxRetryDelayMs: 8000,
            shouldRetry: (retryConfig, retryCount, _isTimeout, httpStatus, retry) => {
              if (httpStatus?.code === 404 && (retryConfig?.maxNumRetry ?? 0) > retryCount) {
                console.log(`[HLS] Server 404 for fragment - retry ${retryCount} of ${retryConfig?.maxNumRetry}`)
                return true
              }
              return retry
            }
          }
        }
      }
    }

    this.hlsInstance = new Hls(hlsOptions)
    this.hlsInstance.attachMedia(this.player)

    this.hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
      if (!this.hlsInstance || !this.currentTrack) return

      this.hlsInstance.loadSource(this.currentTrack.relativeContentUrl)

      this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[HLS] Manifest parsed')
      })

      this.hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
        if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
          console.error('[HLS] Buffer stalled error')
        } else if (data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR) {
          if (data.errorAction?.action !== 5) {
            console.error('[HLS] Fragment load error', data)
          }
        } else {
          console.error('[HLS] Error:', data.type, data.details, data)
        }
      })

      this.hlsInstance.on(Hls.Events.DESTROYING, () => {
        console.log('[HLS] Destroying instance')
      })
    })
  }

  seek(time: number): void {
    const offsetTime = time - (this.currentTrack?.startOffset ?? 0)
    this.player.currentTime = Math.max(0, offsetTime)
  }

  getCurrentTrackIndex(): number {
    return this.currentTrackIndex
  }

  nextTrack(): boolean {
    return false
  }

  destroy(): void {
    if (this.hlsInstance) {
      this.hlsInstance.destroy()
      this.hlsInstance = null
    }
  }
}
