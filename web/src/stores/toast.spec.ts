import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useToastStore } from '@/stores/toast'

describe('useToastStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('shows and auto-clears a message', () => {
    const toast = useToastStore()
    toast.show('Sign in as Founder to submit proof.', 'warn')
    expect(toast.message).toBe('Sign in as Founder to submit proof.')
    expect(toast.tone).toBe('warn')
    vi.advanceTimersByTime(5000)
    expect(toast.message).toBeNull()
  })
})
