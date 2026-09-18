// HomeView.spec.ts — does the actual pokedex logic work?
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createFakeFavoritesRepository } from '../adapters/FakeFavoritesRepository.ts'
import HomeView from '../views/HomeView.vue'

import {bulbasaur, ivysaur, venusaur, bulbasaurSpecies, bulbasaurChain, ivysaurSpecies, venusaurSpecies } from './fixtures/bulbasaur'
import { eevee, eeveeSpecies, eeveeChain } from './fixtures/eevee'
import { ralts, raltsSpecies, raltsChain } from './fixtures/ralts'
import { xerneas, xerneasSpecies, xerneasChain } from './fixtures/xerneas'
const mockResponse = {
  count: 17, next: null, previous: null,
  pokemon_entries: [{ pokemon_species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } },
    { pokemon_species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' }},
    { pokemon_species: { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' }},
    { pokemon_species: { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon-species/133/' }},
    { pokemon_species: { name: 'vaporeon', url: 'https://pokeapi.co/api/v2/pokemon-species/134/' }},
    { pokemon_species: { name: 'jolteon', url: 'https://pokeapi.co/api/v2/pokemon-species/135/' }},
    { pokemon_species: { name: 'flareon', url: 'https://pokeapi.co/api/v2/pokemon-species/136/' }},
    { pokemon_species: { name: 'espeon', url: 'https://pokeapi.co/api/v2/pokemon-species/196/' }},
    { pokemon_species: { name: 'umbreon', url: 'https://pokeapi.co/api/v2/pokemon-species/197/' }},
    { pokemon_species: { name: 'ralts', url: 'https://pokeapi.co/api/v2/pokemon-species/280/' }},
    { pokemon_species: { name: 'kirlia', url: 'https://pokeapi.co/api/v2/pokemon-species/281/' }},
    { pokemon_species: { name: 'gardevoir', url: 'https://pokeapi.co/api/v2/pokemon-species/282/' }},
    { pokemon_species: { name: 'leafeon', url: 'https://pokeapi.co/api/v2/pokemon-species/470/' }},
    { pokemon_species: { name: 'glaceon', url: 'https://pokeapi.co/api/v2/pokemon-species/471/' }},
    { pokemon_species: { name: 'gallade', url: 'https://pokeapi.co/api/v2/pokemon-species/475/' }},
    { pokemon_species: { name: 'sylveon', url: 'https://pokeapi.co/api/v2/pokemon-species/700/' }},
    { pokemon_species: { name: 'xerneas', url: 'https://pokeapi.co/api/v2/pokemon-species/716/' }},

  ],
}
function mockFetchByUrl(url: string): Response {
  const responses: Record<string, unknown> = {
    'https://pokeapi.co/api/v2/pokemon/bulbasaur':bulbasaur,
    'https://pokeapi.co/api/v2/pokemon/ivysaur':ivysaur,
    'https://pokeapi.co/api/v2/pokemon/venusaur':venusaur,
    'https://pokeapi.co/api/v2/pokemon/eevee':eevee,
    'https://pokeapi.co/api/v2/pokemon/ralts':ralts,
    'https://pokeapi.co/api/v2/pokemon/xerneas':xerneas,
    'https://pokeapi.co/api/v2/pokemon-species/1/': bulbasaurSpecies,
    'https://pokeapi.co/api/v2/pokemon-species/2/': ivysaurSpecies,
    'https://pokeapi.co/api/v2/pokemon-species/3/': venusaurSpecies,
    'https://pokeapi.co/api/v2/pokemon-species/133/': eeveeSpecies,
    'https://pokeapi.co/api/v2/pokemon-species/280/': raltsSpecies,
    'https://pokeapi.co/api/v2/pokemon-species/716/': xerneasSpecies,
    'https://pokeapi.co/api/v2/evolution-chain/1/': bulbasaurChain,
    'https://pokeapi.co/api/v2/evolution-chain/67/': eeveeChain,
    'https://pokeapi.co/api/v2/evolution-chain/140/': raltsChain,
    'https://pokeapi.co/api/v2/evolution-chain/368/': xerneasChain,

  }

  const match = Object.entries(responses).find(([key]) => url.includes(key))
  if (!match) throw new Error(`No mock configured for URL: ${url}`)

  return { ok: true, json: async () => match[1] } as Response
}
function cleanFlavorText(text: string): string {
  return text.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim()
}
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason)
})
beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  global.fetch = vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const url = input.toString()
    if (url.includes('pokedex') ) {
      return Promise.resolve({ ok: true, json: async () => mockResponse } as Response)
    }
    return Promise.resolve(mockFetchByUrl(url))
  }) as typeof fetch
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
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === mockResponse.count)
    expect(wrapper.findAll('.pokemon-row').length).toBe(mockResponse.count)
  })
  it('shows the name and dex number for each pokemon', async () => {
    const wrapper = mount(HomeView, {
      global: { provide: {
      favoritesRepository: createFakeFavoritesRepository([1, 4]), // bulbasaur & charmander pre-favorited
      }, 
    },
    })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === mockResponse.count)

    mockResponse.pokemon_entries.forEach((entry) => {
      expect(wrapper.text()).toContain(entry.pokemon_species.name)
      const number = entry.pokemon_species.url.match(/(\d+)\/?$/)
      if (!number) throw new Error(`No dex number found in URL: ${entry.pokemon_species.url}`)
      expect(wrapper.text()).toContain(number[1])
    })
  })
  it('testing the search terms, bulbasaur should make bulbasaur appear only, same as ivysaur, and none for wetrgdffdswe', async () => {
    const wrapper = mount(HomeView, {
      global: { provide: {
      favoritesRepository: createFakeFavoritesRepository([1, 4]), // bulbasaur & charmander pre-favorited
      }, 
    },
    })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === mockResponse.count)
    wrapper.find('.search-input').setValue('bulbasaur')
    // search has a 200ms debounce, so wait for it
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === 1, { timeout: 1000 })

    expect(wrapper.findAll('.pokemon-row').length).toBe(1)
    wrapper.find('.search-input').setValue('ivysaur')
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === 1, { timeout: 1000 })

    expect(wrapper.findAll('.pokemon-row').length).toBe(1)

    wrapper.find('.search-input').setValue('wetrgdffdswe')
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === 0, { timeout: 1000 })

    expect(wrapper.findAll('.pokemon-row').length).toBe(0)
    
  })
  
})
describe('Detail modal', () => {
  it('opens the detail modal and shows description in English', async () => {
    const wrapper = mount(HomeView, {
      global: { provide: { favoritesRepository: createFakeFavoritesRepository([1, 4]) } },
    })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === mockResponse.count)

    await wrapper.find('.pokemon-row').trigger('click')
    expect(window.alert).not.toHaveBeenCalled() // will fail loudly with a clear reason if it did
    await vi.waitUntil(() => wrapper.find('.modal-backdrop').exists())

    const modalText = wrapper.find('.modal-flavor-text').text()
    const flavourText = bulbasaurSpecies.flavor_text_entries.find(
      (e: {language: {name:string}}) => e.language.name === 'en'
    )!.flavor_text
    const cleanedFlavourText = cleanFlavorText(flavourText)
    // assert against the English flavor text you hardcoded from the fixture
    expect(modalText).toContain(cleanedFlavourText)
  })
})

