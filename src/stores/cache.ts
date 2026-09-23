import { get, set,createStore  } from 'idb-keyval'

import type { CacheRepository } from '../ports/CacheRepository'

  const customStore = createStore('pokedex', 'pokedex-cache');

export function createIndexedDbRepository<T>(): CacheRepository<T> {
  async function apiCallSaved(id: string): Promise<T | undefined> {
    return get(id, customStore)
  }

  async function saveApiCall(chain: T, key: string): Promise<void> {
    const existing = await get(key, customStore)
    if (existing === undefined) {
      await set(key, chain, customStore)
    }
  }

  return {
    apiCallSaved,
    saveApiCall,
  }
}