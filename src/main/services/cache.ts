/** TTL cache with in-flight request de-duplication. */
interface Entry<T> {
  value: T
  expiresAt: number
}

export class TtlCache<T> {
  private store = new Map<string, Entry<T>>()
  private inflight = new Map<string, Promise<T>>()

  constructor(
    private ttlMs: number,
    private maxEntries = 500
  ) {}

  get(key: string): T | undefined {
    const hit = this.store.get(key)
    if (!hit) return undefined
    if (hit.expiresAt < Date.now()) {
      this.store.delete(key)
      return undefined
    }
    return hit.value
  }

  set(key: string, value: T): void {
    if (!this.store.has(key) && this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value
      if (oldest !== undefined) this.store.delete(oldest)
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs })
  }

  /** Resolve from cache or call `loader`; failed loads are not cached. */
  async resolve(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = this.get(key)
    if (cached !== undefined) return cached

    const pending = this.inflight.get(key)
    if (pending) return pending

    const promise = loader()
      .then((value) => {
        this.set(key, value)
        return value
      })
      .finally(() => {
        this.inflight.delete(key)
      })

    this.inflight.set(key, promise)
    return promise
  }
}
