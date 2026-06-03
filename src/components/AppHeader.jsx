import { useState, useRef, useEffect } from 'react'
import { CREW_OPTIONS, CREW_LABEL } from './listMeta.js'

const LOGO = <img src="/ya.svg" alt="YA" />

export default function AppHeader({ user, onLogout, listCount, myCrew, onChooseCrew }) {
  const initials = (user.global_name || user.username || '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const crewLabel = myCrew && myCrew !== 'all' ? CREW_LABEL[myCrew] : null

  function pick(key) {
    onChooseCrew(key)
    setOpen(false)
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-logo">{LOGO}</div>
        <div>
          <div className="app-title">YA People</div>
          <div className="app-subtitle">Planning Center · {listCount} people</div>
        </div>
      </div>
      <div className="header-right">
        <div className="user-menu" ref={menuRef}>
          <button
            className="user-chip"
            onClick={() => setOpen(o => !o)}
            aria-haspopup="true"
            aria-expanded={open}
          >
            <div className="user-avatar">
              {user.avatar ? <img src={user.avatar} alt={initials} /> : initials}
            </div>
            <div className="user-chip-text">
              <span className="user-name">{user.global_name || user.username}</span>
              {crewLabel && <span className="user-crew">{crewLabel}</span>}
            </div>
            <span className="user-chip-caret">▾</span>
          </button>

          {open && (
            <div className="user-dropdown" role="menu">
              <div className="user-dropdown-label">Your crew</div>
              {CREW_OPTIONS.map(o => (
                <button
                  key={o.key}
                  className={`user-dropdown-item${(myCrew || 'all') === o.key ? ' selected' : ''}`}
                  onClick={() => pick(o.key)}
                  role="menuitemradio"
                  aria-checked={(myCrew || 'all') === o.key}
                >
                  <span className="check">{(myCrew || 'all') === o.key ? '✓' : ''}</span>
                  {o.label}
                </button>
              ))}
              <div className="user-dropdown-divider" />
              <button className="user-dropdown-item signout" onClick={onLogout} role="menuitem">
                Sign out
              </button>
            </div>
          )}
        </div>
        <button className="logout-btn" onClick={onLogout}>Sign out</button>
      </div>
    </header>
  )
}
