import { CommandModule } from 'chooksie'
import type { AppCommand, LoggerFactory } from 'chooksie/internals'
import { createKey, getAutocompletes } from '../internals'
import { diffCommand, registerCommands, tokenToAppId, transformModule } from '../lib'
import type { Stores } from './loaders'

function isAbortError(error: unknown): error is Error {
  return error instanceof Error && error.name === 'AbortError'
}

function* getCommandKeys(mod: CommandModule) {
  const prefix = mod.type === 'USER'
    ? 'usr'
    : mod.type === 'MESSAGE'
      ? 'msg'
      : 'cmd'

  yield createKey(prefix, mod.name)

  if (!('options' in mod)) return
  if (!Array.isArray(mod.options)) return

  for (const option of mod.options) {
    if ('autocomplete' in option) {
      yield createKey('auto', mod.name, option.name)
      continue
    }

    if (option.type === 'SUB_COMMAND') {
      yield createKey('cmd', mod.name, option.name)
      for (const autocomplete of getAutocompletes(option.options)) {
        yield createKey('auto', mod.name, option.name, autocomplete.name)
      }
      continue
    }

    if (option.type === 'SUB_COMMAND_GROUP') {
      for (const subcommand of option.options) {
        yield createKey('cmd', mod.name, option.name, subcommand.name)
        for (const autocomplete of getAutocompletes(subcommand.options)) {
          yield createKey('auto', mod.name, option.name, subcommand.name, autocomplete.name)
        }
      }
    }
  }
}

function watchCommands(stores: Stores, token: string, devServer: string, pino: LoggerFactory): void {
  const appId = tokenToAppId(token)
  const url = `https://discord.com/api/v8/applications/${appId}/guilds/${devServer}/commands`
  const credentials = `Bot ${token}`
  const logger = pino('app', 'register')

  const unsyncedModules: CommandModule[] = []
  let timeout: NodeJS.Timeout
  let controller: AbortController
  let resetAfter = 0

  const modules = stores.module
  const commands = stores.command

  /**
   * diffs module versions and unsyncs deleted commands from live command store
   * @example
   * let char = command, num = version
   * A1    A2   +A2
   * B1 -> B1 =  B1
   * C1    D1   -C1 (C1 will be unsynced)
   *            +D1
   */
  const syncModules = () => {
    for (let i = 0, n = unsyncedModules.length; i < n; i++) {
      const unsyncedModule = unsyncedModules[i]
      const keys = [...getCommandKeys(unsyncedModule)]
      const o = keys.length

      // grab latest timestamp
      // since deleted commands won't have new timestamps,
      // delete all commands less than the latest
      let latest = 0
      for (let j = 0; j < o; j++) {
        const key = keys[j]
        if (commands.has(key)) {
          const updatedAt = commands.get(key)!.updatedAt
          latest = Math.max(latest, updatedAt ?? 0)
        }
      }

      // do deletion here
      for (let j = 0; j < o; j++) {
        const key = keys[j]
        if (commands.has(key)) {
          const command = commands.get(key)!
          if (command.updatedAt! < latest) {
            commands.delete(key)
          }
        }
      }
    }
  }

  // Parse modules, reset controller and register commands
  const registerModules = async () => {
    logger.debug('Updating commands...')

    const transformed: AppCommand[] = []
    for (const mod of modules.values()) {
      transformed.push(transformModule(mod))
    }

    try {
      // only sync commands once commands actually are updated
      controller = new AbortController()
      const res = await registerCommands({
        url,
        credentials,
        commands: transformed,
        signal: controller.signal,
        logger,
      })

      if (res.status === 'RATE_LIMIT') {
        resetAfter = Date.now() + res.resetAfter * 1000
      }

      return res.status === 'OK'
    } catch (error) {
      if (!isAbortError(error)) {
        // @todo: error handling?
        throw error
      }
    }
  }

  const registerAndSync = async () => {
    const ok = await registerModules()
    if (ok) {
      syncModules()
    }
  }

  // Clear queued registers and check rate limit
  const queueRegister = () => {
    clearTimeout(timeout)
    controller?.abort()

    // If rate limited, run after the set timeout expires, else default to 250ms
    const runAfter = Math.max(resetAfter - Date.now(), 250)
    timeout = setTimeout(registerAndSync, runAfter)
  }

  modules.events.on('add', (a, b) => {
    // if b is null, a is new so always queue
    if (b === null) {
      queueRegister()
      return
    }

    if (diffCommand(a, b)) {
      logger.info(`Updating command "${a.name}"...`)
      unsyncedModules.push(b)
      queueRegister()
    }
  })

  modules.events.on('delete', command => {
    logger.info(`Deleting command "${command.name}"...`)
    unsyncedModules.push(command)
    queueRegister()
  })
}

export default watchCommands
