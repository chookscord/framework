import { interopRequireDefault } from '@swc/helpers'
import type { ChooksScript, Command, Event, SlashSubCommand } from 'chooksie'
import type { Stores } from 'chooksie/internals'
import { createClient, loadCommand, loadEvent, loadScript, loadSubCommand, resolveInteraction, walk } from 'chooksie/internals'
import type { ClientEvents } from 'discord.js'
import 'dotenv/config'
import config from './chooks.config.js'
import type { SourceDir } from '../lib'

const MODULE_NAMES: SourceDir[] = ['commands', 'subcommands', 'messages', 'users', 'events']

function getFileType(path: string): SourceDir | 'scripts' {
  const relPath = path.slice(__dirname.length + 1)
  const rootDir = relPath.slice(0, relPath.indexOf('/')) as SourceDir

  return MODULE_NAMES.includes(rootDir)
    ? rootDir
    : 'scripts'
}

function hasScript(mod: Record<string, unknown>): mod is ChooksScript {
  return typeof mod.chooksOnLoad === 'function'
}

async function main() {
  const client = createClient(config)
  const login = client.login(config.credentials.token)

  const stores: Stores = {
    command: new Map(),
    autocomplete: new Map(),
  }

  client.on('interactionCreate', async interaction => {
    const handler = resolveInteraction(stores, interaction)
    if (!handler) return

    if (!handler.execute) {
      console.warn(`Handler for "${handler.key}" is missing.`)
      return
    }

    try {
      await handler.execute({ client, interaction })
    } catch (error) {
      console.error(`Handler for "${handler.key}" threw an error!`)
      console.error(error)
    }
  })

  const files = walk(__dirname, { ignore: file => file.path === __filename })

  const loadFile = async (path: string) => {
    const mod = interopRequireDefault(await import(path) as Record<string, unknown>).default
    switch (getFileType(path)) {
      case 'commands':
      case 'messages':
      case 'users':
        await loadCommand(stores, <unknown>mod as Exclude<Command, SlashSubCommand>)
        return
      case 'subcommands':
        await loadSubCommand(stores, <unknown>mod as SlashSubCommand)
        return
      case 'events':
        await loadEvent(client, <unknown>mod as Event<keyof ClientEvents>)
        return
      case 'scripts':
        if (hasScript(mod)) {
          await loadScript(client, mod)
        }
    }
  }

  for await (const file of files) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    void loadFile(file.path)
  }

  await login
}

main().catch(error => {
  throw error
})
