import { Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { Cart } from './pages/Cart'
import { Categories } from './pages/Categories'
import { Favorites } from './pages/Favorites'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { SearchPage } from './pages/Search'
import { Sell } from './pages/Sell'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sell" element={<Sell />} />
      </Route>
    </Routes>
  )
}
