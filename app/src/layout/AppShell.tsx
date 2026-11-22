import { Outlet } from 'react-router-dom'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { useMarketplace } from '../solana/useMarketplace'

export function AppShell() {
  useMarketplace()
  return (
    <div className="app-shell">
      <Header />
      <Sidebar />
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}
