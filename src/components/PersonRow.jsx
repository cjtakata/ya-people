import { LIST_META } from './listMeta.js'

export default function PersonRow({ person: p, selected, onClick }) {
  const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const lm = LIST_META[p.list] || { crew: p.list, badgeCls: '' }

  return (
    <div className={`person-row${selected ? ' selected' : ''}`} onClick={onClick}>
      <div className="avatar" style={{ background: p.color }}>
        {p.avatar ? <img src={p.avatar} alt={initials} /> : initials}
      </div>
      <div className="person-info">
        <div className="person-name">{p.name}</div>
        <div className="person-chips">
          <span className={`badge ${lm.badgeCls}`}>{lm.crew}</span>
        </div>
      </div>
      <div className="person-meta-right">
        <div
          className={`followup-dot ${p.needsFollowup ? 'pending' : 'done'}`}
          title={p.needsFollowup ? 'Needs follow-up' : 'No follow-up needed'}
        />
        <div className="followup-label">{p.needsFollowup ? 'Follow up' : ''}</div>
      </div>
    </div>
  )
}
