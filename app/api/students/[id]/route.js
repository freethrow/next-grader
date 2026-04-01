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

  const { students, essays } = await getCollections()
  const student = await students.findOne({ _id, teacher_id: userId })
  if (!student) return Response.json({ error: 'Not found' }, { status: 404 })

  const studentEssays = await essays
    .find({ student_id: _id, teacher_id: userId })
    .sort({ created_at: -1 })
    .toArray()

  return Response.json({ ...student, essays: studentEssays })
}

export async function PUT(request, { params }) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const _id = parseId(id)
  if (!_id) return Response.json({ error: 'Invalid ID' }, { status: 400 })

  const body = await request.json()
  const { name, email, notes, level } = body

  if (!name?.trim()) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const { students } = await getCollections()
  const result = await students.findOneAndUpdate(
    { _id, teacher_id: userId },
    {
      $set: {
        name: name.trim(),
        email: email?.trim() || '',
        notes: notes?.trim() || '',
        level: level || 'c2',
        updated_at: new Date(),
      },
    },
    { returnDocument: 'after' }
  )

  if (!result) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(result)
}

export async function DELETE(request, { params }) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const _id = parseId(id)
  if (!_id) return Response.json({ error: 'Invalid ID' }, { status: 400 })

  const { students } = await getCollections()
  const result = await students.deleteOne({ _id, teacher_id: userId })
  if (result.deletedCount === 0) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({ ok: true })
}
