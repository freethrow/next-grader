import { auth } from '@clerk/nextjs/server'
import { getCollections } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { users } = await getCollections()
  const user = await users.findOne({ _id: userId })
  const preferences = user?.preferences ?? {
    default_model: 'claude-sonnet-4-20250514',
    default_level: 'c2',
  }

  return Response.json(preferences)
}

export async function PUT(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { default_model, default_level } = body

  const { users } = await getCollections()
  await users.updateOne(
    { _id: userId },
    { $set: { 'preferences.default_model': default_model, 'preferences.default_level': default_level, updated_at: new Date() } },
    { upsert: true }
  )

  return Response.json({ ok: true })
}
