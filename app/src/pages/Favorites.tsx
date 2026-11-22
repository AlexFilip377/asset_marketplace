import { ProductCard } from '../components/ProductCard'
import { useShop } from '../state/shop'

export function Favorites() {
  const { products, favorites } = useShop()
  const items = products.filter((p) => favorites.includes(p.id))

  return (
    <>
      <h2 className="section-title">Избранное</h2>
      {items.length === 0 ? (
        <p className="empty">Пока пусто — нажмите сердечко на карточке</p>
      ) : (
        <div className="grid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  )
}
