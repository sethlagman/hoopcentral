import { Route, Routes } from 'react-router-dom'
import './styles/hoopcentral.css'
import AppShell from './components/layout/AppShell.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}
