import { PlayerEventMap, PlayerEventCallback } from './types'

type EventListeners = {
  [K in keyof PlayerEventMap]?: Set<PlayerEventCallback<K>>
}

export class PlayerEventEmitter {
  protected listeners: EventListeners = {}

  on<K extends keyof PlayerEventMap>(event: K, callback: PlayerEventCallback<K>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set<PlayerEventCallback<keyof PlayerEventMap>>()
    }
    this.listeners[event]!.add(callback as PlayerEventCallback<keyof PlayerEventMap>)
  }

  off<K extends keyof PlayerEventMap>(event: K, callback: PlayerEventCallback<K>): void {
    this.listeners[event]?.delete(callback as PlayerEventCallback<keyof PlayerEventMap>)
  }

  protected emit<K extends keyof PlayerEventMap>(event: K, data: PlayerEventMap[K]): void {
    this.listeners[event]?.forEach((callback) => {
      ;(callback as PlayerEventCallback<K>)(data)
    })
  }

  protected clearListeners(): void {
    this.listeners = {}
  }
}
