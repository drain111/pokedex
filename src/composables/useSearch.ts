import {  ref } from 'vue'
import type { PokemonEntry } from './usePokemonList'

export function useSearch(initialTerm = '') {
  const searchTerm = ref(initialTerm)
  const result = ref<PokemonEntry[]>([])

  function search(items: PokemonEntry[], term: string): PokemonEntry[] {
  if (!term.trim()) return items

  const normalized = term.trim().toLowerCase()
  return items.filter((item) => item.pokemon_species.name.toLowerCase().includes(normalized))
}

  
  return { searchTerm, result, search }
}
