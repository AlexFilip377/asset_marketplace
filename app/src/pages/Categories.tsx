import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/demoCatalog'

export function Categories() {
  return (
    <>
      <h2 className="section-title">Категории</h2>
      <div className="cat-grid">
        {CATEGORIES.map((c) => (
          <Link key={c.id} className="cat-tile" to={`/search?q=${c.id}`}>
            <small>{c.label}</small>
            <b>{c.code}</b>
          </Link>
        ))}
      </div>
    </>
  )
}