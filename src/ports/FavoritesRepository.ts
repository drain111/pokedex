export interface FavoritesRepository {
  getFavorites(): number[]
  isFavorite(id: number): boolean
  toggleFavorite(id: number): void
  subscribe(callback: (favorites: number[]) => void): () => void // for reactivity
}