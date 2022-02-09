import { interopRequireDefault } from '@swc/helpers'
import type { ChooksScript, Event, GenericHandler, MessageCommand, SlashCommand, SlashSubcommand, UserCommand } from 'chooksie'
import { createClient, loadEvent, loadMessageCommand, loadScript, loadSlashCommand, loadSlashSubcommand, loadUserCommand, resolveInteraction, walk } from 'chooksie/internals'
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
    const mod = interopRequireDefault(await import(path) as unknown).default
    const type = getFileType(path)

    if (type === 'commands') {
      await loadSlashCommand(store, mod as SlashCommand)
      return
    }

    if (type === 'subcommands') {
      await loadSlashSubcommand(store, mod as SlashSubcommand)
      return
    }

    if (type === 'users') {
      await loadUserCommand(store, mod as UserCommand)
      return
    }

    if (type === 'messages') {
      await loadMessageCommand(store, mod as MessageCommand)
      return
    }

    if (type === 'events') {
      await loadEvent(client, mod as Event<keyof ClientEvents>)
      return
    }

    if (type === 'scripts') {
      const script = mod as Record<string, unknown>
      if (hasScript(script)) {
        await loadScript(client, script)
      }
    }
  }

  for await (const file of files) {
    void loadFile(file.path)
  }

  await login
}

void main()
