
const API_BASE = 'https://pokeapi.co/api/v2'

export interface TypeDetail {
  slot: number
  type: { name: string; url: string }
}

export interface AbilityDetail {
  ability: { name: string; url: string }
  is_hidden: boolean
  slot: number
}

export interface StatDetail {
  base_stat: number
  stat: { name: string }
}

export interface SpriteData {
  front_default: string | null
  other: {
    'official-artwork': { front_default: string }
    home: { front_default: string }
  }
}

export interface PokemonDetailData {
  id: number
  name: string
  sprites: SpriteData
  types: TypeDetail[]
  stats: StatDetail[]
  abilities: AbilityDetail[]
  height: number
  weight: number
  base_experience: number
}

export interface ChainLink {
  species: { name: string; url: string }
  evolution_details: unknown[]
  evolves_to: ChainLink[]
}

export interface EvolutionChainApiResponse {
  chain: ChainLink
}

 
function extractFlavorText(entries: { flavor_text: string; version_group: { name: string } }[], _lang = 'en'): string {
  const texts: string[] = []
  for (const entry of entries) {
    const clean = entry.flavor_text
      .replace(/\n/g, ' ')
      .replace(/\f/g, ' ')
      .replace(/\r/g, ' ')
      .trim()
    if (clean) texts.push(clean)
  }
  return texts[0] || 'No description available'
}

export function parseSpeciesPokemonUrl(pokemonUrl: string): string | null {
  const parts = pokemonUrl.split('/')
  const name = parts[parts.length - 2]
  return name || null
}

export interface EvolutionEntry {
  name: string
  url: string
}

export interface FullDetail {
  detail: PokemonDetailData
  species: {
    id: number
    genus: string
    flavorText: string
  }
  evolutionChain: {
    stages: EvolutionEntry[]
    evolutions: EvolutionEntry[][]
  }
}

export async function fetchPokemonDetail(pokemonUrl: string, name:string): Promise<FullDetail> {
  const [detailRes, speciesRes] = await Promise.all([
    fetch(pokemonUrl),
    fetch(`${API_BASE}/pokemon-species/${name}`),
  ])

  if (!detailRes.ok) throw new Error('Failed to fetch Pokemon detail')
  if (!speciesRes.ok) throw new Error('Failed to fetch Pokemon species')

  const detail: PokemonDetailData = await detailRes.json()
  const speciesJson: { genera: { genus: string; language: { name: string } }[]; flavor_text_entries: { flavor_text: string; version_group: { name: string } }[]; evolution_chain: { url: string }; id: number } = await speciesRes.json()

  const genus = speciesJson.genera.find((g) => g.language.name === 'en')?.genus || 'Unknown'
  const flavorText = extractFlavorText(speciesJson.flavor_text_entries, 'en')
  const chainUrl = speciesJson.evolution_chain.url

  let evolutionChain: FullDetail['evolutionChain'] = { stages: [], evolutions: [] }
  try {
    const chainRes = await fetch(chainUrl)
    if (chainRes.ok) {
      const chainData: EvolutionChainApiResponse = await chainRes.json()

      const allStages: EvolutionEntry[] = []
      const allEvolutions: EvolutionEntry[][] = []

      function walkChain(node: EvolutionChainApiResponse['chain'], parent: EvolutionEntry | null) {
        allStages.push({ name: node.species.name, url: node.species.url })
        if (parent) {
          allEvolutions.push([{ name: parent.name , url:parent.url}, { name: node.species.name, url:node.species.url }])
        }
        for (const child of node.evolves_to) {

          walkChain(child, { name: node.species.name, url: node.species.url })
        }
      }

      let parentId: EvolutionEntry | null = null
      if (speciesJson.id) {
        const baseUrl = chainUrl.substring(0, chainUrl.lastIndexOf('/'))
        parentId = { name: 'unknown', url: baseUrl }
      }

      walkChain(chainData.chain, parentId)
      evolutionChain = { stages: allStages, evolutions: allEvolutions }
    }
  } catch {
    evolutionChain = { stages: [{ name: speciesJson.genera[0]?.genus || 'unknown', url: '' }], evolutions: [] }
  }

  return {
    detail,
    species: {
      id: speciesJson.id,
      genus,
      flavorText,
    },
    evolutionChain,
  }
}
