interface CacheEntry<T> {
    value: T,
    expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const cache = {
    /** Get a cached value, or undefined if missing | expired */
    get<T>(key: string): T | undefined {
        const entry = store.get(key) as CacheEntry<T> | undefined;
        if (!entry) return undefined;
        if (Date.now() > entry.expiresAt) {
            store.delete(key);
            return undefined;
        }
        return entry.value;
    },

    /** Store a value with a TTL in seconds */
    set<T>(key: string, value: T, ttlSeconds: number): void {
        store.set(key, {value, expiresAt: Date.now() + ttlSeconds * 1000});
    },

    /** Convenience: get cached value or run fetcher and cache the result */
    async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number): Promise<T> {
        const cachedInfo = cache.get<T>(key);
        if (cachedInfo !== undefined) return cachedInfo;
        const fresh = await fetcher();
        cache.set(key, fresh, ttlSeconds);
        return fresh; 
    },

    del(key: string) {
        store.delete(key);
    },

    size() {
        return store.size;
    },
};