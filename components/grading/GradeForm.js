'use client'
import { useState, useEffect, useRef } from 'react'
import AssessmentView from './AssessmentView'
import { LEVELS } from '@/data/levels'

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([value, { label }]) => ({ value, label }))

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
  const taskTypeOptions = (levelConfig?.taskTypes ?? []).map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))
  const wordCountRange = taskType ? levelConfig?.wordCounts?.[taskType] : null

  let wordCountColor = 'text-base-content/50'
  if (wordCountRange) {
    if (wordCount < wordCountRange.min || wordCount > wordCountRange.max) wordCountColor = 'text-warning'
    else wordCountColor = 'text-success'
  }

  useEffect(() => {
    fetch('/api/students')
      .then((r) => r.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => { setTaskType('') }, [level])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!studentId || !level || !taskType || !essayText.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, level, task_type: taskType, task_prompt: taskPrompt, essay_text: essayText, model: defaultModel }),
      })
      const data = await res.json()
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
      setStudents((prev) => [...prev, student])
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
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Student */}
        <div className="flex gap-2 items-end">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Student</span></label>
            <select
              className="select select-bordered w-full"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Select a student…</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <button type="button" className="btn btn-outline btn-sm mb-0.5" onClick={() => setShowNewStudent(true)}>
            + New
          </button>
        </div>

        {/* Level + Task Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Exam Level</span></label>
            <select className="select select-bordered w-full" value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVEL_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium">Task Type</span></label>
            <select
              className="select select-bordered w-full"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              disabled={!level}
            >
              <option value="">Select task type…</option>
              {taskTypeOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Task prompt */}
        <div className="form-control w-full">
          <label className="label"><span className="label-text font-medium">Task Prompt (optional)</span></label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Paste the exam task prompt here…"
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
          />
        </div>

        {/* Essay text */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Student Essay</span>
            <span className={`label-text-alt font-mono ${wordCountColor}`}>
              {wordCount} words
              {wordCountRange && ` · target ${wordCountRange.min}–${wordCountRange.max}`}
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full resize-y min-h-64"
            placeholder="Paste the student's essay here…"
            rows={16}
            value={essayText}
            onChange={(e) => {
              setEssayText(e.target.value)
              setWordCount(e.target.value.trim().split(/\s+/).filter(Boolean).length)
            }}
          />
        </div>

        {error && <div className="alert alert-error text-sm">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={!canSubmit || loading}
        >
          {loading && <span className="loading loading-spinner loading-sm" />}
          {loading ? 'Grading Essay…' : 'Grade Essay'}
        </button>
      </form>

      {result && (
        <div ref={resultRef} className="border-t border-base-200 pt-8">
          <AssessmentView essay={result} />
        </div>
      )}

      {/* New student modal */}
      <dialog className={`modal ${showNewStudent ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-md">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" type="button" onClick={() => setShowNewStudent(false)}>✕</button>
          <h3 className="font-bold text-lg mb-4 pr-8">Add New Student</h3>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Name</span></label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Student's full name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                required
              />
            </div>
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium">Target Level</span></label>
              <select className="select select-bordered w-full" value={newStudentLevel} onChange={(e) => setNewStudentLevel(e.target.value)}>
                {LEVEL_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="btn btn-ghost" onClick={() => setShowNewStudent(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creatingStudent}>
                {creatingStudent && <span className="loading loading-spinner loading-sm" />}
                Create Student
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={() => setShowNewStudent(false)} />
      </dialog>
    </div>
  )
}
