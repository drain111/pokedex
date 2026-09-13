import {  ref, watch } from 'vue'

export function useSearch(initialTerm = '') {
  const searchTerm = ref(initialTerm)
  const result = ref<unknown[]>([])

  function search(items: unknown[], term: string): unknown[] {
    if (!term.trim()) return items

    const normalized = term.trim().toLowerCase()
    return items.filter((item) => {
      if (typeof item === 'string') return item.toLowerCase().includes(normalized)
      if (item && typeof item === 'object' && 'name' in item) {
        return (item.name as string).toLowerCase().includes(normalized)
      }
      return false
    })
  }

  watch(searchTerm, (_newTerm, _oldTerm) => {
    // Result will be set by the parent composable that has the data source
    result.value = []
  })

  return { searchTerm, result, search }
}
