import { interopRequireDefault } from '@swc/helpers'
import type { ChooksScript, Command, Event, GenericHandler, SlashSubcommand } from 'chooksie'
import { createClient, loadCommand, loadEvent, loadScript, loadSubcommand, resolveInteraction, walk } from 'chooksie/internals'
import type { ClientEvents } from 'discord.js'
import 'dotenv/config'
import type { SourceDir } from '../lib'
import config from './chooks.config.js'

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
  const login = client.login(config.token)

  const store = new Map<string, GenericHandler>()

  client.on('interactionCreate', async interaction => {
    const handler = resolveInteraction(store, interaction)
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
        await loadCommand(store, <unknown>mod as Exclude<Command, SlashSubcommand>)
        return
      case 'subcommands':
        await loadSubcommand(store, <unknown>mod as SlashSubcommand)
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
