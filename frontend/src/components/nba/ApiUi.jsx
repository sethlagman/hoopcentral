/** Shared loading / error placeholders for NBA API-backed panels. */

export function ApiState({ loading, error, empty, children }) {
  if (loading) return <div className="hc-api-msg">Loading…</div>
  if (error) return <div className="hc-api-msg hc-api-err">{String(error)}</div>
  if (empty) return <div className="hc-api-msg hc-muted">No data returned.</div>
  return children
}

export function HcToolbar({ children }) {
  return <div className="hc-toolbar">{children}</div>
}
