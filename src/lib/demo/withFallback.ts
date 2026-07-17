export interface FallbackResult<T> {
  value: T
  usedFallback: boolean
}

/**
 * Races a real network call against a timeout, and against any thrown
 * error, always resolving to a usable value — never rejects. Used by
 * Presentation Mode so a slow or unavailable AI backend cannot stall or
 * break a scripted, timed judge demo: on timeout or failure it silently
 * falls back to a pre-written illustrative example instead.
 */
export async function withFallback<T>(
  promise: Promise<T>,
  fallback: T,
  timeoutMs = 8_000,
): Promise<FallbackResult<T>> {
  let timeoutHandle: ReturnType<typeof setTimeout>

  const timeout = new Promise<{ ok: false }>((resolve) => {
    timeoutHandle = setTimeout(() => resolve({ ok: false }), timeoutMs)
  })

  const attempt = promise
    .then((value) => ({ ok: true as const, value }))
    .catch(() => ({ ok: false as const }))

  const result = await Promise.race([attempt, timeout])
  clearTimeout(timeoutHandle!)

  if (result.ok) {
    return { value: result.value, usedFallback: false }
  }
  return { value: fallback, usedFallback: true }
}
