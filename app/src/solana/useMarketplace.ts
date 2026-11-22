import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'
import { DEMO_PRODUCTS, KZT_PER_SOL, type Product } from '../data/demoCatalog'
import { useShop } from '../state/shop'
import {
  buyAssetOnChain,
  fetchListings,
  listAssetOnChain,
} from './program'

function toProduct(row: {
  listingPda: { toBase58: () => string }
  vaultPda: { toBase58: () => string }
  seller: { toBase58: () => string }
  mint: { toBase58: () => string }
  price: { toString: () => string }
}): Product {
  const mint = row.mint.toBase58()
  const lamports = row.price.toString()
  const sol = Number(lamports) / 1_000_000_000
  return {
    id: `onchain:${mint}`,
    title: 'Ончейн-ассет',
    description: 'Токенизированный ассет на Solana Devnet',
    image: DEMO_PRODUCTS[0].image,
    priceKzt: Math.round(sol * KZT_PER_SOL),
    oldPriceKzt: Math.round(sol * KZT_PER_SOL * 1.25),
    rating: 4.8,
    reviews: 12,
    category: 'models',
    onChain: true,
    mint,
    seller: row.seller.toBase58(),
    listingPda: row.listingPda.toBase58(),
    vaultPda: row.vaultPda.toBase58(),
    priceLamports: lamports,
  }
}

export function useMarketplace() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { setOnChainProducts, saveListingMeta, addPurchase } = useShop()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const rows = await fetchListings(connection)
      setOnChainProducts(rows.map(toProduct))
    } catch {
      setOnChainProducts([])
    }
  }, [connection, setOnChainProducts])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const listAsset = useCallback(
    async (opts: {
      title: string
      description: string
      category: Product['category']
      priceKzt: number
      priceLamports: number
      image: string
    }) => {
      setBusy(true)
      setError(null)
      try {
        const listed = await listAssetOnChain(
          connection,
          wallet,
          opts.priceLamports,
        )
        saveListingMeta(listed.mint.toBase58(), {
          title: opts.title,
          description: opts.description,
          image: opts.image,
          category: opts.category,
          priceKzt: opts.priceKzt,
        })
        await refresh()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
        throw e
      } finally {
        setBusy(false)
      }
    },
    [connection, wallet, saveListingMeta, refresh],
  )

  const buyAsset = useCallback(
    async (product: Product) => {
      if (!product.mint || !product.seller || !product.listingPda || !product.vaultPda) {
        throw new Error('Этот товар не опубликован ончейн')
      }
      setBusy(true)
      setError(null)
      try {
        const signature = await buyAssetOnChain(connection, wallet, {
          mint: product.mint,
          seller: product.seller,
          listingPda: product.listingPda,
          vaultPda: product.vaultPda,
        })
        addPurchase({
          ...product,
          boughtAt: new Date().toISOString(),
          signature,
        })
        await refresh()
        return signature
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
        throw e
      } finally {
        setBusy(false)
      }
    },
    [connection, wallet, addPurchase, refresh],
  )

  return { busy, error, setError, refresh, listAsset, buyAsset }
}