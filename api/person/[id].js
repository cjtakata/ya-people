import { requireAuth } from '../_lib/auth.js'
import { pcoFetch, getFieldDefinitions } from '../_lib/pco.js'

const FIELD_ENV_MAP = {
  active:  'PCO_FIELD_ACTIVE',
  followup: 'PCO_FIELD_FOLLOWUP',
  crew:    'PCO_FIELD_CREW',
  inGroup: 'PCO_FIELD_SMALL_GROUP',
  notes:   'PCO_FIELD_NOTES',
}

export default async function handler(req, res) {
  const user = await requireAuth(req, res)
  if (!user) return

  const { id } = req.query

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { fields, fieldDataIds } = req.body
    // fields: { active, inGroup, crew, followup, notes }
    // fieldDataIds: { active: "123", ... } — existing field_data record IDs

    if (!fields || typeof fields !== 'object') {
      return res.status(400).json({ error: 'Missing fields' })
    }

    const fieldDefs = await getFieldDefinitions()

    const updates = await Promise.all(
      Object.entries(fields).map(async ([key, value]) => {
        const envKey   = FIELD_ENV_MAP[key]
        if (!envKey) return null

        const fieldName = process.env[envKey]
        if (!fieldName) return null

        const defId      = fieldDefs[fieldName]
        if (!defId) {
          console.warn(`Field definition not found for: ${fieldName}`)
          return null
        }

        const rawValue = (key === 'active' || key === 'inGroup')
          ? String(!!value)
          : (value || '')

        const existingId = fieldDataIds?.[key]

        if (existingId) {
          // Update existing field_data record
          await pcoFetch(`/people/v2/people/${id}/field_data/${existingId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              data: {
                type: 'FieldDatum',
                id:   existingId,
                attributes: { value: rawValue },
              },
            }),
          })
          return [key, { value, dataId: existingId }]
        } else {
          // Create new field_data record
          const created = await pcoFetch(`/people/v2/people/${id}/field_data`, {
            method: 'POST',
            body: JSON.stringify({
              data: {
                type: 'FieldDatum',
                attributes: { value: rawValue },
                relationships: {
                  field_definition: { data: { type: 'FieldDefinition', id: defId } },
                },
              },
            }),
          })
          return [key, { value, dataId: created.data.id }]
        }
      })
    )

    // Build the updated fields object to return
    const updated = { id }
    const updatedDataIds = { ...fieldDataIds }
    for (const result of updates) {
      if (!result) continue
      const [key, { value, dataId }] = result
      updated[key] = value
      updatedDataIds[key] = dataId
    }
    updated._fieldDataIds = updatedDataIds

    res.json(updated)
  } catch (err) {
    console.error(`person/${id} PATCH error:`, err)
    res.status(500).json({ error: 'Failed to save to PCO' })
  }
}
