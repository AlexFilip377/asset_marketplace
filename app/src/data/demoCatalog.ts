export type CategoryId =
  | 'sprites'
  | 'models'
  | 'sfx'
  | 'music'
  | 'ui'
  | 'environment'
  | 'animations'

export type Product = {
  id: string
  title: string
  description: string
  image: string
  priceKzt: number
  oldPriceKzt: number
  rating: number
  reviews: number
  category: CategoryId
  onChain?: boolean
  mint?: string
  seller?: string
  listingPda?: string
  vaultPda?: string
  priceLamports?: string
}

export const KZT_PER_SOL = 60000

const ASSET_IMAGES: Record<CategoryId, string> = {
  models:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  sprites:
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
  sfx:
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80',
  music:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  ui:
    'https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=600&q=80',
  environment:
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  animations:
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
}

export const CATEGORIES: {
  id: CategoryId
  label: string
  code: string
}[] = [
  { id: 'sprites', label: 'Sprites', code: 'SP' },
  { id: 'models', label: 'Models', code: 'MD' },
  { id: 'sfx', label: 'SFX', code: 'S' },
  { id: 'music', label: 'Music', code: 'MU' },
  { id: 'ui', label: 'UI', code: 'U' },
  { id: 'environment', label: 'Environment', code: 'E' },
  { id: 'animations', label: 'Animations', code: 'A' },
]

const DEMO_TITLES: { title: string; description: string; category: CategoryId }[] = [
  { title: 'Low-Poly Knight Rig', description: '3D персонаж для RPG + анимации', category: 'models' },
  { title: 'Cyberpunk Pixel Sprites', description: 'Набор 2D-спрайтов 64x64', category: 'sprites' },
  { title: 'Footsteps & Foley Pack', description: 'Звуки шагов, ударов и окружения', category: 'sfx' },
  { title: 'Synthwave Boss Theme', description: 'Луп-треки WAV для экшена', category: 'music' },
  { title: 'Sci-Fi HUD Kit', description: 'Интерфейс, иконки и панели', category: 'ui' },
  { title: 'Ancient Ruins Props', description: 'Модульные ассеты локаций', category: 'environment' },
  { title: 'Combat Locomotion', description: 'Бег, перекаты, удары мечом', category: 'animations' },
  { title: 'Medieval Weapons Pack', description: 'Мечи, щиты, топоры в FBX/GLTF', category: 'models' },
  { title: 'Magic Spell SFX', description: 'Эффекты заклинаний и баффов', category: 'sfx' },
  { title: 'Ambient Dungeon OST', description: 'Атмосферный эмбиент для уровней', category: 'music' },
  { title: 'Inventory & Shop UI', description: 'Экраны инвентаря и магазина', category: 'ui' },
  { title: 'Neon City Pack', description: 'Вывески, дроны и элементы улиц', category: 'environment' },
]

export const POPULAR_SEARCHES = [
  'Low-Poly Knight Rig',
  'Cyberpunk Pixel Sprites',
  'Footsteps & Foley Pack',
  'Synthwave Boss Theme',
  'Sci-Fi HUD Kit',
]

export const DEMO_PRODUCTS: Product[] = DEMO_TITLES.map((item, i) => ({
  id: `demo-${i + 1}`,
  title: item.title,
  description: item.description,
  image: ASSET_IMAGES[item.category],
  priceKzt: 30000,
  oldPriceKzt: 40000,
  rating: 4.6,
  reviews: 1111,
  category: item.category,
}))

export function formatKzt(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU')} ₸`
}

export function lamportsToSol(lamports: string | number): string {
  const n = typeof lamports === 'string' ? Number(lamports) : lamports
  return `${(n / 1_000_000_000).toFixed(2)} SOL`
}

export function solToLamports(sol: number): number {
  return Math.max(1, Math.round(sol * 1_000_000_000))
}

export function solToKzt(sol: number): number {
  return Math.round(sol * KZT_PER_SOL)
}