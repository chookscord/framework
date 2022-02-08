import { watch } from 'chokidar'
import type { ChooksScript, Command, EmptyObject, Event, GenericHandler, MessageCommand, SlashCommand, SlashSubcommand, UserCommand } from 'chooksie'
import { fetch } from 'chooksie/fetch'
import type { AppCommand } from 'chooksie/internals'
import type { Awaitable, ClientEvents } from 'discord.js'
import type Joi from 'joi'
import { join, relative } from 'path'
import { createClient, createKey, resolveInteraction } from '../internals'
import { diffCommand, Store, tokenToAppId, transformCommand, validateDevConfig } from '../lib'
import { validateEvent, validateMessageCommand, validateSlashCommand, validateSlashSubcommand, validateUserCommand } from '../lib/validation'
import { createWatchCompiler } from './compiler'
import { unrequire } from './require'
import { resolveConfig } from './resolve-config'

const root = process.cwd()
const outDir = join(root, '.chooks')

function hasOnLoad(mod: Record<string, unknown>): mod is Required<ChooksScript> {
  return typeof mod.chooksOnLoad === 'function'
}

async function createServer(): Promise<void> {
  console.info('Starting bot...')
  const config = await resolveConfig(
    { root, outDir },
    { validator: validateDevConfig },
  )

  const client = createClient(config)
  const appId = tokenToAppId(config.token)
  const login = client.login(config.token)

  const watcher = watch('*/**/*.?(m|c){js,ts}', {
    ignored: ['node_modules', 'dist', 'test?(s)', '.*', '*.d.?(m|c)ts'],
    cwd: root,
  })

  const stores = {
    modules: new Store<Command>(),
    command: new Store<GenericHandler>(),
    event: new Store<() => void>(),
    cleanup: new Store<() => Awaitable<void>>(),
  }

  const url = `https://discord.com/api/v8/applications/${appId}/guilds/${config.devServer!}/commands`
  const register = async (command: AppCommand) => {
    console.info(`Updating command "${command.name}"...`)
    const res = await fetch.post(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${config.token}`,
      },
      body: JSON.stringify(command),
    })

    if (res.ok) {
      console.info(`Updated command "${command.name}".`)
    } else {
      console.error(`Updating command "${command.name}" resulted in status code "${res.status}".`)
    }
  }

  // @todo: handle command renames
  stores.modules.events.on('add', async (a, b) => {
    if (b === null) return
    if (diffCommand(a, b)) {
      const command = transformCommand(a)
      await register(command)
    }
  })

  stores.modules.events.on('delete', async a => {
    const commands: AppCommand[] = []
    for (const command of stores.modules.values()) {
      commands.push(transformCommand(command))
    }

    const res = await fetch.put(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${config.token}`,
      },
      body: JSON.stringify(commands),
    })

    if (res.ok) {
      console.info(`Deleted command "${a.name}".`)
    } else {
      console.error(`Deleting command "${a.name}" resulted in status code "${res.status}".`)
    }
  })

  const compiler = createWatchCompiler(watcher, { root, outDir })

  // @todo: refactor
  // @todo: handle file deletions
  // @todo: command cache json file for diffing on start
  compiler.on('compile', async file => {
    const relpath = relative(root, file.source)
    console.info(`File ${relpath} updated.`)

    if (file.type === 'command') {
      const mod = (await unrequire<SlashCommand>(file.target)).default
      try {
        await validateSlashCommand(mod)
      } catch (error) {
        console.error(`Slash command at ${relpath} failed validation! %s`, error)
        return
      }

      const setup = mod.setup ?? (() => ({}))
      const execute: GenericHandler = async ctx => {
        const deps = await setup()
        await (<GenericHandler>mod.execute).call(deps, ctx)
      }

      // @todo: autocompletes
      stores.command.set(createKey('cmd', mod.name), execute)
      stores.modules.set(mod.name, mod)
      return
    }

    if (file.type === 'subcommand') {
      const mod = (await unrequire<SlashSubcommand>(file.target)).default
      try {
        await validateSlashSubcommand(mod)
      } catch (error) {
        console.error(`Slash subcommand at ${relpath} failed validation!`)
        console.error((<Joi.ValidationError>error).message)
        return
      }

      for (const option of mod.options) {
        if (option.type === 'SUB_COMMAND') {
          const key = createKey('cmd', mod.name, option.name)

          const setup = option.setup ?? (() => ({}))
          const execute: GenericHandler = async ctx => {
            const deps = await setup() as EmptyObject
            await (<GenericHandler>option.execute).call(deps, ctx)
          }

          // @todo: autocompletes
          stores.command.set(key, execute)
        } else
        if (option.type === 'SUB_COMMAND_GROUP') {
          for (const subcommand of option.options) {
            const key = createKey('cmd', mod.name, option.name, subcommand.name)

            const setup = subcommand.setup ?? (() => ({}))
            const execute: GenericHandler = async ctx => {
              const deps = await setup() as EmptyObject
              await (<GenericHandler>subcommand.execute).call(deps, ctx)
            }

            // @todo: autocompletes
            stores.command.set(key, execute)
          }
        }
      }

      stores.modules.set(mod.name, mod)
      return
    }

    if (file.type === 'user') {
      const mod = (await unrequire<UserCommand>(file.target)).default
      try {
        await validateUserCommand(mod)
        mod.type = 'USER'
      } catch (error) {
        console.error(`User command at ${relpath} failed validation!`)
        console.error(error)
        return
      }

      const setup = mod.setup ?? (() => ({}))
      const execute: GenericHandler = async ctx => {
        const deps = await setup()
        await (<GenericHandler>mod.execute).call(deps, ctx)
      }

      stores.command.set(createKey('usr', mod.name), execute)
      stores.modules.set(mod.name, mod)
      return
    }

    if (file.type === 'message') {
      const mod = (await unrequire<MessageCommand>(file.target)).default
      try {
        await validateMessageCommand(mod)
        mod.type = 'MESSAGE'
      } catch (error) {
        console.error(`Message command at ${relpath} failed validation!`)
        console.error(error)
        return
      }

      const setup = mod.setup ?? (() => ({}))
      const execute: GenericHandler = async ctx => {
        const deps = await setup()
        await (<GenericHandler>mod.execute).call(deps, ctx)
      }

      stores.command.set(createKey('msg', mod.name), execute)
      stores.modules.set(mod.name, mod)
      return
    }

    if (file.type === 'event') {
      const mod = (await unrequire<Event<keyof ClientEvents>>(file.target)).default
      try {
        await validateEvent(mod)
      } catch (error) {
        console.error(`Event module at ${relpath} failed validation!`)
        console.error(error)
        return
      }

      const setup = mod.setup ?? (() => ({}))
      const execute = async (...args: ClientEvents[keyof ClientEvents]) => {
        const deps = await setup()
        // @ts-ignore: 'this' context blah blah complex type
        await mod.execute.call(deps, { client }, ...args)
      }

      const oldListener = stores.event.get(mod.name)
      if (oldListener) {
        client.off(mod.name, oldListener as never)
      }

      stores.event.set(mod.name, execute)
      client[mod.once ? 'once' : 'on'](mod.name, execute)
      return
    }

    if (file.type === 'script') {
      const oldCleanup = stores.cleanup.get(file.source)
      if (oldCleanup) {
        try {
          await oldCleanup()
        } catch (error) {
          console.error(`Cleanup function at ${relpath} threw an error!`)
          console.error(error)
        }
      }

      // @todo: recursively refresh children as well
      const mod = await unrequire(file.target) as Record<string, unknown>
      if (!hasOnLoad(mod)) return

      const newCleanup = await mod.chooksOnLoad({ client })
      if (newCleanup) {
        stores.cleanup.set(file.source, newCleanup)
      }
    }
  })

  client.on('interactionCreate', async interaction => {
    const handler = resolveInteraction(stores.command, interaction)
    if (!handler) return

    if (!handler.execute) {
      console.warn(`Handler for "${handler.key}" is missing.`)
      return
    }

    try {
      await handler.execute({ client, interaction })
    } catch (error) {
      console.error(`Handler "${handler.key}" threw an error!`)
      console.error(error)
    }
  })

  await login
  console.info('Logged in!')
}

export = createServer
