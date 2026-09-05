import { describe, expect, it } from 'vitest'
import axios from 'axios'
import { apiErrorMessage } from '@/api/errors'

describe('apiErrorMessage', () => {
  it('maps timeout', () => {
    const err = new axios.AxiosError('timeout')
    err.code = 'ECONNABORTED'
    expect(apiErrorMessage(err, 'fallback')).toContain('timed out')
  })

  it('maps network failure', () => {
    const err = new axios.AxiosError('Network Error')
    expect(apiErrorMessage(err, 'fallback')).toContain('Cannot reach the API')
  })

  it('maps 429', () => {
    const err = new axios.AxiosError('fail')
    err.response = {
      status: 429,
      data: { message: 'Too many requests. Try again in 12s.' },
      statusText: '',
      headers: {},
      config: {} as never,
    }
    expect(apiErrorMessage(err, 'fallback')).toContain('Too many requests')
  })
})
