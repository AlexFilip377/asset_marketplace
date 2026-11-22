import { ProductCard } from '../components/ProductCard'
import { useShop } from '../state/shop'

export function Home() {
  const { products } = useShop()
  return (
    <>
      <section className="banner">
        <h1>GAME ASSETS ON SOLANA</h1>
      </section>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  )
}