import type { LoggerType } from 'chooksie/internals'
import { once } from 'events'
import pc from 'picocolors'
import type { OnUnknown } from 'pino-abstract-transport'
import { default as build } from 'pino-abstract-transport'
import { default as SonicBoom } from 'sonic-boom'
import type { Transform } from 'stream'
import type { InspectOptions } from 'util'
import { formatWithOptions } from 'util'

interface ErrorPayload {
  type: string
  message: string
  stack: string
}

interface BasePinoPayload {
  level: number
  time: number
  pid: number
  hostname: string
  msg?: string | Record<string, unknown>
  err?: ErrorPayload
}

interface Payload extends BasePinoPayload {
  type: string
  name: string
  reqId?: string
  responseTime?: number
  [key: string]: unknown
}

const INDENT = '    '
const AT = pc.dim(pc.gray('at'))
const OPEN_PAREN = pc.gray('(')
const CLOSE_PAREN = pc.gray(')')
const REPLACE_PATH = pc.cyan('$1')
const REPLACE_PATH_PARENS = `${OPEN_PAREN}${REPLACE_PATH}${CLOSE_PAREN}`
const REPLACE_PATH_REGEX = /\(([^)]+)\)/g
const REPLACE_PATH_PARENS_REGEX = /([\w]+:\/\/\S+)/g

const LEVELS: Record<number, string> = {
  60: pc.inverse(pc.bold(pc.red(' ‼ '))),
  50: pc.inverse(pc.bold(pc.red(' × '))),
  40: pc.inverse(pc.bold(pc.yellow(' ! '))),
  30: pc.inverse(pc.bold(pc.green(' i '))),
  20: pc.gray('>'),
  10: pc.gray('+'),
}

const TYPES: Record<LoggerType | 'fastify', string> = {
  fastify: pc.red('fastify'),
  app: pc.blue('app'),
  script: pc.blue('script'),
  autocomplete: pc.cyan('autocomplete'),
  event: pc.cyan('event'),
  modal: pc.cyan('modal'),
  button: pc.cyan('button'),
  command: pc.green('command'),
  subcommand: pc.green('subcommand'),
  message: pc.yellow('message'),
  user: pc.yellow('user'),
}

function prettifyError(err: ErrorPayload) {
  const type = pc.inverse(pc.red(` ${err.type} `))
  const header = `${type} ${err.message}`
  const stack = err.stack
    .split('\n')
    .filter(line => line.startsWith(INDENT))
    .map(line => {
      const contents = line.slice(7)
        .replace(REPLACE_PATH_REGEX, REPLACE_PATH_PARENS)
        .replace(REPLACE_PATH_PARENS_REGEX, REPLACE_PATH)
        .replaceAll('(', pc.gray('('))
        .replaceAll(')', pc.gray(')'))

      return `${INDENT}${AT} ${contents}`
    })

  return `${header}\n${stack.join('\n')}`
}

const stringifyObjOpts: InspectOptions = {
  colors: true,
  breakLength: 0,
}

function stringifyObj(obj: unknown) {
  return formatWithOptions(stringifyObjOpts, obj)
}

function isEmpty(obj: Record<string, unknown>) {
  // eslint-disable-next-line no-unreachable-loop
  for (const _ in obj) {
    return false
  }
  return true
}

// @todo: reimpl. fastify stuff
function prettify(payload: Payload) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { level, time, pid, hostname, type, name, reqId, msg, err, ...data } = payload
  const hasMsg = 'msg' in payload

  let message = hasMsg
    ? stringifyObj(msg)
    : ''

  if (err !== null && typeof err === 'object') {
    const m = prettifyError(err)
    if (err.message === message) {
      message = m
    } else if (typeof msg !== 'object') {
      message = `${message}\n${m}`
    } else {
      message = `${m}\n${message}`
    }
  }

  if (!isEmpty(data)) {
    const m = stringifyObj(data)
    message = message === ''
      ? m
      : `${message} ${m}`
  }

  const flevel = LEVELS[level]
  const ftype = TYPES[type as LoggerType] ?? pc.magenta(type)
  const fname = pc.yellow(name)
  const fTime = pc.gray(new Date(time).toLocaleTimeString())

  const prefix = reqId !== undefined
    ? `${flevel} ${ftype}${OPEN_PAREN}${fname} ${pc.red(String(reqId).slice(-6))}${CLOSE_PAREN}`
    : `${flevel} ${ftype}${OPEN_PAREN}${fname}${CLOSE_PAREN}`

  return `${prefix}: ${message} ${fTime}`
}

function writable(dest: SonicBoom) {
  let prev: Promise<unknown> | null
  return async (string: string) => {
    await prev
    prev = null
    const throttle = dest.write(string)
    if (throttle) {
      prev = once(dest, 'drain')
    }
  }
}

async function transport(): Promise<Transform & OnUnknown> {
  const stdout = new SonicBoom({ dest: 1, sync: false })
  const stderr = new SonicBoom({ dest: 2, sync: false })
  await Promise.all([once(stdout, 'ready'), once(stderr, 'ready')])

  const out = writable(stdout)
  const err = writable(stderr)

  const write = async (source: Transform & OnUnknown) => {
    for await (const chunk of source) {
      const dest = (chunk as Payload).level < 40
        ? out
        : err

      await dest(`${prettify(chunk as Payload)}\n`)
    }
  }

  return build(write)
}

export default transport
