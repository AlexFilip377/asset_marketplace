import { useWallet } from '@solana/wallet-adapter-react'
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  formatKzt,
  lamportsToSol,
  type Product,
} from '../data/demoCatalog'
import { useMarketplace } from '../solana/useMarketplace'
import { useShop } from '../state/shop'

export function Cart() {
  const { cart, products, favorites, removeFromCart, toggleFavorite } = useShop()
  const items = products.filter((p) => cart.includes(p.id))
  const wallet = useWallet()
  const { buyAsset, busy, error } = useMarketplace()
  const [ok, setOk] = useState<string | null>(null)

  const listed = items.filter((p) => p.onChain)
  const demoOnly = items.filter((p) => !p.onChain)
  const totalKzt = items.reduce((s, p) => s + p.priceKzt, 0)

  async function buySingle(item: Product) {
    setOk(null)
    if (!wallet.connected) {
      throw new Error('Подключите кошелёк')
    }
    if (!item.onChain) {
      throw new Error('Демо-товар нельзя купить в блокчейне — опубликуйте через «+»')
    }
    const sig = await buyAsset(item)
    setOk(`Куплено в Solana! Подпись: ${sig.slice(0, 14)}…`)
  }

  async function checkout() {
    setOk(null)
    if (!wallet.connected) {
      throw new Error('Подключите кошелёк')
    }
    if (listed.length === 0) {
      throw new Error('В корзине нет ончейн-листингов. Опубликуйте товар через «+».')
    }
    for (const item of listed) {
      await buyAsset(item)
    }
    setOk('Покупка отправлена в сеть')
  }

  return (
    <>
      <h2 className="section-title">Корзина</h2>
      <div className="cart-layout">
        <div>
          {items.length === 0 && <p className="empty">Корзина пуста</p>}
          {items.map((p) => {
            const liked = favorites.includes(p.id)
            return (
              <div className="cart-row" key={p.id}>
                <input type="checkbox" defaultChecked />
                <img src={p.image} alt={p.title} />
                <div>
                  <div>{p.title}</div>
                  <div className="stars">
                    <Star size={13} className="star-icon" />
                    <span>
                      {p.rating} · {p.reviews} оценок
                    </span>
                  </div>
                  {p.onChain && (
                    <button
                      className="ghost-btn"
                      type="button"
                      disabled={busy}
                      onClick={() => void buySingle(p).catch(() => undefined)}
                    >
                      Купить ончейн
                    </button>
                  )}
                </div>

                <div className="price">
                  {formatKzt(p.priceKzt)}
                  <div className="old">{formatKzt(p.oldPriceKzt)}</div>
                  {p.priceLamports && (
                    <div className="chain-tag">{lamportsToSol(p.priceLamports)}</div>
                  )}
                </div>

                <div className="row-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Избранное"
                    onClick={() => toggleFavorite(p.id)}
                  >
                    <Heart
                      size={16}
                      strokeWidth={1.8}
                      fill={liked ? '#e11d48' : 'none'}
                      color={liked ? '#e11d48' : 'currentColor'}
                    />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Удалить из корзины"
                    onClick={() => removeFromCart(p.id)}
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <aside className="order-card">
          <div>Товары в заказе: {items.length}</div>
          <div className="thumbs">
            {items.slice(0, 3).map((p) => (
              <img key={p.id} src={p.image} alt={p.title} />
            ))}
          </div>

          {demoOnly.length > 0 && (
            <p className="empty">
              Демо-карточки ({demoOnly.length}) не покупаются ончейн. В оплату
              пойдут только опубликованные листинги.
            </p>
          )}

          <button
            className="checkout-btn"
            type="button"
            disabled={busy}
            onClick={() => void checkout().catch(() => undefined)}
          >
            <ShoppingCart size={16} strokeWidth={2} />
            <span>Оформить</span>
            <span>{formatKzt(totalKzt)}</span>
          </button>

          {error && <p className="status">{error}</p>}
          {ok && <p className="status ok">{ok}</p>}
        </aside>
      </div>
    </>
  )
}