import { useState, useEffect } from 'react'

const LIST_META = {
  college:     { label: 'College Life', badgeCls: 'badge-college' },
  earlycareer: { label: 'Early Career', badgeCls: 'badge-early' },
  youngpro:    { label: 'Young Pro',    badgeCls: 'badge-youngpro' },
}

const CREW_OPTIONS = [
  '',
  'College Life',
  'Early Career',
  'Young Professionals',
]

export default function DetailPanel({ person, onClose, onSave }) {
  const [draft, setDraft]     = useState(null)
  const [unsaved, setUnsaved] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    if (!person) return
    setDraft({
      active:   person.active,
      inGroup:  person.inGroup,
      crew:     person.crew || '',
      followup: person.followup || '',
      notes:    person.notes || '',
    })
    setUnsaved(false)
    setSaved(false)
  }, [person?.id])

  if (!person) {
    return (
      <div className="detail-pane hidden">
        <div className="detail-empty">
          <p>Select a person to view and edit their YA profile.</p>
        </div>
      </div>
    )
  }

  const lm       = LIST_META[person.list] || { label: person.list, badgeCls: '' }
  const initials = person.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  function update(field, value) {
    setDraft(d => ({ ...d, [field]: value }))
    setUnsaved(true)
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(person.id, {
        fields:       draft,
        fieldDataIds: person._fieldDataIds || {},
      })
      setUnsaved(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert('Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!draft) return null

  return (
    <div className={`detail-pane${window.innerWidth <= 700 ? ' open' : ''}`}>
      <div className="detail-header">
        <div className="detail-header-top">
          <div className="detail-person">
            <div className="detail-avatar" style={{ background: person.color }}>
              {person.avatar ? <img src={person.avatar} alt={initials} /> : initials}
            </div>
            <div>
              <div className="detail-name">{person.name}</div>
              <div className="detail-email">{person.email}</div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a
            className="pco-link"
            href={`https://people.planningcenteronline.com/people/AC${person.id}`}
            target="_blank"
            rel="noreferrer"
          >
            ↗ View in PCO
          </a>
          <span className={`badge ${lm.badgeCls}`}>{lm.label}</span>
        </div>
      </div>

      <div className="detail-body">
        {/* PCO read-only info */}
        <div>
          <div className="field-section-title">From Planning Center</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">Phone</div>
              <div className="info-item-value">{person.phone || '—'}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Age</div>
              <div className="info-item-value">{person.age ?? '—'}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Member since</div>
              <div className="info-item-value">{person.since || '—'}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Gender</div>
              <div className="info-item-value">{person.gender || '—'}</div>
            </div>
          </div>
        </div>

        {/* YA custom fields */}
        <div>
          <div className="field-section-title">
            YA Custom Fields
            <span className={`unsaved-dot${unsaved ? ' show' : ''}`} />
          </div>

          <div className="field-row">
            <div>
              <div className="field-label">Active in YA</div>
              <div className="field-sub">Regularly attending and engaged</div>
            </div>
            <button
              className={`toggle ${draft.active ? 'on' : 'off'}`}
              onClick={() => update('active', !draft.active)}
            />
          </div>

          <div className="field-row">
            <div>
              <div className="field-label">In Small Group</div>
              <div className="field-sub">Connected to a crew or small group</div>
            </div>
            <button
              className={`toggle ${draft.inGroup ? 'on' : 'off'}`}
              onClick={() => update('inGroup', !draft.inGroup)}
            />
          </div>

          <div className="field-stack-wrap">
            <div className="field-stack">
              <div className="field-label">Crew</div>
              <select
                className="field-select"
                value={draft.crew}
                onChange={e => update('crew', e.target.value)}
              >
                <option value="">— Not assigned —</option>
                {CREW_OPTIONS.filter(Boolean).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-stack-wrap">
            <div className="field-stack">
              <div className="field-label">Last Followed Up</div>
              <input
                type="date"
                className="field-date"
                value={draft.followup}
                onChange={e => update('followup', e.target.value)}
              />
            </div>
          </div>

          <div className="field-stack-wrap" style={{ borderBottom: 'none' }}>
            <div className="field-stack">
              <div className="field-label">Leader Notes</div>
              <textarea
                className="field-textarea"
                placeholder="Private notes visible only to leaders…"
                value={draft.notes}
                onChange={e => update('notes', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="detail-footer">
        <button className="btn-cancel" onClick={onClose}>Cancel</button>
        <button
          className={`btn-save${saved ? ' saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save to PCO'}
        </button>
      </div>
    </div>
  )
}
