export function walletErrorMessage(error: unknown, fallback: string): string {
  if (
    !(error instanceof Error) &&
    (typeof error !== 'object' || error === null)
  ) {
    return fallback
  }

  const err = error as {
    shortMessage?: string
    message?: string
    code?: number | string
    name?: string
    details?: string
    cause?: { code?: number | string; message?: string }
  }

  const hay = [
    err.shortMessage,
    err.message,
    err.details,
    err.name,
    err.cause?.message,
    typeof err.cause?.code !== 'undefined' ? String(err.cause.code) : '',
    typeof err.code !== 'undefined' ? String(err.code) : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (
    err.code === 4001 ||
    err.code === 'ACTION_REJECTED' ||
    err.cause?.code === 4001 ||
    hay.includes('user rejected') ||
    hay.includes('user denied') ||
    hay.includes('rejected the request') ||
    hay.includes('request rejected')
  ) {
    return 'Cancelled in wallet.'
  }

  const short = err.shortMessage?.trim()
  if (short && short.length <= 140 && !short.includes('\n')) {
    return short
  }

  const firstLine = (err.message || '')
    .split('\n')
    .map((l) => l.trim())
    .find(Boolean)
  if (firstLine && firstLine.length <= 140) {
    return firstLine
  }

  return fallback
}
