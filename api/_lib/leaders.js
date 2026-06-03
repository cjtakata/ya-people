// Maps a Discord user ID -> their crew assignment, for the "My Crew" view.
//
// Crew values are LIST KEYS:
//   'college'     → College Life (18-22)
//   'earlycareer' → Early Career (23-27)
//   'youngpro'    → Young Professional (28-30)
// Use ['*'] for leaders/admins who oversee ALL crews (no default filter).
//
// To find a leader's Discord ID: have them sign in — if they're not yet
// assigned, the app shows their ID at the top of the people list. Add them
// here and redeploy.

export const LEADERS = {
  // '123456789012345678': { name: 'Connor', crews: ['*'] },
  // '234567890123456789': { name: 'Jordan', crews: ['earlycareer'] },
  // '345678901234567890': { name: 'Sam',    crews: ['college'] },
}

const VALID_CREWS = new Set(['college', 'earlycareer', 'youngpro'])

// Returns the leader's crews as a list of valid keys, ['*'] for all-crew
// overseers, or [] if they aren't assigned to any crew.
export function getLeaderCrews(discordId) {
  const entry = LEADERS[discordId]
  if (!entry) return []
  if (entry.crews?.includes('*')) return ['*']
  return (entry.crews || []).filter(c => VALID_CREWS.has(c))
}
