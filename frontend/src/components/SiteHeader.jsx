const NAV = ['Scores', 'Watch', 'Betting', 'Fantasy', 'Stories']

export default function SiteHeader() {
  return (
    <header>
      <div className="header-inner">
        <a className="logo" href="#">
          <span className="logo-box">HC</span>
          HoopCentral
        </a>
        <nav className="header-nav">
          {NAV.map((label) => (
            <a key={label} href="#">
              {label}
            </a>
          ))}
        </nav>
        <div className="header-right">
          <button type="button" className="search-icon-btn" aria-label="Search">
            🔍
          </button>
          <button type="button" className="signin-btn">
            Sign In
          </button>
        </div>
      </div>
    </header>
  )
}
