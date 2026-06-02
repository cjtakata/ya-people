import { requireAuth } from './_lib/auth.js'
import { pcoFetch } from './_lib/pco.js'

export default async function handler(req, res) {
  const user = await requireAuth(req, res)
  if (!user) return

  const results = {}

  try {
    const defs = await pcoFetch('/people/v2/field_definitions?per_page=100')
    results.fieldDefinitions = defs.data.map(d => ({
      id:   d.id,
      name: d.attributes.name,
      type: d.attributes.data_type,
      tab:  d.attributes.tab_name,
    }))
  } catch (e) {
    results.fieldDefinitionsError = e.message
  }

  const listIds = {
    college:     process.env.PCO_LIST_COLLEGE,
    earlycareer: process.env.PCO_LIST_EARLY_CAREER,
    youngpro:    process.env.PCO_LIST_YOUNG_PRO,
  }

  results.listTests = {}
  for (const [key, id] of Object.entries(listIds)) {
    try {
      const basic = await pcoFetch(`/people/v2/lists/${id}/people?per_page=1`)
      const withIncludes = await pcoFetch(
        `/people/v2/lists/${id}/people?per_page=1&include=phone_numbers,field_data`
      )
      results.listTests[key] = {
        listId:       id,
        total:        basic.meta?.total_count,
        samplePerson: basic.data[0]?.attributes,
        includedTypes: [...new Set((withIncludes.included || []).map(i => i.type))],
        sampleFieldData: (withIncludes.included || [])
          .filter(i => i.type === 'FieldDatum')
          .slice(0, 3)
          .map(i => ({
            id:    i.id,
            value: i.attributes.value,
            defId: i.relationships?.field_definition?.data?.id,
            personId: i.relationships?.customizable?.data?.id,
          })),
      }
    } catch (e) {
      results.listTests[key] = { listId: id, error: e.message }
    }
  }

  res.json(results)
}
