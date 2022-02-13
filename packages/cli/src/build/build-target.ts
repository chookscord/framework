process.env.NODE_ENV = 'production'
import type { ChooksScript, Event, GenericHandler, MessageCommand, SlashCommand, SlashSubcommand, UserCommand } from 'chooksie'
import { createClient, loadEvent, loadMessageCommand, loadScript, loadSlashCommand, loadSlashSubcommand, loadUserCommand, onInteractionCreate, timer, walk } from 'chooksie/internals'
import type { ClientEvents } from 'discord.js'
import 'dotenv/config'
import { relative } from 'path'
import type { SourceDir } from '../lib'
import config from './chooks.config.js'

const MODULE_NAMES: SourceDir[] = ['commands', 'subcommands', 'messages', 'users', 'events']

function hasScript(mod: Record<string, unknown>): mod is ChooksScript {
  return typeof mod.chooksOnLoad === 'function'
}

function getFileType(path: string): SourceDir | 'scripts' {
  const relPath = path.slice(__dirname.length + 1)
  const rootDir = relPath.slice(0, relPath.indexOf('/')) as SourceDir

  return MODULE_NAMES.includes(rootDir)
    ? rootDir
    : 'scripts'
}


async function main() {
  console.info('Starting bot...')
  const measure = timer()

  const client = createClient(config)
  const login = client.login(config.token)

  const files = walk(__dirname, { ignore: file => file.path === __filename })
  const store = new Map<string, GenericHandler>()
  const listener = onInteractionCreate(store)

  client.on('interactionCreate', listener)

  for await (const file of files) {
    const relpath = relative(__dirname, file.path)
    const mod = await import(file.path) as { default: unknown }
    const type = getFileType(file.path)
    console.info(`Loading file "${relpath}"...`)

    if (type === 'commands') {
      const command = mod.default as SlashCommand
      await loadSlashCommand(store, command)
      console.info(`Loaded slash command "${command.name}".`)
      continue
    }

    if (type === 'subcommands') {
      const command = mod.default as SlashSubcommand
      await loadSlashSubcommand(store, command)
      console.info(`Loaded slash subcommand "${command.name}".`)
      continue
    }

    if (type === 'users') {
      const command = mod.default as UserCommand
      await loadUserCommand(store, command)
      console.info(`Loaded user command "${command.name}".`)
      continue
    }

    if (type === 'messages') {
      const command = mod.default as MessageCommand
      await loadMessageCommand(store, command)
      console.info(`Loaded message command "${command.name}".`)
      continue
    }

    if (type === 'events') {
      const event = mod.default as Event<keyof ClientEvents>
      await loadEvent(client, event)
      console.info(`Loaded event "${event.name}".`)
      continue
    }

    if (type === 'scripts') {
      const script = mod as Record<string, unknown>
      if (hasScript(script)) {
        await loadScript(client, script)
        console.info(`Loaded script at ${relpath}`)
      }
    }
  }

  await login
  const elapsed = measure()

  console.info('Bot started!')
  console.info(`Time Took: ${elapsed}`)
}

void main()
