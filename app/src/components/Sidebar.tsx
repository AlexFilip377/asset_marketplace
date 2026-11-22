import {
  Heart,
  Home,
  LayoutGrid,
  PlusCircle,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useShop } from '../state/shop'

const items = [
  { to: '/search', label: 'Поиск', Icon: Search },
  { to: '/', label: 'Главная', Icon: Home },
  { to: '/categories', label: 'Категории', Icon: LayoutGrid },
  { to: '/sell', label: 'Создать ассет', Icon: PlusCircle },
  { to: '/favorites', label: 'Избранное', Icon: Heart },
  { to: '/cart', label: 'Корзина', Icon: ShoppingCart, badge: 'cart' as const },
  { to: '/profile', label: 'Профиль', Icon: User },
]

export function Sidebar() {
  const { cart } = useShop()

  return (
    <nav className="sidebar" aria-label="Навигация">
      {items.map(({ to, label, Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          aria-label={label}
          end={to === '/'}
        >
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <Icon size={18} strokeWidth={1.8} />
            {badge === 'cart' && cart.length > 0 && (
              <span className="badge-count">{cart.length}</span>
            )}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}