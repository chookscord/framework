import type { Logger } from 'pino'
import { createLogger as _createLogger } from './internals/logger.js'

export const createLogger = _createLogger as (type: string, name: string) => Logger
