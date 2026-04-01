'use client'
import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BandScoreTable from '@/components/grading/BandScoreTable'
import FeedbackSection from '@/components/grading/FeedbackSection'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate, capitalize } from '@/lib/utils'

export default function EssayPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [essay, setEssay] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/essays/${id}`)
      .then((r) => r.json())
      .then((d) => { setEssay(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!confirm('Delete this essay? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/essays/${id}`, { method: 'DELETE' })
    if (res.ok) router.push(essay?.student?._id ? `/students/${essay.student._id}` : '/students')
    setDeleting(false)
  }

  if (loading) return <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg" /></div>
  if (!essay || essay.error) return <div className="text-center py-16 text-base-content/40">Essay not found.</div>

  const { assessment, student } = essay

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-2 text-sm text-base-content/50 flex items-center gap-1 flex-wrap">
        <Link href="/students" className="hover:text-primary">Students</Link>
        {student && <>/ <Link href={`/students/${student._id}`} className="hover:text-primary">{student.name}</Link></>}
        / Essay
      </div>

      {/* Title */}
      {assessment?.inferred_title && (
        <h1 className="text-xl font-semibold italic text-base-content/80 mb-3">
          &ldquo;{assessment.inferred_title}&rdquo;
        </h1>
      )}

      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Badge variant="level">{essay.level?.toUpperCase()}</Badge>
        <Badge variant="task">{capitalize(essay.task_type)}</Badge>
        <span className="text-sm text-base-content/50">{formatDate(essay.created_at)}</span>
        <span className="text-sm text-base-content/50">{essay.word_count} words</span>
        <span className="text-sm text-base-content/50 hidden sm:inline">Model: {essay.model}</span>
        <div className="ml-auto flex gap-2 print:hidden">
          <Button variant="ghost" size="sm" onClick={() => window.print()}>Print</Button>
          <Link href={`/grade`} className="btn btn-outline btn-sm">Re-grade</Link>
          <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Essay text */}
        <div>
          <h2 className="font-semibold mb-3">Essay</h2>
          {essay.task_prompt && (
            <div className="bg-base-200 rounded-lg p-4 mb-4 text-sm text-base-content/70 italic">
              <span className="font-semibold not-italic text-base-content/50 uppercase text-xs block mb-1">Task prompt</span>
              {essay.task_prompt}
            </div>
          )}
          <div className="bg-base-100 border border-base-200 rounded-lg p-5 text-sm leading-relaxed whitespace-pre-wrap font-serif">
            {essay.essay_text}
          </div>
        </div>

        {/* Assessment panel */}
        <div className="space-y-6">
          {/* Scores */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Band Scores</h2>
              {assessment?.cefr_indication && (
                <span className="badge badge-primary">{assessment.cefr_indication}</span>
              )}
            </div>
            <div className="card bg-base-100 border border-base-200 shadow-sm">
              <div className="card-body p-5">
                <BandScoreTable scores={assessment?.scores} />
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <h2 className="font-semibold mb-3">Feedback</h2>
            <div className="card bg-base-100 border border-base-200 shadow-sm">
              <div className="card-body p-5">
                <FeedbackSection assessment={assessment} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
