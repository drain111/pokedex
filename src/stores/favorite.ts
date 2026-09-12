import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'pokedex-favorites'

function getInitialFavorites(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // localStorage unavailable
  }
  return []
}

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref<number[]>(getInitialFavorites())

  const isFavorite = computed(() => (pokemonId: number) => favorites.value.includes(pokemonId))

  function toggleFavorite(pokemonId: number) {
    if (isFavorite.value(pokemonId)) {
      favorites.value = favorites.value.filter((id) => id !== pokemonId)
    } else {
      favorites.value = [...favorites.value, pokemonId]
    }
    persist()
  }

  function getFavorites(): number[] {
    return favorites.value
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
    } catch {
      // ignore
    }
  }

  return { favorites, isFavorite, toggleFavorite, getFavorites }
})
