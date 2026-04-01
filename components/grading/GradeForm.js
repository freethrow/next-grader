'use client'
import { useState, useEffect, useRef } from 'react'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Modal from '@/components/ui/Modal'
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
        body: JSON.stringify({
          student_id: studentId,
          level,
          task_type: taskType,
          task_prompt: taskPrompt,
          essay_text: essayText,
          model: defaultModel,
        }),
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

  const studentOptions = students.map((s) => ({ value: s._id, label: s.name }))
  const canSubmit = studentId && level && taskType && essayText.trim()

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Student */}
        <div className="flex gap-2 items-end">
          <Select
            label="Student"
            options={studentOptions}
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Select a student..."
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => setShowNewStudent(true)} className="mb-0.5">
            + New
          </Button>
        </div>

        {/* Level + Task Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Exam Level"
            options={LEVEL_OPTIONS}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
          <Select
            label="Task Type"
            options={taskTypeOptions}
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            placeholder="Select task type..."
            disabled={!level}
          />
        </div>

        {/* Task prompt */}
        <Input
          label="Task Prompt (optional)"
          placeholder="Paste the exam task prompt here..."
          value={taskPrompt}
          onChange={(e) => setTaskPrompt(e.target.value)}
        />

        {/* Essay text */}
        <Textarea
          label="Student Essay"
          placeholder="Paste the student's essay here..."
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          showWordCount
          wordCountRange={wordCountRange}
          rows={16}
        />

        {error && <div className="alert alert-error text-sm">{error}</div>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!canSubmit}
          className="w-full"
        >
          {loading ? 'Grading Essay…' : 'Grade Essay'}
        </Button>
      </form>

      {result && (
        <div ref={resultRef} className="border-t border-base-200 pt-8">
          <AssessmentView essay={result} />
        </div>
      )}

      <Modal open={showNewStudent} onClose={() => setShowNewStudent(false)} title="Add New Student">
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <Input
            label="Name"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            placeholder="Student's full name"
            required
          />
          <Select
            label="Target Level"
            options={LEVEL_OPTIONS}
            value={newStudentLevel}
            onChange={(e) => setNewStudentLevel(e.target.value)}
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowNewStudent(false)}>Cancel</Button>
            <Button type="submit" loading={creatingStudent}>Create Student</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
