import { auth } from '@clerk/nextjs/server'
import { getCollections } from '@/lib/db'

export async function GET(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  const { students } = await getCollections()

  const query = { teacher_id: userId }
  if (search) {
    const re = { $regex: search, $options: 'i' }
    query.$or = [{ name: re }, { email: re }, { notes: re }]
  }

  const list = await students
    .aggregate([
      { $match: query },
      { $sort: { name: 1 } },
      {
        $lookup: {
          from: 'essays',
          localField: '_id',
          foreignField: 'student_id',
          as: '_essays',
        },
      },
      {
        $addFields: {
          essayCount: { $size: '$_essays' },
          avgScore: {
            $cond: [
              { $gt: [{ $size: '$_essays' }, 0] },
              { $avg: '$_essays.assessment.scores.total' },
              null,
            ],
          },
        },
      },
      { $unset: '_essays' },
    ])
    .toArray()

  return Response.json(list)
}

export async function POST(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, email, notes, level } = body

  if (!name?.trim()) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const { students } = await getCollections()
  const now = new Date()

  const result = await students.insertOne({
    teacher_id: userId,
    name: name.trim(),
    email: email?.trim() || '',
    notes: notes?.trim() || '',
    level: level || 'c2',
    created_at: now,
    updated_at: now,
  })

  const created = await students.findOne({ _id: result.insertedId })
  return Response.json(created, { status: 201 })
}
