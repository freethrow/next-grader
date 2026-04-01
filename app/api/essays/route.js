import { auth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import { getCollections } from '@/lib/db'

export async function GET(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('student_id')
  const level = searchParams.get('level')
  const taskType = searchParams.get('task_type')

  const { essays } = await getCollections()

  const query = { teacher_id: userId }
  if (studentId) {
    try { query.student_id = new ObjectId(studentId) } catch {}
  }
  if (level) query.level = level
  if (taskType) query.task_type = taskType

  const list = await essays
    .find(query)
    .sort({ created_at: -1 })
    .toArray()

  return Response.json(list)
}
