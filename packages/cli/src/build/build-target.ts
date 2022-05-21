process.env.NODE_ENV = 'production'
import type { ChooksScript, Command, Event, MessageCommand, ModalHandler, SlashCommand, SlashSubcommand, UserCommand } from 'chooksie'
import 'chooksie/dotenv'
import { createClient, createLogger, loadEvent, loadMessageCommand, loadModal, loadScript, loadSlashCommand, loadSlashSubcommand, loadUserCommand, onInteractionCreate, timer, walk } from 'chooksie/internals'
import { version } from 'chooksie/package.json'
import type { ClientEvents } from 'discord.js'
import { relative } from 'path'
import type { SourceDir } from '../lib'
import config from './chooks.config.js'

const pino = createLogger()
const logger = pino('app', 'chooks')

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
  logger.info(`Using chooksie v${version}`)
  logger.info('Starting bot...')
  const endTimer = timer()

  const client = createClient(config)
  const login = client.login(config.token)

  const files = walk(__dirname, { ignore: file => file.path === __filename })
  const commandStore = new Map<string, Command>()
  const listener = onInteractionCreate(commandStore, pino)

  client.on('interactionCreate', listener)

  for await (const file of files) {
    const relpath = relative(__dirname, file.path)
    const mod = await import(file.path) as { default: unknown }
    const type = getFileType(file.path)
    logger.info(`Loading file "${relpath}"...`)

    if (type === 'commands') {
      const command = mod.default as SlashCommand
      await loadSlashCommand(commandStore, command)
      logger.info(`Loaded slash command "${command.name}".`)
      continue
    }

    if (type === 'subcommands') {
      const command = mod.default as SlashSubcommand
      await loadSlashSubcommand(commandStore, command)
      logger.info(`Loaded slash subcommand "${command.name}".`)
      continue
    }

    if (type === 'users') {
      const command = mod.default as UserCommand
      await loadUserCommand(commandStore, command)
      logger.info(`Loaded user command "${command.name}".`)
      continue
    }

    if (type === 'messages') {
      const command = mod.default as MessageCommand
      await loadMessageCommand(commandStore, command)
      logger.info(`Loaded message command "${command.name}".`)
      continue
    }

    if (type === 'modals') {
      const modal = mod.default as ModalHandler
      await loadModal(commandStore, modal)
      logger.info(`Loaded modal "${modal.customId}".`)
      continue
    }

    if (type === 'events') {
      const event = mod.default as Event<keyof ClientEvents>
      await loadEvent(client, event)
      logger.info(`Loaded event "${event.name}".`)
      continue
    }

    if (type === 'scripts') {
      const script = mod as Record<string, unknown>
      if (hasScript(script)) {
        await loadScript(client, relpath, script)
        logger.info(`Loaded script at ${relpath}`)
      }
    }
  }

  await login
  const elapsed = endTimer()

  logger.info('Bot started!')
  logger.info(`Time Took: ${elapsed.toFixed(2)}ms`)
}

void main()
