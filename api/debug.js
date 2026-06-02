import { requireAuth } from './_lib/auth.js'
import { pcoFetch, pcoFetchAll } from './_lib/pco.js'

export default async function handler(req, res) {
  const user = await requireAuth(req, res)
  if (!user) return

  const results = {}

  // 1. Probe each configured list ID two ways:
  //    - the list resource itself  /lists/{id}
  //    - its people sub-resource    /lists/{id}/people
  const listIds = {
    college:     process.env.PCO_LIST_COLLEGE,
    earlycareer: process.env.PCO_LIST_EARLY_CAREER,
    youngpro:    process.env.PCO_LIST_YOUNG_PRO,
  }

  results.probes = {}
  for (const [key, id] of Object.entries(listIds)) {
    const probe = { listId: id }
    try {
      const meta = await pcoFetch(`/people/v2/lists/${id}`)
      probe.listResource = {
        ok:   true,
        name: meta.data?.attributes?.name,
        total: meta.data?.attributes?.total_people,
        status: meta.data?.attributes?.status,
      }
    } catch (e) {
      probe.listResource = { ok: false, error: e.message.slice(0, 200) }
    }
    try {
      const ppl = await pcoFetch(`/people/v2/lists/${id}/people?per_page=1`)
      probe.peopleSubResource = { ok: true, total: ppl.meta?.total_count }
    } catch (e) {
      probe.peopleSubResource = { ok: false, error: e.message.slice(0, 200) }
    }
    results.probes[key] = probe
  }

  // 2. Enumerate every list the token can see, so we can find the
  //    real IDs by name. Match anything that looks YA-related.
  try {
    const { data } = await pcoFetchAll('/people/v2/lists?per_page=100')
    results.totalListsVisible = data.length
    results.allVisibleLists = data.map(l => ({
      id:     l.id,
      name:   l.attributes?.name,
      total:  l.attributes?.total_people,
      status: l.attributes?.status,
    }))
  } catch (e) {
    results.listsError = e.message
  }

  res.json(results)
}
