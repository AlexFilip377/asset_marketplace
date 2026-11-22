import { useWallet } from '@solana/wallet-adapter-react'
import { useState, type FormEvent } from 'react'
import {
  CATEGORIES,
  DEMO_PRODUCTS,
  solToKzt,
  solToLamports,
} from '../data/demoCatalog'
import { useMarketplace } from '../solana/useMarketplace'

export function Sell() {
  const wallet = useWallet()
  const { listAsset, busy, error } = useMarketplace()
  const [ok, setOk] = useState<string | null>(null)
  const [title, setTitle] = useState('Stylized Sword 3D')
  const [description, setDescription] = useState('GLTF + текстуры 2K для игры')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('models')
  const [sol, setSol] = useState(0.1)

  const computedKzt = solToKzt(sol)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setOk(null)
    if (!wallet.connected) return
    await listAsset({
      title,
      description,
      category,
      priceKzt: computedKzt,
      priceLamports: solToLamports(sol),
      image: DEMO_PRODUCTS[0].image,
    })
    setOk('Токен создан и листинг опубликован в Solana Devnet')
  }

  return (
    <>
      <h2 className="section-title">Новое объявление</h2>
      <form className="sell-form" onSubmit={(e) => void onSubmit(e)}>
        <label>
          Название ассета
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            required
          />
        </label>

        <label>
          Описание
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
          />
        </label>

        <label>
          Категория
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as (typeof CATEGORIES)[number]['id'])
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Цена, SOL
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={sol}
            onChange={(e) => setSol(Math.max(0.01, Number(e.target.value)))}
          />
        </label>

        <div className="empty">Примерная цена в тенге: {computedKzt.toLocaleString('ru-RU')} ₸</div>

        <button
          className="checkout-btn"
          type="submit"
          disabled={busy || !wallet.connected}
        >
          <span>
            {busy
              ? 'Подписываем транзакцию...'
              : wallet.connected
                ? 'Опубликовать ончейн'
                : 'Сначала подключите кошелёк'}
          </span>
        </button>

        {error && <p className="status">{error}</p>}
        {ok && <p className="status ok">{ok}</p>}
      </form>
    </>
  )
}