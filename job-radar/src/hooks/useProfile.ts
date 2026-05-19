import { useState, useCallback } from 'react'
import type { UserProfile } from '../types'
import { loadStorage, saveStorage } from '../lib/storage'
import { extractTextFromPdf } from '../lib/pdfParser'
import { extractSkills } from '../lib/skillExtractor'

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile | null>(
    () => loadStorage().profile
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveProfile = useCallback((updated: UserProfile) => {
    setProfileState(updated)
    saveStorage({ profile: updated })
  }, [])

  const loadFromPdf = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const text = await extractTextFromPdf(file)
      const skills = extractSkills(text)
      // rawCvText intentionally omitted — CV text is never persisted (PII minimisation)
      const updated: UserProfile = {
        id: 'singleton',
        skills,
        updatedAt: Date.now(),
      }
      saveProfile(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF-Fehler')
    } finally {
      setLoading(false)
    }
  }, [saveProfile])

  const addSkill = useCallback((skill: string) => {
    const current = profile ?? { id: 'singleton' as const, skills: [], updatedAt: Date.now() }
    if (current.skills.includes(skill)) return
    saveProfile({ ...current, skills: [...current.skills, skill], updatedAt: Date.now() })
  }, [profile, saveProfile])

  const removeSkill = useCallback((skill: string) => {
    if (!profile) return
    saveProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill), updatedAt: Date.now() })
  }, [profile, saveProfile])

  return { profile, loading, error, loadFromPdf, addSkill, removeSkill }
}
