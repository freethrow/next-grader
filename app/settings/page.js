'use client'
import { useState, useEffect } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { LEVELS, MODELS } from '@/data/levels'

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([v, { label }]) => ({ value: v, label }))
const MODEL_OPTIONS = MODELS.map(({ id, label }) => ({ value: id, label }))

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({ default_model: '', default_level: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => { setPrefs(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg" /></div>

  return (
    <div className="max-w-md">
      <PageHeader title="Settings" subtitle="Default preferences for grading." />
      <form onSubmit={handleSave} className="space-y-5">
        <Select
          label="Default AI Model"
          options={MODEL_OPTIONS}
          value={prefs.default_model}
          onChange={(e) => setPrefs({ ...prefs, default_model: e.target.value })}
        />
        <Select
          label="Default Exam Level"
          options={LEVEL_OPTIONS}
          value={prefs.default_level}
          onChange={(e) => setPrefs({ ...prefs, default_level: e.target.value })}
        />
        <Button type="submit" loading={saving} className="w-full">
          {saved ? '✓ Saved' : 'Save Preferences'}
        </Button>
      </form>
    </div>
  )
}
