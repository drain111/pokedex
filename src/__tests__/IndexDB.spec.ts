// src/adapters/IndexedDbFavoritesRepository.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { createIndexedDbRepository } from '../stores/cache'
import { clear } from 'idb-keyval'

beforeEach(async () => {
  await clear()
})
describe('createIndexedDbFavoritesRepository', () => {
  it('returns undefined for a key that was never cached', async () => {
    const repo = createIndexedDbRepository<{ name: string }>()
    const result = await repo.apiCallSaved('missing-key')
    expect(result).toBeUndefined()
  })

  it('saves and retrieves a value', async () => {
    const repo = createIndexedDbRepository<{ name: string }>()
    await repo.saveApiCall({ name: 'bulbasaur' }, 'detail-bulbasaur')

    const result = await repo.apiCallSaved('detail-bulbasaur')
    expect(result).toEqual({ name: 'bulbasaur' })
  })

  it('does not overwrite an existing cached value', async () => {
    const repo = createIndexedDbRepository<{ name: string }>()
    await repo.saveApiCall({ name: 'bulbasaur' }, 'detail-bulbasaur')
    await repo.saveApiCall({ name: 'ivysaur' }, 'detail-bulbasaur') // same key, different value

    const result = await repo.apiCallSaved('detail-bulbasaur')
    expect(result).toEqual({ name: 'bulbasaur' }) // original value preserved
  })
})