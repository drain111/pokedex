import { createIndexedDbRepository } from '../stores/cache'
import type { CacheRepository } from '../ports/CacheRepository'

export function createidbCacheRepository<T>(): CacheRepository<T> {
  const store = createIndexedDbRepository<T>()
  return {
    apiCallSaved:(id) => store.apiCallSaved(id),
    saveApiCall:(chain, id) => store.saveApiCall(chain, id),
    
  }
}