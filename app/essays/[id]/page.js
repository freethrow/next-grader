'use client'
import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BandScoreTable from '@/components/grading/BandScoreTable'
import FeedbackSection from '@/components/grading/FeedbackSection'
import { formatDate, capitalize } from '@/lib/utils'

export default function EssayPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [essay, setEssay] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/essays/${id}`)
      .then(r => r.json())
      .then(d => { setEssay(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!confirm('Delete this essay? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/essays/${id}`, { method: 'DELETE' })
    if (res.ok) router.push(essay?.student?._id ? `/students/${essay.student._id}` : '/students')
    setDeleting(false)
  }

  if (loading) return <div className="flex justify-center py-16"><svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg></div>
  if (!essay || essay.error) return <div className="text-center py-16 text-muted">Essay not found.</div>

  const { assessment, student } = essay

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-2 text-sm text-muted flex items-center gap-1 flex-wrap">
        <Link href="/students" className="hover:text-primary transition-colors">Students</Link>
        {student && <><span>/</span><Link href={`/students/${student._id}`} className="hover:text-primary transition-colors">{student.name}</Link></>}
        <span>/</span><span>Essay</span>
      </div>

      {assessment?.inferred_title && (
        <h1 className="text-xl font-semibold italic text-muted mb-3">&ldquo;{assessment.inferred_title}&rdquo;</h1>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-xs font-semibold bg-primary-tint text-primary px-2 py-0.5 rounded">{essay.level?.toUpperCase()}</span>
        <span className="text-xs font-semibold bg-raised text-muted px-2 py-0.5 rounded">{capitalize(essay.task_type)}</span>
        <span className="text-sm text-muted">{formatDate(essay.created_at)}</span>
        <span className="text-sm text-muted">{essay.word_count} words</span>
        <span className="text-sm text-muted hidden sm:inline">Model: {essay.model}</span>
        <div className="ml-auto flex gap-2 print-hidden">
          <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:bg-raised border border-border transition-colors" onClick={() => window.print()}>Print</button>
          <Link href="/grade" className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink border border-border hover:bg-raised transition-colors">Re-grade</Link>
          <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-light text-red hover:opacity-80 transition-opacity disabled:opacity-40 flex items-center gap-1.5" disabled={deleting} onClick={handleDelete}>
            {deleting && <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-ink mb-3">Essay</h2>
          {essay.task_prompt && (
            <div className="bg-raised rounded-lg p-4 mb-4 text-sm text-muted italic">
              <span className="font-semibold not-italic text-faint uppercase text-xs block mb-1">Task prompt</span>
              {essay.task_prompt}
            </div>
          )}
          <div className="bg-surface border border-border rounded-xl p-5 text-sm leading-relaxed whitespace-pre-wrap font-serif text-ink">
            {essay.essay_text}
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
