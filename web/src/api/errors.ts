import axios from 'axios'

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }

  if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
    return 'Request timed out. Try again in a moment.'
  }

  if (!error.response) {
    return 'Cannot reach the API. Is the Nest server running on port 3000?'
  }

  const status = error.response.status
  const data = error.response.data as
    | { message?: string | string[]; error?: string }
    | undefined

  if (status === 400) {
    if (Array.isArray(data?.message)) return data.message.join(' · ')
    if (typeof data?.message === 'string') return data.message
    return 'Check the form — something looks invalid.'
  }

  if (status === 429) {
    if (typeof data?.message === 'string') return data.message
    return 'Too many requests. Wait a bit and try again.'
  }

  if (status === 404) return 'That milestone was not found.'
  if (status >= 500) {
    return 'Server error while verifying. Check API logs and retry.'
  }

  if (Array.isArray(data?.message)) return data.message.join(' · ')
  if (typeof data?.message === 'string') return data.message

  return error.message || fallback
}
