const LIST_META = {
  college:     { label: 'College Life', badgeCls: 'badge-college' },
  earlycareer: { label: 'Early Career', badgeCls: 'badge-early' },
  youngpro:    { label: 'Young Pro',    badgeCls: 'badge-youngpro' },
}

function fmtDate(ds) {
  if (!ds) return ''
  const d = new Date(ds + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function PersonRow({ person: p, selected, onClick }) {
  const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const lm = LIST_META[p.list] || { label: p.list, badgeCls: '' }
  const followupStatus = !p.followup ? 'none'
    : new Date(p.followup) < new Date() ? 'done' : 'pending'
  const followupLabel = p.followup ? fmtDate(p.followup) : 'No follow-up'

  return (
    <div className={`person-row${selected ? ' selected' : ''}`} onClick={onClick}>
      <div className="avatar" style={{ background: p.color }}>
        {p.avatar ? <img src={p.avatar} alt={initials} /> : initials}
      </div>
      <div className="person-info">
        <div className="person-name">{p.name}</div>
        <div className="person-chips">
          <span className={`badge ${lm.badgeCls}`}>{lm.label}</span>
          {p.crew && <span className="badge badge-crew">{p.crew}</span>}
          <span className={`badge ${p.active ? 'badge-active' : 'badge-inactive'}`}>
            {p.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <div className="person-meta-right">
        <div className={`followup-dot ${followupStatus}`} title={followupLabel} />
        <div className="followup-label">{followupLabel}</div>
      </div>
    </div>
  )
}
