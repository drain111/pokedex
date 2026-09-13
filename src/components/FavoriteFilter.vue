<script setup lang="ts">
defineProps({
  filterMode: { type: String, default: 'all' },
  favCount: { type: Number, default: 0 },
})

defineEmits(['update:filterMode'])
</script>

<template>
  <div class="favorite-filter">
    <button
      class="filter-btn"
      :class="{ active: filterMode === 'all' }"
      @click="$emit('update:filterMode', 'all')"
    >
      All
    </button>
    <button
      class="filter-btn"
      :class="{ active: filterMode === 'favorites' }"
      @click="$emit('update:filterMode', 'favorites')"
    >
      Favorites ({{ favCount }})
    </button>
  </div>
</template>

<style scoped>
.favorite-filter {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 12px 0;
}

.filter-btn {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: rgba(79, 195, 247, 0.1);
  border-color: rgba(79, 195, 247, 0.3);
}

.filter-btn.active {
  background-color: rgba(79, 195, 247, 0.2);
  border-color: #4fc3f7;
  color: #4fc3f7;
}
</style>
