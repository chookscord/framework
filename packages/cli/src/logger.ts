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
  const header = stack.indexOf(`${error.name}: ${error.message}`)

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

const TYPES: Record<LoggerType, string> = {
  app: pc.blue('app'),
  script: pc.blue('script'),
  autocomplete: pc.cyan('autocomplete'),
  event: pc.cyan('event'),
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

function format(chunk: Record<string, string | number | object>): string {
  const time = pc.green(new Date(chunk.time as number).toLocaleTimeString())

  const level = LEVELS[chunk.level as number]
  const type = TYPES[chunk.type as LoggerType]
  const name = pc.yellow(chunk.name as string)

  const message = chunk.err
    ? `\n\n${prettifyError(toError(chunk.err as PinoError))}\n`
    : chunk.msg as string

  return `[${time}] [${level}] (${type}) (${name}): ${message}\n`
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
