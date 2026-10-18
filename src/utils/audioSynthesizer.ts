/**
 * Audio control state manager for master volume and mute state.
 * All synthesizers/oscillators removed completely so NO background hum/drone plays.
 */

class AudioControlEngine {
  private masterVolume: number = 0.75;
  private isMuted: boolean = false;
  private previousVolume: number = 0.75;
  private listeners: Set<(volume: number, isMuted: boolean) => void> = new Set();

  public getVolume(): number {
    return this.isMuted ? 0 : this.masterVolume;
  }

  public getRawVolume(): number {
    return this.masterVolume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.masterVolume = clamped;
    if (clamped === 0) {
      this.isMuted = true;
    } else {
      this.isMuted = false;
      this.previousVolume = clamped;
    }
    this.notify();
  }

  public toggleMute(): boolean {
    if (this.isMuted) {
      this.isMuted = false;
      this.masterVolume = this.previousVolume > 0 ? this.previousVolume : 0.75;
    } else {
      this.previousVolume = this.masterVolume;
      this.isMuted = true;
    }
    this.notify();
    return this.isMuted;
  }

  public subscribe(cb: (volume: number, isMuted: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.getVolume(), this.isMuted));
  }

  // Compatibility no-op stubs so existing calls do not crash or produce hums
  public startAmbient(_preset?: string, _initialVolume?: number) {
    // Intentionally no-op: background drone removed per user request
  }

  public stopAmbient() {
    // Intentionally no-op
  }

  public toggleAmbient(_preset?: string, _initialVolume?: number) {
    return false;
  }

  public playVoiceNote(_duration = 30) {
    // Intentionally disabled per user request
  }

  public stopVoiceNote() {
    // Intentionally no-op
  }
}

export const audioEngine = new AudioControlEngine();
