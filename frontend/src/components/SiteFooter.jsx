import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/teams', label: 'Teams' },
  { to: '/players', label: 'Players' },
  { to: '/standings', label: 'Standings' },
  { to: '/stats', label: 'Stats' },
  { to: '/schedule', label: 'Schedule' },
]

export default function SiteFooter() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">HoopCentral</div>
        <div className="footer-links">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="footer-copy">© 2026 HoopCentral. All rights reserved.</div>
      </div>
    </footer>
  )
}
