import { auth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import { getCollections } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BandScoreTable from '@/components/grading/BandScoreTable'
import FeedbackSection from '@/components/grading/FeedbackSection'
import DeleteEssayButton from '@/components/essays/DeleteEssayButton'
import { formatDate, capitalize } from '@/lib/utils'

export async function generateMetadata({ params }) {
  const { id } = await params
  try {
    const { userId } = await auth()
    const { essays } = await getCollections()
    const essay = await essays.findOne({ _id: new ObjectId(id), teacher_id: userId })
    if (essay?.assessment?.inferred_title) return { title: `"${essay.assessment.inferred_title}" — Verbiq` }
  } catch {}
  return { title: 'Essay — Verbiq' }
}

export default async function EssayPage({ params }) {
  const { id } = await params
  const { userId } = await auth()

  let _id
  try { _id = new ObjectId(id) } catch { notFound() }

  const { essays, students } = await getCollections()
  const essay = await essays.findOne({ _id, teacher_id: userId })
  if (!essay) notFound()

  const student = essay.student_id
    ? await students.findOne({ _id: essay.student_id })
    : null

  // Serialize for rendering
  const e = JSON.parse(JSON.stringify(essay))
  const s = student ? JSON.parse(JSON.stringify(student)) : null

  const { assessment } = e

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-2 text-sm text-muted flex items-center gap-1 flex-wrap">
        <Link href="/students" className="hover:text-primary transition-colors">Students</Link>
        {s && (
          <>
            <span>/</span>
            <Link href={`/students/${s._id}`} className="hover:text-primary transition-colors">{s.name}</Link>
          </>
        )}
        <span>/</span><span>Essay</span>
      </div>

      {assessment?.inferred_title && (
        <h1 className="text-xl font-semibold italic text-muted mb-3">&ldquo;{assessment.inferred_title}&rdquo;</h1>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-xs font-semibold bg-primary-tint text-primary px-2 py-0.5 rounded">{e.level?.toUpperCase()}</span>
        <span className="text-xs font-semibold bg-raised text-muted px-2 py-0.5 rounded">{capitalize(e.task_type)}</span>
        <span className="text-sm text-muted">{formatDate(e.created_at)}</span>
        <span className="text-sm text-muted">{e.word_count} words</span>
        <span className="text-sm text-muted hidden sm:inline">Model: {e.model}</span>
        <div className="ml-auto flex gap-2 print-hidden">
          <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:bg-raised border border-border transition-colors" onClick="window.print()">Print</button>
          <Link href="/grade" className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink border border-border hover:bg-raised transition-colors">Re-grade</Link>
          <DeleteEssayButton essayId={e._id} studentId={s?._id ?? null} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-ink mb-3">Essay</h2>
          {e.task_prompt && (
            <div className="bg-raised rounded-lg p-4 mb-4 text-sm text-muted italic">
              <span className="font-semibold not-italic text-faint uppercase text-xs block mb-1">Task prompt</span>
              {e.task_prompt}
            </div>
          )}
          <div className="bg-surface border border-border rounded-xl p-5 text-sm leading-relaxed whitespace-pre-wrap font-serif text-ink">
            {e.essay_text}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-ink">Band Scores</h2>
              {assessment?.cefr_indication && (
                <p className="text-sm font-semibold text-primary">{assessment.cefr_indication}</p>
              )}
            </div>
            <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
              <BandScoreTable scores={assessment?.scores} />
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-ink mb-3">Feedback</h2>
            <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
              <FeedbackSection assessment={assessment} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
