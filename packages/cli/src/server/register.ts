import type { Command } from 'chooksie'
import type { AppCommand } from 'chooksie/internals'
import { createKey, getAutocompletes } from '../internals'
import { diffCommand, registerCommands, tokenToAppId, transformCommand } from '../lib'
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
  const credentials = `Bot ${token}`

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
      const signal = controller.signal
      const res = await registerCommands({ url, credentials, commands, signal })

      if (res.status === 'OK') {
        syncCommands()
        return
      }

      if (res.status === 'RATE_LIMIT') {
        resetAfter = Date.now() + res.resetAfter * 1000
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
