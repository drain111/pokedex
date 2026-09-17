
const API_BASE = 'https://pokeapi.co/api/v2'

export interface TypeDetail {
  slot: number
  type: type
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
  evolution_method: string | null 
  evolves_to: ChainLink[]
}
export interface ChainLinkAPI {
  species: { name: string; url: string }
  evolution_details: Evolution_Details[]
  evolves_to: ChainLinkAPI[]
}
export interface Evolution_Details {
  trigger:{name: string, url:string},
  min_level: number | null,
  min_happiness: number | null,
  min_beauty: number | null,
  min_affection: number |null,
  gender: number | null,
  time_of_day: string | null,
  held_item: held_item | null,
  known_move: known_move | null,
  known_move_type: known_move | null,
  location: location | null,
  needs_overworld_rain: boolean,
  party_species: party_species | null,
  party_type: type | null,
  relative_physical_stats : number | null,
  trade_species: trade_species | null,
  turn_upside_down: boolean
  item: item | null

}
export interface EvolutionChainApiResponse {
  chain: ChainLinkAPI
}

 
function extractFlavorText(entries: { flavor_text: string; language: { name: string } }[], _lang = 'en'): string {
  const texts: string[] = []
  for (const entry of entries) {
    if(entry.language.name != "en") {
      continue
    }
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
  evolutionChain: ChainLink
}
//so all this are just going to be the same, but for the sake of readability, let's make one for each type except known_move due to being the same move?
interface held_item {
  name : string,
  url : string
}
interface known_move {
  name : string,
  url : string
}
interface location {
  name : string,
  url : string
}
interface party_species {
  name : string,
  url : string
}
interface trade_species {
  name: string;
  url: string 
}
interface item {
  name: string;
  url: string 
}
//this one created by the ai first for the pokemonType, but from reading apidocs, is the only one that has A LOT MORE parameters than the others, if I ever want to add them
interface type {
  name: string;
  url: string 
}
export async function fetchPokemonDetail(pokemonUrl: string, name:string): Promise<FullDetail> {
  if(name == "zygarde") {
    name = "zygarde-50"
  }
  const [detailRes, speciesRes] = await Promise.all([
    fetch(`${API_BASE}/pokemon/${name}`),
    fetch(pokemonUrl),
  ])

  if (!detailRes.ok) throw new Error('Failed to fetch Pokemon detail')
  if (!speciesRes.ok) throw new Error('Failed to fetch Pokemon species')

  const detail: PokemonDetailData = await detailRes.json()
  const speciesJson: { genera: { genus: string; language: { name: string } }[]; flavor_text_entries: { flavor_text: string; language: { name: string } }[]; evolution_chain: { url: string }; id: number } = await speciesRes.json()

  const genus = speciesJson.genera.find((g) => g.language.name === 'en')?.genus || 'Unknown'
  const flavorText = extractFlavorText(speciesJson.flavor_text_entries, 'en')
  const chainUrl = speciesJson.evolution_chain.url
  const baseUrl = chainUrl.substring(0, chainUrl.lastIndexOf('/'))
  let evolutionChain: FullDetail['evolutionChain'] = { species: { name: detail.name, url: baseUrl }, evolution_method: "", evolves_to: [] }
  try {
    const chainRes = await fetch(chainUrl)
    if (chainRes.ok) {
      const chainData: EvolutionChainApiResponse = await chainRes.json()
      function mapChainLink(link: ChainLinkAPI): ChainLink {
        const detail = link.evolution_details.length? link.evolution_details[0] : null; // Evolution_Details | undefined
        const final : ChainLink = { species: link.species, evolution_method: detail
            ? AssignEvolutionMethod(detail)
            : "", evolves_to: [] }
        link.evolves_to.forEach((child) => {
          final.evolves_to.push(mapChainLink(child) as ChainLink)
        })
        
        return final
      }
      evolutionChain = mapChainLink(chainData.chain)
      function formatName(name: string): string {
        return name
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }

      function AssignEvolutionMethod(Evolution_Detail: Evolution_Details): string {
        const extras: string[] = [];

        if (Evolution_Detail.min_level) extras.push(`at level ${Evolution_Detail.min_level}`);
        if (Evolution_Detail.min_happiness) extras.push(`with happiness ≥ ${Evolution_Detail.min_happiness}`);
        if (Evolution_Detail.min_beauty) extras.push(`with beauty ≥ ${Evolution_Detail.min_beauty}`);
        if (Evolution_Detail.min_affection) extras.push(`with affection ≥ ${Evolution_Detail.min_affection}`);
        if (Evolution_Detail.gender === 1) extras.push('(female only)');
        if (Evolution_Detail.gender === 2) extras.push('(male only)');
        if (Evolution_Detail.time_of_day) extras.push(`during the ${Evolution_Detail.time_of_day}`);
        if (Evolution_Detail.held_item) extras.push(`while holding ${formatName(Evolution_Detail.held_item.name)}`);
        if (Evolution_Detail.known_move) extras.push(`knowing ${formatName(Evolution_Detail.known_move.name)}`);
        if (Evolution_Detail.known_move_type) extras.push(`knowing a ${formatName(Evolution_Detail.known_move_type.name)}-type move`);
        if (Evolution_Detail.location) extras.push(`at ${formatName(Evolution_Detail.location.name)}`);
        if (Evolution_Detail.needs_overworld_rain) extras.push('while raining');
        if (Evolution_Detail.party_species) extras.push(`with ${formatName(Evolution_Detail.party_species.name)} in the party`);
        if (Evolution_Detail.party_type) extras.push(`with a ${formatName(Evolution_Detail.party_type.name)}-type Pokémon in the party`);
        if (Evolution_Detail.relative_physical_stats === 1) extras.push('(Attack > Defense)');
        if (Evolution_Detail.relative_physical_stats === 0) extras.push('(Attack = Defense)');
        if (Evolution_Detail.relative_physical_stats === -1) extras.push('(Attack < Defense)');
        if (Evolution_Detail.trade_species) extras.push(`traded for ${formatName(Evolution_Detail.trade_species.name)}`);
        if (Evolution_Detail.turn_upside_down) extras.push('while the console is upside down');

        let base: string;

        switch (Evolution_Detail.trigger.name) {
          case 'level-up':
            base = 'Level up';
            break;
          case 'trade':
            base = Evolution_Detail.held_item ? 'Trade while holding an item' : 'Trade';
            break;
          case 'use-item':
            base = Evolution_Detail.item ? `Use ${formatName(Evolution_Detail.item.name)}` : 'Use an item';
            break;
          case 'shed':
            base = 'Have a free party slot and a spare Poké Ball';
            break;
          case 'spin':
            base = 'Spin the Pokémon (Let\'s Go Pikachu/Eevee)';
            break;
          case 'tower-of-darkness':
            base = 'Train at the Tower of Darkness';
            break;
          case 'tower-of-waters':
            base = 'Train at the Tower of Waters';
            break;
          case 'three-critical-hits':
            base = 'Land 3 critical hits in a single battle';
            break;
          case 'take-damage':
            base = 'Take a set amount of damage at a specific spot';
            break;
          case 'agile-style-move':
            base = 'Use an Agile Style move 20 times';
            break;
          case 'strong-style-move':
            base = 'Use a Strong Style move 20 times';
            break;
          case 'recoil-damage':
            base = 'Take a cumulative amount of recoil damage';
            break;
          case 'other':
            base = 'Special condition';
            break;
          default:
            base = formatName(Evolution_Detail.trigger.name);
        }

        return extras.length ? `${base}, ${extras.join(', ')}` : base;
      }
    }
  } catch {
    const baseUrl = chainUrl.substring(0, chainUrl.lastIndexOf('/'))

    evolutionChain = { species: { name: detail.name, url: baseUrl }, evolution_method: "", evolves_to: [] }
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
