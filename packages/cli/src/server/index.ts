import { watch } from 'chokidar'
import type { Command, Event, MessageCommand, SlashCommand, SlashSubcommand, UserCommand } from 'chooksie'
import { fetch } from 'chooksie/fetch'
import type { AppCommand } from 'chooksie/internals'
import type { ClientEvents } from 'discord.js'
import { join, relative } from 'path'
import { createClient, createKey, getAutocompletes, onInteractionCreate } from '../internals'
import { diffCommand, Store, tokenToAppId, transformCommand, validateDevConfig } from '../lib'
import { validateEvent, validateMessageCommand, validateSlashCommand, validateSlashSubcommand, validateUserCommand } from '../lib/validation'
import { createWatchCompiler } from './compiler'
import type { Stores } from './loaders'
import { loadEvent, loadMessageCommand, loadScript, loadSlashCommand, loadSlashSubcommand, loadUserCommand, unloadScript } from './loaders'
import { unrequire } from './require'
import { resolveConfig } from './resolve-config'

const root = process.cwd()
const outDir = join(root, '.chooks')

async function validate<T>(mod: T, validator: (mod: T) => Promise<unknown>): Promise<boolean> {
  try {
    await validator(mod)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
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

async function createServer(): Promise<void> {
  console.info('Starting bot...')
  const config = await resolveConfig(
    { root, outDir },
    { validator: validateDevConfig },
  )

  const stores: Stores = {
    module: new Store(),
    command: new Store(),
    event: new Store(),
    cleanup: new Store(),
  }

  const client = createClient(config)
  const appId = tokenToAppId(config.token)
  const login = client.login(config.token)

  const watcher = watch('*/**/*.?(m|c){js,ts}', {
    ignored: ['node_modules', 'dist', 'test?(s)', '.*', '*.d.?(m|c)ts'],
    cwd: root,
  })

  const url = `https://discord.com/api/v8/applications/${appId}/guilds/${config.devServer!}/commands`
  const credential = `Bot ${config.token}`

  async function register() {
    const commands: AppCommand[] = []
    for (const cmd of stores.module.values()) {
      commands.push(transformCommand(cmd))
    }

    const res = await fetch.put(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': credential,
      },
      body: JSON.stringify(commands),
    })

    if (res.ok) {
      console.info('Updated commands.')
    } else {
      // @todo: parse dapi error
      console.error(`Updating commands resulted in status code "${res.status}"`)
    }
  }

  stores.module.events.on('add', async (a, b) => {
    if (b === null) return
    if (diffCommand(a, b)) {
      console.info(`Updating command "${a.name}"...`)
      for (const key of getCommandKeys(b)) {
        stores.command.delete(key)
      }
      await register()
    }
  })

  stores.module.events.on('delete', async command => {
    console.info(`Deleting command "${command.name}"...`)
    for (const key of getCommandKeys(command)) {
      stores.command.delete(key)
    }
    await register()
  })

  const compiler = createWatchCompiler(watcher, { root, outDir })
  const listener = onInteractionCreate(stores.command)

  client.on('interactionCreate', listener)

  // @todo: command cache json file for diffing on start
  compiler.on('compile', async file => {
    const relpath = relative(root, file.source)
    const mod = await unrequire<unknown>(file.target)
    console.info(`File ${relpath} updated.`)

    if (file.type === 'command') {
      const command = mod.default as SlashCommand
      if (await validate(command, validateSlashCommand)) {
        stores.module.set(relpath, command)
        loadSlashCommand(stores.command, command)
      }
      return
    }

    if (file.type === 'subcommand') {
      const command = mod.default as SlashSubcommand
      if (await validate(command, validateSlashSubcommand)) {
        stores.module.set(relpath, command)
        loadSlashSubcommand(stores.command, command)
      }
      return
    }

    if (file.type === 'user') {
      const command = mod.default as UserCommand
      if (await validate(command, validateUserCommand)) {
        command.type ??= 'USER'
        stores.module.set(relpath, command)
        loadUserCommand(stores.command, command)
      }
      return
    }

    if (file.type === 'message') {
      const command = mod.default as MessageCommand
      if (await validate(command, validateMessageCommand)) {
        command.type ??= 'MESSAGE'
        stores.module.set(relpath, command)
        loadMessageCommand(stores.command, command)
      }
      return
    }

    if (file.type === 'event') {
      const command = mod.default as Event<keyof ClientEvents>
      if (await validate(command, validateEvent)) {
        loadEvent(stores.event, client, command)
      }
      return
    }

    if (file.type === 'script') {
      await unloadScript(stores.cleanup, root, file)
      await loadScript(stores.cleanup, client, file)
      return
    }
  })

  compiler.on('delete', async file => {
    if (file.type === 'script') {
      await unloadScript(stores.cleanup, root, file)
      return
    }

    if (file.type !== 'config') {
      const relpath = relative(root, file.source)
      stores.module.delete(relpath)
      return
    }
  })

  await login
  console.info('Logged in!')
}

export = createServer
