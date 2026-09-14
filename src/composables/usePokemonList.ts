// Import Vue composition APIs: ref for reactive state, computed for derived state
import { ref, computed, inject  } from 'vue'
// Reusable search logic extracted into its own composable
import { useSearch } from './useSearch'
// Pinia store for managing favorite Pokemon IDs across the app
import type { FavoritesRepository } from '../ports/FavoritesRepository.ts'


  
// Base URL for the PokeAPI (a free REST API containing all Pokemon data)
const API_BASE = 'https://pokeapi.co/api/v2'
export interface PokemonSpecies {
  name: string        // e.g. "pikachu"
  url: string         // e.g. "https://pokeapi.co/api/v2/pokemon/25/"
}
// Interface describing a simplified Pokemon entry shown in the list
export interface PokemonEntry {
  pokemon_species: PokemonSpecies
  id: number
  entry_number: number          // e.g. 25 (extracted from the URL below)
}

// Interface matching the PokeAPI pagination response shape
export interface PokemonListResult {
  count: number                  // Total number of pokemon in the database
  next: string | null            // URL to fetch the next page (null if last page)
  previous: string | null        // URL to fetch the previous page (null on first page)
  pokemon_entries: PokemonEntry[]        // Array of pokemon name + url for this page
}

// Utility function that parses the numeric ID from a PokeAPI URL.
// Example input: "https://pokeapi.co/api/v2/pokemon/25/"
//   -> splits by "/" -> ["https:", "", "pokeapi.co", "api", "v2", "pokemon", "25", ""]
//   -> .filter(Boolean) removes empty strings -> [..., "pokemon", "25"]
//   -> takes the last element -> "25" -> parseInt -> 25
function extractIdFromUrl(url: string): number {
  const filter = url.split('/').filter(Boolean)
  const id = filter[filter.length - 1]
  if(!id) return 1
  return parseInt(id, 10)
}

// Fetches ALL pokemon from PokeAPI using pagination.
// PokeAPI pokedex returns every pokemon with the pokedex index
export async function fetchPokemonList(): Promise<PokemonEntry[]> {
  let allPokemon: PokemonEntry[] = []
  const url = `${API_BASE}/pokedex/1/`

  // Keep fetching while there's a next page URL
  const res = await fetch(url)                      // Send HTTP GET request
  if (!res.ok) throw new Error(`Failed to fetch pokemon list: ${res.status}`)
  const data: PokemonListResult = await res.json()  // Parse the JSON response
  
  // For each pokemon in this page, spread its name/url and add the extracted id
  allPokemon = [...allPokemon, ...data.pokemon_entries.map((p) => ({ ...p, id: extractIdFromUrl(p.pokemon_species.url)}))]
  
  return allPokemon
}

// Composition function (composable) for pokemon list state and behavior.
// In Vue, composables are functions that encapsulate and reuse reactive logic.
// They follow the naming convention "useXxx" so Vue tooling can apply eslint rules.
export function usePokemonList() {
  // --- State ---
  // `ref` creates a reactive reference. When pokemons.value changes, components
  // using this composable will automatically re-render with the new data.
  const pokemons = ref<PokemonEntry[]>([])       // The raw list of all pokemon
  const loading = ref(true)                       // True while data is being fetched
  const error = ref<string | null>(null)          // Error message if fetching fails
  const filterMode = ref<'all' | 'favorites'>('all')  // Toggle between showing all or only favorites

  // --- Dependencies ---
  // useSearch is a composable that provides search term state and filtering logic.
  // It's reused here without duplicating the search code.
  const searchFilter = useSearch()
  const favoriteStore = inject<FavoritesRepository>('favoritesRepository')
  if (!favoriteStore) throw new Error('favoritesRepository was not provided')
  // useFavoriteStore is a Pinia store instance for cross-component favorite management

  // --- Computed properties ---
  // `computed` creates a derived reactive value that auto-recalculates when its
  // dependencies change. Think of it like a watch-only computed value in Vue templates,
  // but available for reuse across components.
  const displayedPokemons = computed(() => {
    // Start with a shallow copy of the full pokemon list (avoids mutating reactive state)
    let items: PokemonEntry[] = [...pokemons.value]

    // If user typed something in the search box, filter the list using useSearch's logic
    if (searchFilter.searchTerm.value) {
      items = (searchFilter.search)(items, searchFilter.searchTerm.value)
    }

    // If the "favorites" tab is active, only keep pokemon whose IDs are in the favorite store
    if (filterMode.value === 'favorites') {
      const favs = favoriteStore.getFavorites()
      if (favs.length > 0) {
        items = items.filter((p) => favs.includes(p.id))
      } else {
        // No favorites yet means nothing to display
        items = []
      }
    }

    return items
  })

  // --- Actions (functions that mutate state or perform side effects) ---
  // Fetches all pokemon from the API and updates reactive state accordingly.
  async function loadPokemon() {
    loading.value = true   // Trigger loading spinner in UI
    error.value = null     // Clear any previous error
    try {
      pokemons.value = await fetchPokemonList()  // Replace reactive ref with fetched data
    } catch (e: unknown) {
      // Narrow the error type and store a message for the UI to display
      if (e instanceof Error) {
        error.value = e.message
      } else {
        error.value = 'An unknown error occurred'
      }
    } finally {
      loading.value = false  // Always stop loading, even on failure
    }
  }

  // Updates the filter mode (switch between "all" and "favorites" tabs)
  function onFilterChange(mode: 'all' | 'favorites') {
    filterMode.value = mode
  }
  return {
    pokemons,
    loading,
    error,
    filterMode,
    displayedPokemons,
    loadPokemon,
    onFilterChange,
    searchFilter,
    favoriteStore
  }
}
