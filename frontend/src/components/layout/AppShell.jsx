import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ScoresTicker from '../ScoresTicker.jsx'
import SiteFooter from '../SiteFooter.jsx'
import SiteHeader from '../SiteHeader.jsx'

export default function AppShell({ children }) {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <ScoresTicker />
      <SiteHeader />
      <main className="main">{children}</main>
      <SiteFooter />
    </>
  )
}
