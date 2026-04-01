import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { getCollections } from '@/lib/db'

export async function POST(request) {
  const body = await request.text()
  const headersList = await headers()

  const svixId = headersList.get('svix-id')
  const svixTimestamp = headersList.get('svix-timestamp')
  const svixSignature = headersList.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
  let event

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
  } catch {
    return Response.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const { users } = await getCollections()
  const { type, data } = event

  if (type === 'user.created' || type === 'user.updated') {
    const email = data.email_addresses?.[0]?.email_address ?? ''
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ')

    await users.updateOne(
      { _id: data.id },
      {
        $set: {
          _id: data.id,
          email,
          name,
          image_url: data.image_url ?? '',
          updated_at: new Date(),
        },
        $setOnInsert: {
          preferences: {
            default_model: 'claude-sonnet-4-20250514',
            default_level: 'c2',
          },
          created_at: new Date(),
        },
      },
      { upsert: true }
    )
  }

  return Response.json({ ok: true })
}
