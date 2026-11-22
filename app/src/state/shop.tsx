import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEMO_PRODUCTS, KZT_PER_SOL, type Product } from '../data/demoCatalog'

const KEY = 'gameinsight-shop-v2'

type Meta = {
  title: string
  description: string
  image: string
  category: Product['category']
  priceKzt: number
}

type Purchase = Product & { boughtAt: string; signature?: string }

type ShopState = {
  favorites: string[]
  cart: string[]
  searchHistory: string[]
  metadata: Record<string, Meta>
  hiddenOnChainIds: string[]
  purchases: Purchase[]
}

const empty: ShopState = {
  favorites: [],
  cart: [],
  searchHistory: [],
  metadata: {},
  hiddenOnChainIds: [],
  purchases: [],
}

function load(): ShopState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

type ShopContextValue = ShopState & {
  products: Product[]
  setOnChainProducts: (items: Product[]) => void
  toggleFavorite: (id: string) => void
  addToCart: (id: string) => void
  removeFromCart: (id: string) => void
  rememberSearch: (q: string) => void
  saveListingMeta: (mint: string, meta: Meta) => void
  hideOnChainProduct: (id: string) => void
  addPurchase: (item: Purchase) => void
  getProduct: (id: string) => Product | undefined
}

const ShopContext = createContext<ShopContextValue | null>(null)

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>(load)
  const [onChain, setOnChainProducts] = useState<Product[]>([])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const products = useMemo(() => {
    const mapped = onChain
      .filter((p) => !state.hiddenOnChainIds.includes(p.id))
      .map((p) => {
        const meta = p.mint ? state.metadata[p.mint] : undefined
        const solPrice = p.priceLamports
          ? Number(p.priceLamports) / 1_000_000_000
          : 0.5
        return meta
          ? {
              ...p,
              title: meta.title,
              description: meta.description,
              image: meta.image,
              category: meta.category,
              priceKzt: meta.priceKzt || Math.round(solPrice * KZT_PER_SOL),
            }
          : {
              ...p,
              priceKzt: Math.round(solPrice * KZT_PER_SOL),
            }
      })
    return [...mapped, ...DEMO_PRODUCTS]
  }, [onChain, state.metadata, state.hiddenOnChainIds])

  const toggleFavorite = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      favorites: s.favorites.includes(id)
        ? s.favorites.filter((x) => x !== id)
        : [...s.favorites, id],
    }))
  }, [])

  const addToCart = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      cart: s.cart.includes(id) ? s.cart : [...s.cart, id],
    }))
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setState((s) => ({ ...s, cart: s.cart.filter((x) => x !== id) }))
  }, [])

  const rememberSearch = useCallback((q: string) => {
    const t = q.trim()
    if (!t) return
    setState((s) => ({
      ...s,
      searchHistory: [t, ...s.searchHistory.filter((x) => x !== t)].slice(0, 8),
    }))
  }, [])

  const saveListingMeta = useCallback((mint: string, meta: Meta) => {
    setState((s) => ({ ...s, metadata: { ...s.metadata, [mint]: meta } }))
  }, [])

  const hideOnChainProduct = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      hiddenOnChainIds: s.hiddenOnChainIds.includes(id)
        ? s.hiddenOnChainIds
        : [...s.hiddenOnChainIds, id],
      cart: s.cart.filter((x) => x !== id),
    }))
  }, [])

  const addPurchase = useCallback((item: Purchase) => {
    setState((s) => ({
      ...s,
      purchases: [item, ...s.purchases],
      cart: s.cart.filter((id) => id !== item.id),
    }))
  }, [])

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  )

  const value = useMemo(
    () => ({
      ...state,
      products,
      setOnChainProducts,
      toggleFavorite,
      addToCart,
      removeFromCart,
      rememberSearch,
      saveListingMeta,
      hideOnChainProduct,
      addPurchase,
      getProduct,
    }),
    [
      state,
      products,
      toggleFavorite,
      addToCart,
      removeFromCart,
      rememberSearch,
      saveListingMeta,
      hideOnChainProduct,
      addPurchase,
      getProduct,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('ShopProvider missing')
  return ctx
}