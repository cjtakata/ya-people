import { requireAuth } from './_lib/auth.js'
import { getLeaderCrews } from './_lib/leaders.js'

export default async function handler(req, res) {
  const user = await requireAuth(req, res)
  if (!user) return
  res.json({
    id:          user.id,
    username:    user.username,
    global_name: user.global_name,
    avatar:      user.avatar,
    crews:       getLeaderCrews(user.id),
  })
}
