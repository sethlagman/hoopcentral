import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Logo({ src, label, className = 'logo-img' }) {
  const [failed, setFailed] = useState(false)
  const text = String(label || 'NBA').replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || 'NBA'
  if (!src || failed) {
    return <span className={`logo-fallback ${className}`}>{text}</span>
  }
  return <img src={src} alt="" className={className} loading="lazy" onError={() => setFailed(true)} />
}

export function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {index > 0 ? <span aria-hidden="true"> / </span> : null}
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export function PageTitle({ title, children }) {
  return (
    <div className="page-head">
      <h1 className="page-title">{title}</h1>
      {children}
    </div>
  )
}

export function Block({ title, extra, children }) {
  return (
    <section className="section-block">
      <div className="page-head">
        <h2 className="section-label">{title}</h2>
        {extra}
      </div>
      {children}
    </section>
  )
}

export function Pager({ page, count, pageSize, onPage, disabled }) {
  const pages = Math.max(1, Math.ceil((count || 0) / pageSize))
  return (
    <div className="hc-toolbar">
      <span className="hc-toolbar-meta">
        Page {page} of {pages} · {count || 0}
      </span>
      <button
        type="button"
        className="hc-btn hc-btn-ghost"
        disabled={disabled || page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Prev
      </button>
      <button
        type="button"
        className="hc-btn hc-btn-ghost"
        disabled={disabled || page >= pages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </div>
  )
}

export function SeasonForm({ value, onChange, onSubmit, disabled }) {
  return (
    <form className="hc-toolbar" onSubmit={onSubmit}>
      <input
        className="hc-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Season"
        placeholder="Season (2025-26)"
      />
      <button type="submit" className="hc-btn" disabled={disabled}>
        Apply
      </button>
    </form>
  )
}
