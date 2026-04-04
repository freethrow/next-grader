import { auth } from '@clerk/nextjs/server'
import { getCollections } from '@/lib/db'
import GradeForm from '@/components/grading/GradeForm'
import PageHeader from '@/components/layout/PageHeader'

export const metadata = { title: 'Grade Essay — Verbiq' }

export default async function GradePage() {
  const { userId } = await auth()

  let defaultLevel = 'c2'

  try {
    const { users } = await getCollections()
    const user = await users.findOne({ _id: userId })
    if (user?.preferences?.default_level) defaultLevel = user.preferences.default_level
  } catch {}

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Grade Essay"
        subtitle="Select a student, paste the essay, and get a full Cambridge assessment."
      />
      <GradeForm defaultLevel={defaultLevel} />
    </div>
  )
}
