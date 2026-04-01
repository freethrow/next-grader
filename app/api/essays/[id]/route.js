import { auth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import { getCollections } from '@/lib/db'

function parseId(id) {
  try { return new ObjectId(id) } catch { return null }
}

export async function GET(request, { params }) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const _id = parseId(id)
  if (!_id) return Response.json({ error: 'Invalid ID' }, { status: 400 })

  const { essays, students } = await getCollections()
  const essay = await essays.findOne({ _id, teacher_id: userId })
  if (!essay) return Response.json({ error: 'Not found' }, { status: 404 })

  // Attach student info
  const student = essay.student_id
    ? await students.findOne({ _id: essay.student_id })
    : null

  return Response.json({ ...essay, student })
}

export async function DELETE(request, { params }) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const _id = parseId(id)
  if (!_id) return Response.json({ error: 'Invalid ID' }, { status: 400 })

  const { essays } = await getCollections()
  const result = await essays.deleteOne({ _id, teacher_id: userId })
  if (result.deletedCount === 0) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({ ok: true })
}
