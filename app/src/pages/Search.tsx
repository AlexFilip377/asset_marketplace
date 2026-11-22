import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { CATEGORIES } from '../data/demoCatalog'
import { useShop } from '../state/shop'

export function SearchPage() {
  const [params] = useSearchParams()
  const q = (params.get('q') ?? '').trim().toLowerCase()
  const { products } = useShop()

  const results = useMemo(() => {
    if (!q) return products
    const cat = CATEGORIES.find((c) => c.label.toLowerCase() === q || c.id === q)
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category === cat?.id ||
        p.category.includes(q),
    )
  }, [products, q])

  return (
    <>
      <h2 className="section-title">Нашли для Вас</h2>
      {results.length === 0 ? (
        <p className="empty">Ничего не найдено</p>
      ) : (
        <div className="grid">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  )
}
