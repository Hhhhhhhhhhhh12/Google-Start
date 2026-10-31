import { describe, expect, it, vi } from 'vitest'
import { API_KEY_STORAGE_KEY, deleteApiKey, loadApiKey, saveApiKey } from './apiKey'

const store = () => {
  const data = new Map<string, string>()
  return { data, getItem: vi.fn((key: string) => data.get(key) ?? null), setItem: vi.fn((key: string, value: string) => { data.set(key, value) }), removeItem: vi.fn((key: string) => { data.delete(key) }) }
}

describe('explicit API key retention', () => {
  it('defaults to session scope and removes former permanent copies', () => {
    const session = store(), persistent = store()
    persistent.data.set(API_KEY_STORAGE_KEY, 'old-key')
    expect(loadApiKey(session, persistent).remembered).toBe(true)
    expect(saveApiKey(' session-key ', false, session, persistent)).toBeNull()
    expect(session.data.get(API_KEY_STORAGE_KEY)).toBe('session-key')
    expect(persistent.data.has(API_KEY_STORAGE_KEY)).toBe(false)
    expect(loadApiKey(session, persistent)).toEqual({ key: 'session-key', remembered: false, error: null })
    expect(loadApiKey(store(), persistent).key).toBe('')
  })

  it('remembers a key only when selected and deletes both storage scopes', () => {
    const session = store(), persistent = store()
    saveApiKey('remembered-key', true, session, persistent)
    expect(session.data.has(API_KEY_STORAGE_KEY)).toBe(false)
    expect(persistent.data.get(API_KEY_STORAGE_KEY)).toBe('remembered-key')
    session.data.set(API_KEY_STORAGE_KEY, 'second-copy')
    expect(deleteApiKey(session, persistent)).toBeNull()
    expect(loadApiKey(session, persistent).key).toBe('')
  })

  it('still attempts to delete the other scope on storage failure and never leaks details', () => {
    const session = store(), persistent = store()
    session.removeItem.mockImplementation(() => { throw new Error('private-key') })
    persistent.data.set(API_KEY_STORAGE_KEY, 'private-key')
    const error = deleteApiKey(session, persistent)
    expect(persistent.data.size).toBe(0)
    expect(error).toContain('nicht aus allen')
    expect(error).not.toContain('private-key')
  })
})
