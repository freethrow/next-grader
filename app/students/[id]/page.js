import { auth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import { getCollections } from '@/lib/db'
import { notFound } from 'next/navigation'
import StudentPageClient from '@/components/students/StudentPageClient'

export async function generateMetadata({ params }) {
  const { id } = await params
  try {
    const { userId } = await auth()
    const { students } = await getCollections()
    const student = await students.findOne({ _id: new ObjectId(id), teacher_id: userId })
    if (student) return { title: `${student.name} — Verbiq` }
  } catch {}
  return { title: 'Student — Verbiq' }
}

export default async function StudentPage({ params }) {
  const { id } = await params
  const { userId } = await auth()

  let _id
  try { _id = new ObjectId(id) } catch { notFound() }

  const { students, essays } = await getCollections()
  const student = await students.findOne({ _id, teacher_id: userId })
  if (!student) notFound()

  const studentEssays = await essays
    .find({ student_id: _id, teacher_id: userId })
    .sort({ created_at: -1 })
    .toArray()

  // Serialize MongoDB documents (ObjectId → string, Date → ISO string)
  const studentData = JSON.parse(JSON.stringify(student))
  const essaysData = JSON.parse(JSON.stringify(studentEssays))

  return <StudentPageClient student={studentData} essays={essaysData} />
}
