export class LruCache<K, V> {
  private readonly limit: number
  private store: Map<K, V>

  constructor(limit: number) {
    this.limit = Math.max(1, limit)
    this.store = new Map<K, V>()
  }

  get(key: K): V | undefined {
    const value = this.store.get(key)
    if (value === undefined) {
      return undefined
    }

    this.store.delete(key)
    this.store.set(key, value)
    return value
  }

  peek(key: K): V | undefined {
    return this.store.get(key)
  }

  set(key: K, value: V): void {
    if (this.store.has(key)) {
      this.store.delete(key)
    }
    this.store.set(key, value)

    if (this.store.size > this.limit) {
      const oldestKey = this.store.keys().next().value as K | undefined
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey)
      }
    }
  }

  has(key: K): boolean {
    return this.store.has(key)
  }

  clear(): void {
    this.store.clear()
  }
}
