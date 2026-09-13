<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import SearchBar from '../components/SearchBar.vue'
import FavoriteFilter from '../components/FavoriteFilter.vue'
import PokemonRow from '../components/PokemonRow.vue'
import DetailModal from '../components/DetailModal.vue'
import { usePokemonList } from '../composables/usePokemonList'
import type { FavoritesRepository } from '../ports/favoritesRepository.ts'
import { fetchPokemonDetail } from '../composables/usePokemonDetail'

const favoriteStore = inject<FavoritesRepository>('favoritesRepository')
if (!favoriteStore) throw new Error('favoritesRepository was not provided')
const pokemonStore = usePokemonList()

const { pokemons, loading, error, filterMode, displayedPokemons, loadPokemon, searchFilter } = pokemonStore
const searchTerm = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null



const selectedPokemonUrl = ref<string | null>(null)
const detailData = ref<{
  detail: {
    id: number
    name: string
    sprites: { front_default: string | null; other: { 'official-artwork': { front_default: string } } }
    types: { type: { name: string }; slot: number }[]
    base_experience: number
    height: number
    weight: number
    stats: { stat: { name: string }; base_stat: number }[]
  }
  species: { genus: string; flavorText: string; id: number }
  evolutionChain: { stages: { name: string; url: string }[]; evolutions: { name: string; url: string }[][] }
} | null>(null)
const isDetailLoading = ref(false)

async function openDetail(url: string, name: string) {
  selectedPokemonUrl.value = url
  isDetailLoading.value = true
  detailData.value = null
  try {
    detailData.value = await fetchPokemonDetail(url, name)
  } catch (e) {
    isDetailLoading.value = false
    alert("Error cargando el pokemon")
  } finally {
    isDetailLoading.value = false
  }
}

function closeModal() {
  selectedPokemonUrl.value = null
  detailData.value = null
}

function toggleFavorite(id: number) {
  favoriteStore.toggleFavorite(id)
}

function getSpriteUrl(name: string) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${name}.png`
}

function getEvolutionUrl(name: string) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${name}.png`
}

function normalizeName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function getStatColor(statName: string) {
  const colors: Record<string, string> = {
    hp: '#ff5555',
    attack: '#f08030',
    defense: '#f8d030',
    'special-attack': '#6890f0',
    'special-defense': '#78c850',
    speed: '#f85888',
  }
  return colors[statName] || '#888'
}

function getStatName(statKey: string) {
  const names: Record<string, string> = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SPA',
    'special-defense': 'SPD',
    speed: 'SPE',
  }
  return names[statKey] || statKey
}

const statOrder = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']

onMounted(() => {
  loadPokemon()
})

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <div class="pokedex-app">
    <header class="app-header">
      <h1 class="app-title">Pokédex</h1>
      <SearchBar v-model="searchTerm" />
      <FavoriteFilter
        v-model:filter-mode="filterMode"
        :fav-count="favoriteStore.getFavorites().length"
      />
    </header>

    <main class="pokemon-grid">
      <div v-if="loading" class="center-loading">
        <div class="spinner"></div>
        <p>Loading Pokémon...</p>
      </div>

      <div v-else-if="error" class="center-error">
        <p>❌ Error: {{ error }}</p>
        <button class="retry-btn" @click="loadPokemon()">Retry</button>
      </div>

      <div v-else-if="displayedPokemons.length === 0" class="center-empty">
        <p>No Pokémon found.</p>
      </div>

      <ul v-else class="pokemon-list">
        <li
          v-for="item in displayedPokemons"
          :key="item.pokemon_species.url"
          class="pokemon-item"
        >
          <PokemonRow
            :name="item.pokemon_species.name"
            :dex-number="item.id"
            :sprite-url="getSpriteUrl(item.id.toString())"
            :is-favorite="favoriteStore.isFavorite(parseInt(item.id.toString()))"
            @click="openDetail(item.pokemon_species.url, item.pokemon_species.name)"
          />
        </li>
      </ul>
    </main>

    <DetailModal
      v-if="selectedPokemonUrl && detailData"
      :pokemon="detailData.detail"
      :genus="detailData.species.genus"
      :flavor-text="detailData.species.flavorText"
      :evolution-stages="detailData.evolutionChain.stages"
      :evolutions="detailData.evolutionChain.evolutions"
      :is-loading="isDetailLoading"
      @close="closeModal"
      @favorite-toggle="toggleFavorite(detailData.detail.id)"
    />
  </div>
</template>

<style scoped>
.pokedex-app {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px 32px;

}

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: #0d0d1a;
  padding: 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.app-title {
  text-align: center;
  color: #4fc3f7;
  margin: 0 0 12px;
  font-size: 32px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 800;
  background: linear-gradient(135deg, #4fc3f7, #29b6f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pokemon-grid {
  width: 100%;
}

.center-loading, .center-error, .center-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  text-align: center;
  color: #888;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(79, 195, 247, 0.2);
  border-top-color: #4fc3f7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 16px;
  padding: 10px 28px;
  background-color: #4fc3f7;
  border: none;
  border-radius: 8px;
  color: #0d0d1a;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
}

.pokemon-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}




</style>
