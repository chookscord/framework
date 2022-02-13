import { watch } from 'chokidar'
import type { Command, Event, MessageCommand, SlashCommand, SlashSubcommand, UserCommand } from 'chooksie'
import type { ClientEvents } from 'discord.js'
import 'dotenv/config'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { join, relative, resolve } from 'path'
import { createClient, onInteractionCreate } from '../internals'
import { sourceFromFile, Store, validateDevConfig } from '../lib'
import { validateEvent, validateMessageCommand, validateSlashCommand, validateSlashSubcommand, validateUserCommand } from '../lib/validation'
import { createWatchCompiler } from './compiler'
import type { Stores } from './loaders'
import { loadEvent, loadMessageCommand, loadScript, loadSlashCommand, loadSlashSubcommand, loadUserCommand, unloadScript } from './loaders'
import watchCommands from './register'
import { unloadMod, unrequire } from './require'
import { resolveConfig } from './resolve-config'

type CachedCommand = [key: string, module: Command]

const root = process.cwd()
const outDir = join(root, '.chooks')
const cacheDir = join(outDir, '.chooksinfo')

const fileFromTarget = sourceFromFile({ root, outDir })

async function getCached() {
  try {
    const modules = await readFile(cacheDir, 'utf-8')
    const cached = JSON.parse(modules) as CachedCommand[]

    // Filter deleted files since last startup
    return cached.filter(([path]) => existsSync(resolve(path)))
  } catch {
    return []
  }
}

async function validate<T>(mod: T, validator: (mod: T) => Promise<unknown>): Promise<boolean> {
  try {
    await validator(mod)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

async function createServer(): Promise<void> {
  console.info('Starting bot...')
  const config = await resolveConfig(
    { root, outDir },
    { validator: validateDevConfig },
  )

  const stores: Stores = {
    module: new Store(await getCached()),
    command: new Store(),
    event: new Store(),
    cleanup: new Store(),
  }

  const client = createClient(config)
  const login = client.login(config.token)

  const watcher = watch('*/**/*.?(m|c){js,ts}', {
    ignored: ['node_modules', 'dist', 'test?(s)', '.*', '*.d.?(m|c)ts'],
    cwd: root,
  })

  // Watches command modules and updates using Discord API
  // Also syncs commands when modules are deleted.
  watchCommands(stores, config.token, config.devServer!)

  const compiler = createWatchCompiler(watcher, { root, outDir })
  const listener = onInteractionCreate(stores.command)

  client.on('interactionCreate', listener)

  // Save state of commands to diff changes on startup
  // This saves unnecessary registers when the bot is started
  const saveState = async () => {
    const modules = [...stores.module.entries()]
    await writeFile(cacheDir, JSON.stringify(
      modules,
      // Replace autocomplete functions to "true" to preserve the field
      (key: string, value: unknown) => key === 'autocomplete' && typeof value === 'function' || value,
    ))
  }

  stores.module.events.on('add', saveState)
  stores.module.events.on('delete', saveState)

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
      for (const key of unloadMod(file.target)) {
        const script = fileFromTarget(key)
        await unloadScript(stores.cleanup, root, script)
        await loadScript(stores.cleanup, client, root, script)
      }
      return
    }
  })

  compiler.on('delete', async file => {
    if (file.type === 'script') {
      await unloadScript(stores.cleanup, root, file)
      return
    }

    // No need to handle commands since it's handled by the module register.
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
