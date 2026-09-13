import { useFavoriteStore } from '../stores/favorite'
import type { FavoritesRepository } from '../ports/favoritesRepository'
import { watch } from 'vue'

export function createPiniaFavoritesRepository(): FavoritesRepository {
  const store = useFavoriteStore()
  return {
    getFavorites: () => store.getFavorites(),
    isFavorite: (id) => store.isFavorite(id),
    toggleFavorite: (id) => store.toggleFavorite(id),
    subscribe: (cb) => {
      const stop = watch(() => store.getFavorites(), cb, { deep: true })
      return stop
    },
  }
}