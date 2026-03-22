const LINKS = ['About', 'Privacy Policy', 'Terms of Use', 'Contact', 'Help']

export default function SiteFooter() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">HoopCentral</div>
        <div className="footer-links">
          {LINKS.map((l) => (
            <a key={l} href="#">
              {l}
            </a>
          ))}
        </div>
        <div className="footer-copy">© 2026 HoopCentral. All rights reserved.</div>
      </div>
    </footer>
  )
}
