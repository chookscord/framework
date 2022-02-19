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

function prettifyStack(stack: string, indent: string) {
  const lines = stack.split('\n')
  let message = ''

  for (let i = 1, n = lines.length; i < n; i++) {
    const line = lines[i].trim().slice(3) // remove 'at'
    const trace = line.includes('(')
      ? line.replace(stackRegex, stackFormat)
      : pc.cyan(line)

    message += `\n${indent}${at} ${trace}`
  }

  return message
}

function prettifyError(error: Error | PinoError) {
  const name = pc.red(pc.inverse(` ${(<PinoError>error).type ?? (<Error>error).name} `))
  const header = `  ${name} ${error.message}`.trimEnd()

  if (error.stack) {
    return `${header}\n${prettifyStack(error.stack, '    ')}`
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
  app: pc.red('app'),
  autocomplete: pc.cyan('autocomplete'),
  event: pc.cyan('event'),
  command: pc.green('command'),
  subcommand: pc.green('subcommand'),
  message: pc.yellow('message'),
  user: pc.yellow('user'),
  script: pc.blue('script'),
}

function format(chunk: Record<string, string | number | object>): string {
  const time = pc.green(new Date(chunk.time as number).toLocaleTimeString())

  const level = LEVELS[chunk.level as number]
  const type = TYPES[chunk.type as LoggerType]
  const name = pc.yellow(chunk.name as string)

  const message = chunk.err
    ? `\n\n${prettifyError(chunk.err as PinoError)}\n`
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
