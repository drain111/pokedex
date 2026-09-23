export interface CacheRepository<T = unknown> {
  apiCallSaved(id:string) : Promise<T | undefined>
  saveApiCall(chain : T, key : string): Promise<void>
}