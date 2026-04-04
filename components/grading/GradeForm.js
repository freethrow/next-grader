'use client'
import { useState, useEffect, useRef } from 'react'
import AssessmentView from './AssessmentView'
import { LEVELS } from '@/data/levels'

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([value, { label }]) => ({ value, label }))

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm'
const labelCls = 'block text-xs font-semibold text-muted uppercase tracking-wide mb-2'

function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
              active
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-muted border-border hover:border-primary/50 hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default function GradeForm({ defaultModel, defaultLevel }) {
  const [students, setStudents] = useState([])
  const [studentId, setStudentId] = useState('')
  const [level, setLevel] = useState(defaultLevel || 'c2')
  const [taskType, setTaskType] = useState('')
  const [taskPrompt, setTaskPrompt] = useState('')
  const [essayText, setEssayText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const resultRef = useRef(null)
  const [showNewStudent, setShowNewStudent] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentLevel, setNewStudentLevel] = useState('c2')
  const [creatingStudent, setCreatingStudent] = useState(false)

  const levelConfig = LEVELS[level]
  const taskTypeOptions = (levelConfig?.taskTypes ?? []).map((t) => ({
    value: t,
    label: t.charAt(0).toUpperCase() + t.slice(1),
  }))
  const wordCountRange = taskType ? levelConfig?.wordCounts?.[taskType] : null

  let wc_color = 'text-faint'
  if (wordCountRange) {
    wc_color = wordCount < wordCountRange.min || wordCount > wordCountRange.max ? 'text-amber' : 'text-green'
  }

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  useEffect(() => { setTaskType('') }, [level])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!studentId || !level || !taskType || !essayText.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, level, task_type: taskType, task_prompt: taskPrompt, essay_text: essayText, model: defaultModel }),
      })
      const data = await res.json()
      if (res.status === 429) {
        const retryAt = new Date(data.retry_at)
        const hhmm = retryAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const date = retryAt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
        throw new Error(`Daily limit reached. Next grading available at ${hhmm} on ${date}.`)
      }
      if (!res.ok) throw new Error(data.error || 'Grading failed')
      setResult(data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateStudent(e) {
    e.preventDefault()
    if (!newStudentName.trim()) return
    setCreatingStudent(true)
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStudentName, level: newStudentLevel }),
      })
      const student = await res.json()
      if (!res.ok) throw new Error(student.error)
      setStudents(prev => [...prev, student])
      setStudentId(student._id)
      setShowNewStudent(false)
      setNewStudentName('')
    } catch (err) {
      alert(err.message)
    } finally {
      setCreatingStudent(false)
    }
  }

  const canSubmit = studentId && level && taskType && essayText.trim()

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Student */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <p className={labelCls}>Student</p>
          <div className="flex gap-2 items-center">
            <select
              className={inputCls + ' flex-1'}
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
            >
              <option value="">Select a student…</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setShowNewStudent(true)}
              className="shrink-0 px-4 py-2.5 rounded-lg border border-accent/40 bg-accent/5 text-accent text-sm font-semibold hover:bg-accent/10 transition-colors"
            >
              + New
            </button>
          </div>
        </div>

        {/* Level + Task Type */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-5">
          <div className="space-y-2">
            <p className={labelCls}>Exam Level</p>
            <PillGroup options={LEVEL_OPTIONS} value={level} onChange={setLevel} />
          </div>
          <div className="space-y-2">
            <p className={labelCls}>Task Type</p>
            {taskTypeOptions.length > 0
              ? <PillGroup options={taskTypeOptions} value={taskType} onChange={setTaskType} />
              : <p className="text-sm text-faint">Select a level first</p>
            }
          </div>
        </div>

        {/* Task Prompt + Essay */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
          <div>
            <label className={labelCls}>
              Task Prompt <span className="normal-case font-normal text-faint tracking-normal">(optional)</span>
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="Paste the exam task prompt here…"
              value={taskPrompt}
              onChange={e => setTaskPrompt(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className={labelCls.replace('mb-2', 'mb-0')}>Student Essay</p>
              <span className={`text-xs font-mono ${wc_color}`}>
                {wordCount} words{wordCountRange && ` · target ${wordCountRange.min}–${wordCountRange.max}`}
              </span>
            </div>
            <textarea
              className={`${inputCls} resize-y min-h-64`}
              placeholder="Paste the student's essay here…"
              rows={16}
              value={essayText}
              onChange={e => {
                setEssayText(e.target.value)
                setWordCount(e.target.value.trim().split(/\s+/).filter(Boolean).length)
              }}
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-light border border-red/20 text-red text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="w-full py-3.5 rounded-xl bg-accent text-white font-bold text-sm tracking-wide hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Grading Essay…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
              Grade Essay
            </>
          )}
        </button>
      </form>

      {result && (
        <div ref={resultRef} className="border-t border-border pt-8">
          <AssessmentView essay={result} />
        </div>
      )}

      {/* New student modal */}
      {showNewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setShowNewStudent(false)} />
          <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md p-6">
            <button
              className="absolute right-4 top-4 text-muted hover:text-ink transition-colors"
              onClick={() => setShowNewStudent(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <h3 className="font-bold text-lg text-ink mb-4">Add New Student</h3>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className={labelCls}>Name</label>
                <input type="text" className={inputCls} placeholder="Student's full name" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Target Level</label>
                <select className={inputCls} value={newStudentLevel} onChange={e => setNewStudentLevel(e.target.value)}>
                  {LEVEL_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:bg-raised transition-colors"
                  onClick={() => setShowNewStudent(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStudent}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2"
                >
                  {creatingStudent && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  )}
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
