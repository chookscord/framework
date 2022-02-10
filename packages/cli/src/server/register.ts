import type { Command } from 'chooksie'
import fetch from 'chooksie/fetch'
import type { AppCommand } from 'chooksie/internals'
import { createKey, getAutocompletes } from '../internals'
import { diffCommand, tokenToAppId, transformCommand } from '../lib'
import type { Stores } from './loaders'

function isAbortError(error: unknown): error is Error {
  return error instanceof Error && error.name === 'AbortError'
}

function* getCommandKeys(command: Command) {
  const prefix = command.type === 'USER'
    ? 'usr'
    : command.type === 'MESSAGE'
      ? 'msg'
      : 'cmd'

  yield createKey(prefix, command.name)

  if (!('options' in command)) return
  if (!Array.isArray(command.options)) return

  for (const option of command.options) {
    if ('autocomplete' in option) {
      yield createKey('auto', command.name, option.name)
      continue
    }

    if (option.type === 'SUB_COMMAND') {
      yield createKey('cmd', command.name, option.name)
      for (const autocomplete of getAutocompletes(option.options)) {
        yield createKey('auto', command.name, option.name, autocomplete.name)
      }
      continue
    }

    if (option.type === 'SUB_COMMAND_GROUP') {
      for (const subcommand of option.options) {
        yield createKey('cmd', command.name, option.name, subcommand.name)
        for (const autocomplete of getAutocompletes(subcommand.options)) {
          yield createKey('auto', command.name, option.name, subcommand.name, autocomplete.name)
        }
      }
    }
  }
}

function watchCommands(stores: Stores, token: string, devServer: string): void {
  const appId = tokenToAppId(token)
  const url = `https://discord.com/api/v8/applications/${appId}/guilds/${devServer}/commands`
  const credential = `Bot ${token}`

  const unsyncedCommands: Command[] = []
  let timeout: NodeJS.Timeout
  let controller: AbortController
  let resetAfter = 0

  const syncCommands = () => {
    unsyncedCommands.splice(0)
      .map(getCommandKeys)
      .forEach(keys => {
        for (const key of keys) {
          stores.command.delete(key)
        }
      })
  }

  const registerCommands = async (commands: AppCommand[]) => {
    const res = await fetch.put(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': credential,
      },
      body: JSON.stringify(commands),
      signal: controller.signal,
    })

    if (res.ok) {
      console.info('Updated commands.')
      console.info(`Updates left before reset: ${res.headers.get('X-RateLimit-Remaining')}`)
    } else if (res.status !== 429) {
      // @todo: parse dapi error
      console.error(`Updating commands resulted in status code "${res.status}"`)
    }

    // Handle rate limits
    if (res.headers.get('X-RateLimit-Remaining') === '0') {
      const nextReset = res.headers.get('X-RateLimit-Reset-After')
      resetAfter = Date.now() + Number(nextReset) * 1000
      console.warn(`Rate limit reached! Next register available in: ${nextReset}s`)
    }

    return res.ok
  }

  // Parse modules, reset controller and register commands
  const _register = async () => {
    console.debug('Updating commands...')

    const commands: AppCommand[] = []
    for (const cmd of stores.module.values()) {
      commands.push(transformCommand(cmd))
    }

    try {
      // only sync commands once commands actually are updated
      controller = new AbortController()
      if (await registerCommands(commands)) {
        syncCommands()
      }
    } catch (error) {
      if (!isAbortError(error)) {
        // @todo: error handling?
        throw error
      }
    }
  }

  // Clear queued registers and check rate limit
  const register = () => {
    clearTimeout(timeout)
    controller?.abort()

    // If rate limited, run after the set timeout expires, else default to 250ms
    const runAfter = Math.max(resetAfter - Date.now(), 250)
    timeout = setTimeout(_register, runAfter)
  }

  stores.module.events.on('add', (a, b) => {
    if (b === null) {
      register()
      return
    }

    if (diffCommand(a, b)) {
      console.info(`Updating command "${a.name}"...`)
      unsyncedCommands.push(b)
      register()
    }
  })

  stores.module.events.on('delete', command => {
    console.info(`Deleting command "${command.name}"...`)
    unsyncedCommands.push(command)
    register()
  })
}

export default watchCommands
