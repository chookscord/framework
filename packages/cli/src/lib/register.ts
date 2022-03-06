import type { Logger } from 'chooksie'
import type { AppCommand } from 'chooksie/internals'
import resolveLocal from './resolve'

const { fetch } = resolveLocal<typeof import('chooksie/fetch')>('chooksie/fetch')

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
  logger?: Logger
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
    opts.logger?.info('Updated commands.')
    opts.logger?.info(`Updates left before reset: ${res.headers.get('X-RateLimit-Remaining')}`)
    return { status: 'OK' }
  }

  // Handle rate limits
  if (res.headers.get('X-RateLimit-Remaining') === '0') {
    const nextReset = res.headers.get('X-RateLimit-Reset-After')
    opts.logger?.warn(`Rate limit reached! Next register available in: ${nextReset}s`)
    return { status: 'RATE_LIMIT', resetAfter: Number(nextReset) }
  }

  // @todo: parse dapi error
  opts.logger?.error(`Updating commands resulted in status code "${res.status}"`)
  const error = await res.json()

  return { status: 'ERROR', error }
}

export default registerCommands
