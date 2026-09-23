export interface Species {
    genera: { 
        genus: string; 
        language: { name: string } 
    }[]; 
    flavor_text_entries: { 
        flavor_text: string; 
        language: { name: string } 
    }[]; 
    evolution_chain: { url: string }; 
    id: number
}
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
//this one created by the ai first for the pokemonType, but from reading apidocs, is the only one that has A LOT MORE parameters than the others, if I ever want to add them
export interface type {
  name: string;
  url: string 
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