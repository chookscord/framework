import type { LoggerType } from 'chooksie/internals'
import type { Transform } from 'node:stream'
import { once } from 'node:stream'
import * as pc from 'picocolors'
import build from 'pino-abstract-transport'
import SonicBoom from 'sonic-boom'

const stackRegex = /\(([^)]+)\)/
const stackFormat = `(${pc.cyan('$1')})`
const at = pc.dim('at')

interface PinoError {
  type: string
  message: string
  stack?: string
}

function prettifyCode(codes: string[]) {
  const source = pc.yellow(codes[0])
  const target = pc.red(codes.at(-2))
  const code = codes.slice(1, -2).join('\n')

  return `\n${source}\n${code}\n${target}\n`
}

function prettifyStack(error: Error, indent: string) {
  const stack = error.stack!.split('\n')
  const header = stack.findIndex(line => line.startsWith(`${indent}at`)) - 1

  // Removes header, includes cases with source maps enabled
  const codes = stack.slice(0, header)
  const lines = stack.slice(header + 1)

  let message = codes.length > 0
    ? prettifyCode(codes)
    : ''

  const prefix = `\n${indent}${at} `
  for (let i = 0, n = lines.length; i < n; i++) {
    const line = lines[i].trim().slice(3) // removes 'at'

    const trace = line.includes('(')
      ? line.replace(stackRegex, stackFormat)
      : pc.cyan(line)

    message += prefix + trace
  }

  return message
}

function prettifyError(error: Error) {
  const name = pc.red(pc.inverse(` ${error.name} `))
  const header = `  ${name} ${error.message}`.trimEnd()

  if (error.stack) {
    return `${header}\n${prettifyStack(error, '    ')}`
  }

  return header
}

const LEVELS: Record<number, string> = {
  60: pc.red('FATAL'),
  50: pc.red('ERROR'),
  40: pc.yellow('WARN'),
  30: pc.green('INFO'),
  20: pc.gray('DEBUG'),
  10: pc.dim('TRACE'),
}

const TYPES: Record<LoggerType | 'fastify', string> = {
  fastify: pc.red('fastify'),
  app: pc.blue('app'),
  script: pc.blue('script'),
  autocomplete: pc.cyan('autocomplete'),
  event: pc.cyan('event'),
  modal: pc.cyan('modal'),
  command: pc.green('command'),
  subcommand: pc.green('subcommand'),
  message: pc.yellow('message'),
  user: pc.yellow('user'),
}

function toError(err: PinoError): Error {
  const error = new Error(err.message)
  error.name = err.type
  error.stack = err.stack
  return error
}

function statusCode(code: number) {
  // 100-299
  if (code < 300) return pc.green(code)
  // 300-399
  if (code < 400) return pc.yellow(code)
  // 400-599
  return pc.red(code)
}

interface FastifyReq {
  method: string
  url: string
  hostname: string
  remoteAddress: string
  remotePort: number
}

interface FastifyRes {
  statusCode: number
}

function formatReqId(id: string) {
  return id.length === 36
    ? id.split('-')[0] // Shorten UUID
    : id
}

function format(chunk: Record<string, string | number | object>): string {
  const level = LEVELS[chunk.level as number]
  const time = pc.green(new Date(chunk.time as number).toLocaleTimeString())

  // For fastify system messages, request id does not exist
  const reqId = typeof chunk.reqId === 'string'
    ? pc.magenta(formatReqId(chunk.reqId))
    : ''

  const resTime = typeof chunk.responseTime === 'number'
    ? pc.cyan(`${chunk.responseTime.toFixed(2)}ms`)
    : ''

  const type = TYPES[chunk.type as LoggerType]
  const id = `${type} ${reqId}`.trim()

  // @todo: handle passing object as log
  const message = chunk.err
    ? `\n\n${prettifyError(toError(chunk.err as PinoError))}\n`
    : chunk.msg as string

  if (chunk.type === 'fastify') {
    if (chunk.req) {
      const req = chunk.req as FastifyReq
      const method = pc.green(req.method)
      const url = pc.cyan(req.hostname + req.url)
      return `[${time}] [${level}] (${id}) (${method} ${url}): ${message}\n`
    }

    if (chunk.res) {
      const res = chunk.res as FastifyRes
      const status = statusCode(res.statusCode)
      const result = `${status} ${resTime}`.trim()

      return `[${time}] [${level}] (${id}) (${result}): ${message}\n`
    }

    // For system messages
    return `[${time}] [${level}] (${id}): ${message}\n`
  }

  const name = pc.yellow(chunk.name as string)
  const res = `${name} ${resTime}`.trim()

  return `[${time}] [${level}] (${id}) (${res}): ${message}\n`
}

function transport(): Transform {
  const dest = new SonicBoom({ dest: 1, sync: false })

  const write = async (source: AsyncIterable<Record<string, string | number | object>>) => {
    for await (const chunk of source) {
      const throttle = dest.write(format(chunk))
      if (throttle) await once(dest, 'drain')
    }
  }

  return build(write)
}

transport.target = __filename

export = transport
