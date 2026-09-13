import type { FavoritesRepository } from '../ports/favoritesRepository'
import { watch } from 'vue'

export function createFakeFavoritesRepository(initial: number[] = []): FavoritesRepository {
  let favs = [...initial]
  return {
    getFavorites: () => favs,
    isFavorite: (id) => favs.includes(id),
    toggleFavorite: (id) => { favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id] },
    subscribe: () => () => {},
  }
}