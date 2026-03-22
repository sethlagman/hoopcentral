export default function SectionHeader({ title, moreHref = '#', moreLabel }) {
  return (
    <div className="section-header">
      <span className="section-title">{title}</span>
      {moreLabel ? (
        <a className="section-more" href={moreHref}>
          {moreLabel}
        </a>
      ) : null}
    </div>
  )
}
