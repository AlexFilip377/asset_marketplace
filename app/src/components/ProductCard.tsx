import { Heart, ShoppingCart, Star } from 'lucide-react'
import { formatKzt, lamportsToSol, type Product } from '../data/demoCatalog'
import { useShop } from '../state/shop'

export function ProductCard({ product }: { product: Product }) {
  const { favorites, toggleFavorite, addToCart } = useShop()
  const liked = favorites.includes(product.id)

  return (
    <article className="card">
      <div className="card-img">
        <img src={product.image} alt={product.title} />
        <button
          className={`heart ${liked ? 'on' : ''}`}
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label="Избранное"
        >
          <Heart
            size={16}
            strokeWidth={2}
            fill={liked ? 'currentColor' : 'none'}
          />
        </button>
        <button
          className="cart-fab"
          type="button"
          onClick={() => addToCart(product.id)}
          aria-label="В корзину"
        >
          <ShoppingCart size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="card-meta">
        <div>
          <span className="price">{formatKzt(product.priceKzt)}</span>
          <span className="old">{formatKzt(product.oldPriceKzt)}</span>
        </div>
        <div className="desc">{product.title}</div>
        <div className="stars">
          <Star size={13} className="star-icon" />
          <span>
            {product.rating} · {product.reviews} оценок
          </span>
        </div>
        {product.onChain && product.priceLamports && (
          <div className="chain-tag">
            ончейн {lamportsToSol(product.priceLamports)}
          </div>
        )}
      </div>
    </article>
  )
}