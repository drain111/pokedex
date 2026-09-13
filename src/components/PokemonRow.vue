<script setup lang="ts">
defineProps({
  name: String,
  dexNumber: Number,
  spriteUrl: String,
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
    <div class="pokemon-divider">
      <div class="pokemon-favorite">
        <span v-if="isFavorite">★</span>
      </div>
    </div>
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


.pokemon-divider {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
