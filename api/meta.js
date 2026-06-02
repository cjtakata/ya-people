import { requireAuth } from './_lib/auth.js'
import { getFieldOptions } from './_lib/pco.js'

// Crew is a select-type field; its valid options live in PCO. Sourcing the
// dropdown from here keeps the UI in lockstep with PCO and lets the server
// validate writes against the same authoritative list.
const CREW_FIELD_ID = '431524'

export default async function handler(req, res) {
  const user = await requireAuth(req, res)
  if (!user) return

  try {
    const crewOptions = await getFieldOptions(CREW_FIELD_ID)
    res.json({ crewOptions })
  } catch (err) {
    console.error('meta.js error:', err)
    res.status(500).json({ error: 'Failed to load metadata', detail: err.message })
  }
}
