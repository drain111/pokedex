// HomeView.spec.ts — does the actual pokedex logic work?
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createFakeFavoritesRepository } from '../adapters/FakeFavoritesRepository.ts'
import HomeView from '../views/HomeView.vue'

const mockResponse = {
  count: 1, next: null, previous: null,
  pokemon_entries: [{ pokemon_species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } }],
}

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse }) as unknown as typeof fetch
})

describe('HomeView', () => {
  it('loads and displays pokemon', async () => {
    const wrapper = mount(HomeView, {
      global: { provide: {
      favoritesRepository: createFakeFavoritesRepository([1, 4]), // bulbasaur & charmander pre-favorited
      }, 
    },
    })

    expect(wrapper.text()).toContain('Loading Pokémon')
    await vi.waitUntil(() => wrapper.text().includes('bulbasaur'))
    expect(wrapper.text()).toContain('bulbasaur')
  })
  const mockEntries = Array.from({ length: 5 }, (_, i) => ({
    pokemon_species: {
      name: `pokemon-${i + 1}`,
      url: `https://pokeapi.co/api/v2/pokemon-species/${i + 1}/`,
    },
  }))

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 5, next: null, previous: null, pokemon_entries: mockEntries }),
    }) as unknown as typeof fetch
  })

  it('renders one row per pokemon returned', async () => {
    const wrapper = mount(HomeView, { global: { plugins: [createTestingPinia({ createSpy: vi.fn })] } })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-item').length === mockEntries.length)
    expect(wrapper.findAll('.pokemon-item').length).toBe(mockEntries.length)
  })
  it('shows the name and dex number for each pokemon', async () => {
    const wrapper = mount(HomeView, { global: { plugins: [createTestingPinia({ createSpy: vi.fn })] } })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-item').length === mockEntries.length)

    mockEntries.forEach((entry, i) => {
      expect(wrapper.text()).toContain(entry.pokemon_species.name)
      expect(wrapper.text()).toContain(String(i + 1))
    })
  })
})