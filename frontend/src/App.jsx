import { Route, Routes } from 'react-router-dom'
import './styles/hoopcentral.css'
import AppShell from './components/layout/AppShell.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PlayerPage from './pages/PlayerPage.jsx'
import PlayersPage from './pages/PlayersPage.jsx'
import TeamPage from './pages/TeamPage.jsx'
import TeamsPage from './pages/TeamsPage.jsx'

function NotFound() {
  return (
    <>
      <h1 className="page-title">Page not found</h1>
      <p className="hc-muted">That address is not part of HoopCentral.</p>
    </>
  )
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/:teamId" element={<TeamPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:playerId" element={<PlayerPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}
