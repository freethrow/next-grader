import { auth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import { getCollections } from '@/lib/db'
import { getAppSettings } from '@/lib/appSettings'
import { gradeEssay } from '@/lib/ai'
import { countWords } from '@/lib/utils'

export async function POST(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { student_id, level, task_type, task_prompt, essay_text } = body

  if (!student_id || !level || !task_type || !essay_text?.trim()) {
    return Response.json({ error: 'Missing required fields: student_id, level, task_type, essay_text' }, { status: 400 })
  }

  // Verify student belongs to this teacher + load user's preferred model
  const { students, essays, users } = await getCollections()
  let studentObjectId
  try { studentObjectId = new ObjectId(student_id) } catch {
    return Response.json({ error: 'Invalid student_id' }, { status: 400 })
  }

  const [student, userDoc, appSettings] = await Promise.all([
    students.findOne({ _id: studentObjectId, teacher_id: userId }),
    users.findOne({ _id: userId }),
    getAppSettings(),
  ])
  if (!student) return Response.json({ error: 'Student not found' }, { status: 404 })

  // Rate limit: max_gradings_per_day per 24h for non-admins
  if (!userDoc?.admin) {
    const limit = appSettings.max_gradings_per_day
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentCount = await essays.countDocuments({ teacher_id: userId, created_at: { $gte: since } })
    if (recentCount >= limit) {
      const oldest = await essays.findOne(
        { teacher_id: userId, created_at: { $gte: since } },
        { sort: { created_at: 1 }, projection: { created_at: 1 } }
      )
      const retryAt = new Date(oldest.created_at.getTime() + 24 * 60 * 60 * 1000)
      return Response.json({ error: 'rate_limited', retry_at: retryAt.toISOString() }, { status: 429 })
    }
  }

  const model = appSettings.default_model?.includes('/') ? appSettings.default_model : 'google/gemini-flash-3'

  // Call AI
  let assessment, rawResponse
  try {
    const result = await gradeEssay({ essayText: essay_text, level, taskType: task_type, taskPrompt: task_prompt, model })
    assessment = result.assessment
    rawResponse = result.rawResponse
  } catch (err) {
    console.error('AI grading error:', err)
    return Response.json({ error: 'Grading failed. Please try again.' }, { status: 500 })
  }

  const now = new Date()
  const essayDoc = {
    student_id: studentObjectId,
    teacher_id: userId,
    level,
    task_type,
    task_prompt: task_prompt || '',
    essay_text,
    word_count: countWords(essay_text),
    model,
    assessment,
    raw_response: rawResponse,
    created_at: now,
  }

  const { insertedId } = await essays.insertOne(essayDoc)

  return Response.json({
    ...essayDoc,
    _id: insertedId.toString(),
    student_id: student_id,
    created_at: now.toISOString(),
  }, { status: 201 })
}
