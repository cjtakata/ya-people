import { requireAuth } from './_lib/auth.js'
import { pcoFetchAll, getFieldDefinitions, resolveFieldId, avatarColor, calcAge, fmtSince } from './_lib/pco.js'

const LISTS = [
  { id: () => process.env.PCO_LIST_COLLEGE,      key: 'college',     name: 'College Life' },
  { id: () => process.env.PCO_LIST_EARLY_CAREER,  key: 'earlycareer', name: 'Early Career' },
  { id: () => process.env.PCO_LIST_YOUNG_PRO,     key: 'youngpro',    name: 'Young Pro' },
]

function extractFieldValues(personId, included, fieldDefs) {
  const defIdToEnv = {
    [fieldDefs[process.env.PCO_FIELD_ACTIVE]]:      'active',
    [fieldDefs[process.env.PCO_FIELD_FOLLOWUP]]:    'followup',
    [fieldDefs[process.env.PCO_FIELD_CREW]]:        'crew',
    [fieldDefs[process.env.PCO_FIELD_SMALL_GROUP]]: 'inGroup',
    [fieldDefs[process.env.PCO_FIELD_NOTES]]:       'notes',
  }

  const values   = {}
  const dataIds  = {}

  for (const item of included) {
    if (item.type !== 'FieldDatum') continue
    if (item.relationships?.customizable?.data?.id !== personId) continue

    const defId = item.relationships?.field_definition?.data?.id
    const key   = defIdToEnv[defId]
    if (!key) continue

    dataIds[key]  = item.id
    const raw     = item.attributes.value
    if (key === 'active' || key === 'inGroup') {
      values[key] = raw === 'true' || raw === true
    } else {
      values[key] = raw || ''
    }
  }

  return { values, dataIds }
}

function extractPhone(personId, included) {
  const phones = included.filter(
    i => i.type === 'PhoneNumber' && i.relationships?.person?.data?.id === personId
  )
  const primary = phones.find(p => p.attributes.primary) || phones[0]
  return primary?.attributes?.number || null
}

function normalizePerson(raw, included, list, fieldDefs) {
  const a  = raw.attributes
  const id = raw.id

  const { values, dataIds } = extractFieldValues(id, included, fieldDefs)

  const firstName = a.first_name || ''
  const lastName  = a.last_name  || ''
  const name      = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown'

  return {
    id,
    name,
    email:    a.primary_email_address || '',
    phone:    extractPhone(id, included),
    age:      calcAge(a.birthdate),
    gender:   a.gender || null,
    since:    fmtSince(a.created_at),
    avatar:   a.avatar || null,
    color:    avatarColor(name),
    list:     list.key,
    listName: list.name,
    // YA custom fields
    active:   values.active   ?? false,
    inGroup:  values.inGroup  ?? false,
    crew:     values.crew     || '',
    followup: values.followup || '',
    notes:    values.notes    || '',
    // internal: field_data record IDs for PATCH
    _fieldDataIds: dataIds,
  }
}

export default async function handler(req, res) {
  const user = await requireAuth(req, res)
  if (!user) return

  try {
    const fieldDefs = await getFieldDefinitions()

    const listResults = await Promise.all(
      LISTS.map(list =>
        pcoFetchAll(
          `/people/v2/lists/${list.id()}/people?include=phone_numbers,field_data&per_page=100`
        ).then(({ data, included }) => ({ list, data, included }))
      )
    )

    // Deduplicate by person ID (someone could be in multiple lists — keep first occurrence)
    const seen   = new Set()
    const people = []

    for (const { list, data, included } of listResults) {
      for (const raw of data) {
        if (seen.has(raw.id)) continue
        seen.add(raw.id)
        people.push(normalizePerson(raw, included, list, fieldDefs))
      }
    }

    res.json(people)
  } catch (err) {
    console.error('people.js error:', err)
    res.status(500).json({ error: 'Failed to fetch people from PCO' })
  }
}
