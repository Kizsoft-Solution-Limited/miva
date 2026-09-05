import axios from 'axios'

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const data = error.response?.data as
    | { message?: string | string[]; error?: string }
    | undefined

  if (Array.isArray(data?.message)) {
    return data.message.join(' · ')
  }
  if (typeof data?.message === 'string') {
    return data.message
  }

  return error.message || fallback
}
