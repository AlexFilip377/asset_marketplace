import { useWallet } from '@solana/wallet-adapter-react'
import { Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { formatKzt, lamportsToSol } from '../data/demoCatalog'
import { useShop } from '../state/shop'

export function Profile() {
  const [tab, setTab] = useState<'listings' | 'history'>('listings')
  const wallet = useWallet()
  const { products, purchases, hideOnChainProduct } = useShop()

  const mine = products.filter(
    (p) =>
      p.onChain &&
      wallet.publicKey &&
      p.seller === wallet.publicKey.toBase58(),
  )

  return (
    <>
      <div className="tabs">
        <button
          className={tab === 'listings' ? 'on' : ''}
          type="button"
          onClick={() => setTab('listings')}
        >
          Ваши объявления
        </button>
        <button
          className={tab === 'history' ? 'on' : ''}
          type="button"
          onClick={() => setTab('history')}
        >
          История покупок
        </button>
      </div>

      {tab === 'listings' &&
        (mine.length === 0 ? (
          <p className="empty">
            Нет опубликованных объявлений. Создайте через иконку «+» в боковом меню.
          </p>
        ) : (
          mine.map((p) => (
            <div className="listing-row" key={p.id}>
              <img src={p.image} alt={p.title} />
              <div>
                <div>{p.title}</div>
                <div className="stars">
                  <Star size={13} className="star-icon" />
                  <span>
                    {p.rating} · {p.reviews} оценок
                  </span>
                </div>
                {p.mint && (
                  <div className="chain-tag">Mint: {p.mint.slice(0, 14)}…</div>
                )}
              </div>
              <div className="price">
                {formatKzt(p.priceKzt)}
                <div className="old">{formatKzt(p.oldPriceKzt)}</div>
                {p.priceLamports && (
                  <div className="chain-tag">{lamportsToSol(p.priceLamports)}</div>
                )}
              </div>
              <div>
                <button
                  className="icon-btn"
                  type="button"
                  aria-label="Скрыть из списка"
                  onClick={() => hideOnChainProduct(p.id)}
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ))
        ))}

      {tab === 'history' &&
        (purchases.length === 0 ? (
          <p className="empty">Покупок пока нет</p>
        ) : (
          purchases.map((p) => (
            <div className="listing-row" key={`${p.id}-${p.boughtAt}`}>
              <img src={p.image} alt={p.title} />
              <div>
                <div>{p.title}</div>
                {p.signature && (
                  <div className="chain-tag">Tx: {p.signature.slice(0, 16)}…</div>
                )}
              </div>
              <div className="price">{formatKzt(p.priceKzt)}</div>
              <div />
            </div>
          ))
        ))}
    </>
  )
}