import { auth } from '@clerk/nextjs/server'
import { getCollections } from '@/lib/db'
import { getAppSettings, clearAppSettingsCache } from '@/lib/appSettings'

async function isAdmin(userId) {
  const { users } = await getCollections()
  const user = await users.findOne({ _id: userId })
  return !!user?.admin
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin(userId)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const s = await getAppSettings()
  return Response.json(s)
}

export async function PUT(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin(userId)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { default_model, default_level, custom_models, max_gradings_per_day } = body

  const sanitizedModels = Array.isArray(custom_models)
    ? custom_models.filter(m => m?.id?.trim() && m?.label?.trim()).map(m => ({ id: m.id.trim(), label: m.label.trim() }))
    : []

  const doc = {
    _id: 'global',
    default_model: default_model ?? 'google/gemini-flash-3',
    default_level: default_level ?? 'c2',
    custom_models: sanitizedModels,
    max_gradings_per_day: Number.isInteger(max_gradings_per_day) && max_gradings_per_day > 0 ? max_gradings_per_day : 2,
    updated_at: new Date(),
  }

  const { settings } = await getCollections()
  await settings.replaceOne({ _id: 'global' }, doc, { upsert: true })

  clearAppSettingsCache()
  return Response.json({ ok: true })
}
