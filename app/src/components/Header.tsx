import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Bell, MessageCircle, Search } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { POPULAR_SEARCHES } from '../data/demoCatalog'
import { useShop } from '../state/shop'

export function Header() {
  const navigate = useNavigate()
  const { searchHistory, rememberSearch } = useShop()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function submit(e: FormEvent) {
    e.preventDefault()
    rememberSearch(q)
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  function pick(value: string) {
    setQ(value)
    rememberSearch(value)
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(value)}`)
  }

  function ping(msg: string) {
    setNotice(msg)
    setTimeout(() => setNotice((curr) => (curr === msg ? null : curr)), 2500)
  }

  return (
    <header className="header">
      <Link to="/" className="logo">
        GameInsight
      </Link>

      <div className="search-wrap" ref={wrapRef}>
        <form className="search-form" onSubmit={submit}>
          <input
            value={q}
            placeholder="Что ищете?"
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setOpen(true)}
          />
          <button type="submit" aria-label="Поиск">
            <Search size={18} strokeWidth={1.8} />
          </button>
        </form>

        {open && (
          <div className="search-dropdown">
            <h4>Вы искали</h4>
            <ul>
              {(searchHistory.length ? searchHistory : ['Low-Poly Knight Rig']).map(
                (item) => (
                  <li key={item} onClick={() => pick(item)}>
                    {item}
                  </li>
                ),
              )}
            </ul>
            <h4>Часто ищут</h4>
            <ul>
              {POPULAR_SEARCHES.map((item) => (
                <li key={item} onClick={() => pick(item)}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="header-actions">
        <button
          className="support-btn"
          type="button"
          onClick={() => ping('Сеть: Solana Devnet · Поддержка готова')}
        >
          <MessageCircle size={16} strokeWidth={1.8} />
          <span>Поддержка</span>
        </button>

        <WalletMultiButton />

        <button
          className="icon-btn"
          type="button"
          aria-label="Уведомления"
          onClick={() => ping('Новых системных уведомлений нет')}
        >
          <Bell size={18} strokeWidth={1.8} />
        </button>
      </div>

      {notice && (
        <div
          style={{
            position: 'fixed',
            top: 66,
            right: 88,
            background: '#111',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 999,
            fontSize: 12,
            zIndex: 40,
          }}
        >
          {notice}
        </div>
      )}
    </header>
  )
}