import {extractFlavorText} from './utils'
import type { ChainLink, ChainLinkAPI, Evolution_Details, EvolutionChainApiResponse, FullDetail, PokemonDetailData, Species } from './types'
import type { CacheRepository } from '@/ports/CacheRepository'


const API_BASE = 'https://pokeapi.co/api/v2'


 async function cachedFetch<T>(  cacheRepository: CacheRepository, name: string): Promise<Promise<{ ok: boolean; json(): Promise<T>; text(): Promise<string>; }> | null> {
  const savedAsJson = await cacheRepository.apiCallSaved(name) as T | undefined
  if (savedAsJson) return new Promise(res => res({ ok: true, json: async () => savedAsJson, text: async () => '{}' }))
  return null
}
async function storeFetch<T>(  cacheRepository: CacheRepository, cache:T, name: string): Promise<void> {
  await cacheRepository.saveApiCall(cache, name)
}




export async function fetchPokemonDetail(pokemonUrl: string, name:string, cacheRepository: CacheRepository): Promise<FullDetail> {
  
  if(!name) throw new Error('Failed to get name from pokemonUrl')
  if(name == "zygarde") {
    name = "zygarde-50"
  }
  const detailStr = await cachedFetch<PokemonDetailData>(cacheRepository,'detail-' + name)
  const speciesStr = await cachedFetch<Species>(cacheRepository, 'species-' + name)
  const [detailRes, speciesRes] = await Promise.all([
    detailStr ? detailStr : fetch(`${API_BASE}/pokemon/${name}`),
    speciesStr? speciesStr: fetch(pokemonUrl),
  ])
  
  if (!detailRes.ok) throw new Error('Failed to fetch Pokemon detail')
  if (!speciesRes.ok) throw new Error('Failed to fetch Pokemon species')
  const detail: PokemonDetailData = await detailRes.json()
  const speciesJson: Species = await speciesRes.json()
  if(!detailStr) {
    await storeFetch(cacheRepository, detail,'detail-' + name)
    await storeFetch(cacheRepository, speciesJson,'species-' + name)
  }   


  const genus = speciesJson.genera.find((g) => g.language.name === 'en')?.genus || 'Unknown'
  const flavorText = extractFlavorText(speciesJson.flavor_text_entries, 'en')
  const chainUrl = speciesJson.evolution_chain.url
  const baseUrl = chainUrl.substring(0, chainUrl.lastIndexOf('/'))
  let evolutionChain: FullDetail['evolutionChain'] = { species: { name: detail.name, url: baseUrl }, evolution_method: "", evolves_to: [] }
  try {
    const storageName =  chainUrl.replace("https://pokeapi.co/api/v2/", "");
    const chainStr = await cachedFetch<EvolutionChainApiResponse>(cacheRepository, storageName)

    const chainRes =  chainStr ? await chainStr: await fetch(chainUrl)
    if (chainRes.ok) {
      const chainData: EvolutionChainApiResponse = await chainRes.json()
      if(!chainStr) await storeFetch(cacheRepository, chainData, storageName)
      

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
