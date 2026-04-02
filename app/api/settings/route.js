import { auth } from '@clerk/nextjs/server'
import { getCollections } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { users } = await getCollections()
  const user = await users.findOne({ _id: userId })
  const preferences = user?.preferences ?? {}

  return Response.json({
    default_model: preferences.default_model?.includes('/') ? preferences.default_model : 'google/gemini-flash-3',
    default_level: preferences.default_level ?? 'c2',
    custom_models: preferences.custom_models ?? [],
  })
}

export async function PUT(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { default_model, default_level, custom_models } = body

  // Validate custom_models shape
  const sanitizedModels = Array.isArray(custom_models)
    ? custom_models
        .filter((m) => m?.id?.trim() && m?.label?.trim())
        .map((m) => ({ id: m.id.trim(), label: m.label.trim() }))
    : []

  const { users } = await getCollections()
  await users.updateOne(
    { _id: userId },
    {
      $set: {
        'preferences.default_model': default_model,
        'preferences.default_level': default_level,
        'preferences.custom_models': sanitizedModels,
        updated_at: new Date(),
      },
    },
    { upsert: true }
  )

  return Response.json({ ok: true })
}
