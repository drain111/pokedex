export function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
export function extractFlavorText(entries: { flavor_text: string; language: { name: string } }[], _lang = 'en'): string {
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