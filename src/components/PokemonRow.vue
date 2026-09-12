<script setup>
const props = defineProps({
  name: String,
  dexNumber: Number,
  spriteUrl: String,
  types: { type: Array, default: () => [] },
  isFavorite: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<template>
  <div class="pokemon-row" @click="$emit('click')">
    <div class="pokemon-sprite">
      <img :src="spriteUrl" :alt="name" loading="lazy" />
    </div>
    <div class="pokemon-info">
      <span class="pokemon-name">{{ name }}</span>
      <span class="pokemon-id"># {{ dexNumber }}</span>
    </div>
    <div class="pokemon-divider"></div>
  </div>
</template>

<style scoped>
.pokemon-row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.pokemon-row:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.pokemon-row::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.05);
}

.pokemon-sprite {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pokemon-sprite img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.pokemon-info {
  flex: 1;
  min-width: 0;
}

.pokemon-name {
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
  text-transform: capitalize;
  display: block;
}

.pokemon-types {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.type-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: capitalize;
  font-weight: 600;
}

.type-normal { background-color: #A8A878; color: rgb(255, 255, 255); }
.type-fire { background-color: #EE8130; color: rgb(255, 255, 255); }
.type-water { background-color: #6390F0; color: rgb(255, 255, 255); }
.type-electric { background-color: #F7D02C; color: rgba(0, 0, 0, 0.6); }
.type-grass { background-color: #7AC74C; color: rgb(255, 255, 255); }
.type-ice { background-color: #96D9D6; color: rgba(0, 0, 0, 0.6); }
.type-fighting { background-color: #C22E28; color: rgb(255, 255, 255); }
.type-poison { background-color: #A33EA1; color: rgb(255, 255, 255); }
.type-ground { background-color: #E2BF65; color: rgba(0, 0, 0, 0.6); }
.type-flying { background-color: #A98FF3; color: rgba(0, 0, 0, 0.6); }
.type-psychic { background-color: #F95587; color: rgb(255, 255, 255); }
.type-bug { background-color: #A6B91A; color: rgb(255, 255, 255); }
.type-rock { background-color: #B6A136; color: rgb(255, 255, 255); }
.type-ghost { background-color: #735797; color: rgb(255, 255, 255); }
.type-dragon { background-color: #6F35FC; color: rgb(255, 255, 255); }
.type-dark { background-color: #705746; color: rgb(255, 255, 255); }
.type-steel { background-color: #B7B7CE; color: rgba(0, 0, 0, 0.6); }
.type-fairy { background-color: #D685AD; color: rgba(0, 0, 0, 0.6); }

.pokemon-divider {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
