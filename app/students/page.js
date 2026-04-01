'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import StudentList from '@/components/students/StudentList'
import StudentSearch from '@/components/students/StudentSearch'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { LEVELS } from '@/data/levels'

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([value, { label }]) => ({ value, label }))

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', notes: '', level: 'c2' })
  const [saving, setSaving] = useState(false)

  const fetchStudents = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const url = q ? `/api/students?search=${encodeURIComponent(q)}` : '/api/students'
      const res = await fetch(url)
      const data = await res.json()
      setStudents(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowAdd(false)
        setForm({ name: '', email: '', notes: '', level: 'c2' })
        fetchStudents(search)
      }
    } catch {}
    setSaving(false)
  }

  function handleSearch(q) {
    setSearch(q)
    fetchStudents(q)
  }

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${students.length} student${students.length !== 1 ? 's' : ''}`}
        action={
          <Button onClick={() => setShowAdd(true)}>+ Add Student</Button>
        }
      />

      <div className="mb-5">
        <StudentSearch onSearch={handleSearch} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <StudentList students={students} />
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Student">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Student's full name" />
          <Input label="Email (optional)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@example.com" />
          <Input label="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Preparing for June exam…" />
          <Select label="Target Level" options={LEVEL_OPTIONS} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Student</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
