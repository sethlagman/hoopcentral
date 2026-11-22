import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/teams', label: 'Teams' },
  { to: '/players', label: 'Players' },
  { to: '/standings', label: 'Standings' },
  { to: '/stats', label: 'Stats' },
  { to: '/leaders', label: 'Leaders' },
  { to: '/schedule', label: 'Schedule' },
]

export default function SiteHeader() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const search = (event) => {
    event.preventDefault()
    const text = query.trim()
    if (!text) return
    navigate(`/search?q=${encodeURIComponent(text)}`)
  }

  return (
    <header>
      <div className="header-inner">
        <Link className="logo" to="/">
          <span className="logo-box">HC</span>
          HoopCentral
        </Link>
        <nav className="header-nav" aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <form className="header-search" onSubmit={search}>
          <input
            className="hc-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search players, teams"
            aria-label="Search players and teams"
          />
        </form>
      </div>
    </header>
  )
}
