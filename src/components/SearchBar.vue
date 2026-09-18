<script setup lang="ts">
interface Props {
  modelValue: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="search-bar">
    <input
      type="text"
      :value="modelValue"
      @input="onInput"
      placeholder="Search by name"
      class="search-input"
    />
  </div>
</template>
