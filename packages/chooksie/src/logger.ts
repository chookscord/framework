import type { Logger } from 'pino'
import { logger } from './internals/logger.js'

export function createLogger(type: string, name: string): Logger {
  return logger.child({ type, name })
}
