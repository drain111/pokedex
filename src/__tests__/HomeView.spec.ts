// HomeView.spec.ts — does the actual pokedex logic work?
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createFakeFavoritesRepository } from '../adapters/FakeFavoritesRepository.ts'
import HomeView from '../views/HomeView.vue'

const mockResponse = {
  count: 4, next: null, previous: null,
  pokemon_entries: [{ pokemon_species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } },
    { pokemon_species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' }},
    { pokemon_species: { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' }},
    { pokemon_species: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon-species/4/' }}
  ],
}

beforeEach(() => {
  global.fetch = vi.fn<typeof fetch>().mockResolvedValue({ ok: true, json: async () => mockResponse }  as Response) 
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
  

  it('renders one row per pokemon returned', async () => {
    const wrapper = mount(HomeView, {
      global: { provide: {
      favoritesRepository: createFakeFavoritesRepository([1, 4]), // bulbasaur & charmander pre-favorited
      }, 
    },
    })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-item').length === mockResponse.count)
    expect(wrapper.findAll('.pokemon-item').length).toBe(mockResponse.count)
  })
  it('shows the name and dex number for each pokemon', async () => {
    const wrapper = mount(HomeView, {
      global: { provide: {
      favoritesRepository: createFakeFavoritesRepository([1, 4]), // bulbasaur & charmander pre-favorited
      }, 
    },
    })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-item').length === mockResponse.count)

    mockResponse.pokemon_entries.forEach((entry, i) => {
      expect(wrapper.text()).toContain(entry.pokemon_species.name)
      expect(wrapper.text()).toContain(String(i + 1))
    })
  })
})