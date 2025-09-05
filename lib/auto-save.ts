export class AutoSave {
  private timeoutId: NodeJS.Timeout | null = null
  private delay: number
  private callback: () => void

  constructor(callback: () => void, delay = 2000) {
    this.callback = callback
    this.delay = delay
  }

  trigger() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(() => {
      this.callback()
      this.timeoutId = null
    }, this.delay)
  }

  cancel() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  flush() {
    this.cancel()
    this.callback()
  }
}

export function useAutoSave(callback: () => void, delay = 2000) {
  const autoSave = new AutoSave(callback, delay)

  return {
    trigger: () => autoSave.trigger(),
    cancel: () => autoSave.cancel(),
    flush: () => autoSave.flush(),
  }
}
