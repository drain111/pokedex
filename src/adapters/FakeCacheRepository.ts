import type { CacheRepository } from '../ports/CacheRepository'

import { vi } from 'vitest'
export function createidbCacheRepository<T>( cached: Record<string, T>): CacheRepository<T> {
  const apiCall = cached
  async function apiCallSavedImpl(id : string) : Promise<T | undefined> {
    return apiCall[id]
  }
  async function saveApiCallImpl(chain : T, id: string) : Promise<void> {
    const savedObj = await apiCallSavedImpl(id);
    if(savedObj == undefined) {
      apiCall[id] = chain 
    }
    else {
      console.log("name already in db")
    } 
  }
  return {
    apiCallSaved: vi.fn<(id : string) => Promise<T | undefined>>(apiCallSavedImpl),
    saveApiCall:vi.fn<(chain : T, id: string) => Promise<void>>(saveApiCallImpl)
  }
}