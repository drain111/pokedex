<script setup lang="ts">
import { computed } from 'vue'
import EvolutionNode from "./EvolutionNode.vue"
import type {ChainLink} from '../composables/types'

interface Props {
  pokemon: {
    id: number
    name: string
    sprites: { front_default: string | null; other: { 'official-artwork': { front_default: string } } }
    types: { type: { name: string }; slot: number }[]
    base_experience: number
    height: number
    weight: number
    stats: { stat: { name: string }; base_stat: number }[]
  }
  genus: string
  flavorText: string
  evolutions: ChainLink
  isLoading: boolean
  isFavorite?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFavorite:false
})
defineEmits<{
  close: []
  favoriteToggle: [id: number]
}>()

const fullArtworkUrl = computed(() => {
  return props.pokemon.sprites.other['official-artwork'].front_default
    || props.pokemon.sprites.front_default
    || ''
})

const statNames: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SPA',
  'special-defense': 'SPD',
  speed: 'SPE',
}

const statColors: Record<string, string> = {
  hp: '#ff5555',
  attack: '#f08030',
  defense: '#f8d030',
  'special-attack': '#6890f0',
  'special-defense': '#78c850',
  speed: '#f85888',
}

const statBaseNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']
const maxStats = 255
function getStatMap(detail: Props['pokemon']) {
  const map: Record<string, number> = {}
  for (const s of detail.stats) {
    map[s.stat.name] = s.base_stat
  }
  return map
}


function getStatColor(statName: string) {
  return statColors[statName] || '#888'
}
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div v-if="isLoading" class="modal-loading">
      <div class="spinner"></div>
      <p>Loading details...</p>
    </div>

    <div v-else class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="modal-number">#{{ pokemon.id.toString().padStart(3, '0') }}</span>
          <span class="modal-name">{{ pokemon.name }}</span>
        </h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-sprite-section">
        <button class="favorite-btn" @click="$emit('favoriteToggle', pokemon.id )">Favorite: {{ isFavorite ? '★' : '☆' }}</button>

        <img :src="fullArtworkUrl" :alt="pokemon.name" class="modal-sprite" />
        <div class="modal-types">
          <span v-for="t in pokemon.types" :key="t.type.name" :class="`type-badge type-${t.type.name}`" class="type-badge">
            {{ t.type.name }}
          </span>
        </div>
      </div>

      <div class="modal-stats-section">
        <div class="modal-info-row">
          <span class="modal-label">Height</span>
          <span class="modal-value">{{ (pokemon.height / 10).toFixed(1) }} m</span>
          <span class="modal-label">Weight</span>
          <span class="modal-value">{{ (pokemon.weight / 10).toFixed(1) }} kg</span>
        </div>
        <div class="modal-info-row">
          <span class="modal-label">Base Exp</span>
          <span class="modal-value">{{ pokemon.base_experience }}</span>
        </div>

        <div class="stat-bars">
          <div v-for="statKey in statBaseNames" :key="statKey" class="stat-row">
            <span class="stat-name">{{ statNames[statKey] }}</span>
            <span class="stat-value">{{ getStatMap(pokemon)[statKey] || 0 }}</span>
            <div class="stat-bar-bg">
              <div
                class="stat-bar-fill"
                :style="{ width: `${(getStatMap(pokemon)[statKey] ?? 0) / maxStats * 100}%`, backgroundColor: getStatColor(statKey) }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-description">
        <h3 class="modal-subtitle">Description</h3>
        <p class="modal-flavor-text">{{ flavorText }}</p>
      </div>

      <div class="modal-evolution" v-if="evolutions.evolves_to.length > 0">
        <h3 class="modal-subtitle">Evolutions</h3>
        <div class="evolution-chain">
          <EvolutionNode :node="evolutions" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
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

.modal-content {
  background-color: #1a1a2e;
  border-radius: 12px;
  /*max-width: 480px;*/
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  color: #e0e0e0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
}

.modal-number {
  font-size: 14px;
  color: #888;
  font-family: monospace;
}

.modal-name {
  font-size: 22px;
  text-transform: capitalize;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #888;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
}

.close-btn:hover {
  color: #fff;
}

.modal-sprite-section {
  text-align: center;
  padding: 24px 16px;
  background: linear-gradient(180deg, rgba(100, 100, 255, 0.1) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-sprite {
  width: 192px;
  height: 192px;
  image-rendering: pixelated;
}

.modal-types {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 8px;
}

.type-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: capitalize;
}

.type-normal { background-color: #A8A878; color: #fff; }
.type-fire { background-color: #EE8130; color: #fff; }
.type-water { background-color: #6390F0; color: #fff; }
.type-electric { background-color: #F7D02C; color: #333; }
.type-grass { background-color: #7AC74C; color: #fff; }
.type-ice { background-color: #96D9D6; color: #333; }
.type-fighting { background-color: #C22E28; color: #fff; }
.type-poison { background-color: #A33EA1; color: #fff; }
.type-ground { background-color: #E2BF65; color: #333; }
.type-flying { background-color: #A98FF3; color: #333; }
.type-psychic { background-color: #F95587; color: #fff; }
.type-bug { background-color: #A6B91A; color: #fff; }
.type-rock { background-color: #B6A136; color: #fff; }
.type-ghost { background-color: #735797; color: #fff; }
.type-dragon { background-color: #6F35FC; color: #fff; }
.type-dark { background-color: #705746; color: #fff; }
.type-steel { background-color: #B7B7CE; color: #333; }
.type-fairy { background-color: #D685AD; color: #333; }

.modal-stats-section {
  padding: 16px 20px;
}

.modal-info-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.modal-label {
  font-size: 12px;
  color: #888;
}

.modal-value {
  font-size: 12px;
  color: #ccc;
  font-family: monospace;
}

.stat-bars {
  margin-top: 16px;
}

.stat-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;
}

.stat-name {
  font-size: 11px;
  color: #888;
  width: 32px;
  text-transform: uppercase;
}

.stat-value {
  font-size: 12px;
  color: #ccc;
  width: 28px;
  font-family: monospace;
}

.stat-bar-bg {
  flex: 1;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.modal-description {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-subtitle {
  font-size: 14px;
  color: #aaa;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.modal-flavor-text {
  font-size: 14px;
  line-height: 1.6;
  color: #ccc;
  margin: 0;
}

.modal-evolution {
  padding: 16px 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  justify-content: center;
  display: flex;
    flex-direction: column;
}

.evolution-chain {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
    justify-content: center;
}

.evolution-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.evo-sprite {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
}

.evo-name {
  font-size: 11px;
  color: #ccc;
  text-transform: capitalize;
  text-align: center;
  max-width: 80px;
}

.evo-arrow {
  font-size: 20px;
  color: #555;
}

@media (min-width: 480px) {
  .modal-content {
    margin: 24px;
  }
}
.favorite-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    border: solid 2px #ffffff;
    border-radius:1rem;
    padding:0.1rem 1rem;
    margin-bottom:1rem;
}
</style>
