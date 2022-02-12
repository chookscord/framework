import fetch from 'chooksie/fetch'
import type { AppCommand } from 'chooksie/internals'

interface SuccessResult {
  status: 'OK'
}

interface RateLimitResult {
  status: 'RATE_LIMIT'
  resetAfter: number
}

interface ErrorResult {
  status: 'ERROR'
  error: unknown
}

export type RegisterResult = SuccessResult | RateLimitResult | ErrorResult
export interface RegisterOptions {
  url: string
  credentials: string
  commands: AppCommand[]
  signal?: AbortSignal
}

async function registerCommands(opts: RegisterOptions): Promise<RegisterResult> {
  const res = await fetch.put(opts.url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': opts.credentials,
    },
    body: JSON.stringify(opts.commands),
    signal: opts.signal,
  })

  if (res.ok) {
    console.info('Updated commands.')
    console.info(`Updates left before reset: ${res.headers.get('X-RateLimit-Remaining')}`)
    return { status: 'OK' }
  }

  // Handle rate limits
  if (res.headers.get('X-RateLimit-Remaining') === '0') {
    const nextReset = res.headers.get('X-RateLimit-Reset-After')
    const resetAfter = Date.now() + Number(nextReset) * 1000
    console.warn(`Rate limit reached! Next register available in: ${nextReset}s`)
    return { status: 'RATE_LIMIT', resetAfter }
  }

  // @todo: parse dapi error
  console.error(`Updating commands resulted in status code "${res.status}"`)
  const error = await res.json()

  return { status: 'ERROR', error }
}

export default registerCommands