describe('Evolution chain', () => {
  async function openEvolutionFor(dexIndex: number, wrapper: ReturnType<typeof mount>) {
    const allPokemonItems = wrapper.findAll('.pokemon-row');
    if(allPokemonItems[dexIndex] == undefined) {
      return;
    }
    await allPokemonItems[dexIndex].trigger('click')
    await vi.waitUntil(() => wrapper.find('.modal-backdrop').exists())
  }

  it('shows bulbasaur -> ivysaur -> venusaur in order', async () => {
    const wrapper = mount(HomeView, {
      global: { provide: { favoritesRepository: createFakeFavoritesRepository([1, 4]) } },
    })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === mockResponse.count)
    await openEvolutionFor(0, wrapper)

    const names = wrapper.findAll('.species').map(n => n.text())
    expect(names).toEqual(['bulbasaur', 'ivysaur', 'venusaur'])
  })

  it('shows eevee branching into all eeveelutions', async () => {
    // if eevee isn't in mockResponse.pokemon_entries, add it there or mount a
    // component that fetches its detail directly rather than via the list
    const wrapper = mount(HomeView, {
      global: { provide: { favoritesRepository: createFakeFavoritesRepository([1, 4]) } },
    })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === mockResponse.count)
    await openEvolutionFor(/* eevee's index */ 3, wrapper)

    const names = wrapper.findAll('.species').map(n => n.text())
    expect(names).toEqual(expect.arrayContaining([
      'eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon',
    ]))
  })

  it('shows ralts -> kirlia -> gardevoir/gallade branch', async () => {
    const wrapper = mount(HomeView, {
      global: { provide: { favoritesRepository: createFakeFavoritesRepository([1, 4]) } },
    })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === mockResponse.count)
    await openEvolutionFor(/* ralts's index */ 9, wrapper)

    const names = wrapper.findAll('.species').map(n => n.text())
    expect(names).toEqual(expect.arrayContaining(['ralts', 'kirlia', 'gardevoir', 'gallade']))
  })

  it('shows no evolutions for xerneas', async () => {
    const wrapper = mount(HomeView, {
      global: { provide: { favoritesRepository: createFakeFavoritesRepository([1, 4]) } },
    })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === mockResponse.count)
    await openEvolutionFor(/* xerneas's index */ 16, wrapper)

    const names = wrapper.findAll('.species').map(n => n.text())
    expect(names).toEqual([]) // sole node, no evolves_to children rendered
  })
})
describe('Favorites', () => {
  it('opens the detail modal and favorites a pokemon, check it is the only favorited and the two buttons work', async () => {
    const wrapper = mount(HomeView, {
      global: { provide: { favoritesRepository: createFakeFavoritesRepository([]) } },
    })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === mockResponse.count)

    await wrapper.find('.pokemon-row').trigger('click')
    expect(window.alert).not.toHaveBeenCalled() // will fail loudly with a clear reason if it did
    await vi.waitUntil(() => wrapper.find('.modal-backdrop').exists())

    wrapper.find('.favorite-btn').trigger('click')
    wrapper.find('.modal-backdrop').trigger('click')
    wrapper.find('.favoriteButton').trigger('click')

    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === 1)
    expect(wrapper.findAll('.pokemon-row').length).toBe(1)
    wrapper.find('.allButton').trigger('click')
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === mockResponse.count)

    expect(wrapper.findAll('.pokemon-row').length).toBe(mockResponse.count)

  })
  it('check that eevee and bulbasaur are favorited', async () => {
    const wrapper = mount(HomeView, {
      global: { provide: { favoritesRepository: createFakeFavoritesRepository([1, 133]) } },
    })
    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === mockResponse.count)

    wrapper.find('.favoriteButton').trigger('click')

    await vi.waitUntil(() => wrapper.findAll('.pokemon-row').length === 2)
    const names = wrapper.findAll('.pokemon-name').map(n => n.text())
    expect(names).toEqual(expect.arrayContaining([
      'bulbasaur', 'eevee'
    ]))
    
  })
})