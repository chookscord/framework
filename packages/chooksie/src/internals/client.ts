import { randomUUID } from 'crypto'
import type { CommandInteraction, ContextMenuInteraction, Interaction } from 'discord.js'
import { Client, MessageEmbed } from 'discord.js'
import type { ChooksConfig, CommandStore } from '../types'
import timer from './chrono'
import pino from './logger'
import { resolveInteraction } from './resolve'

function createClient(config: Partial<ChooksConfig>): Client {
  const client = new Client({
    ...config.client?.options,
    intents: config.intents!,
  })

  return client
}

async function sendGenericError(interaction: CommandInteraction | ContextMenuInteraction, id: string) {
  const iconURL = interaction.client.user!.avatarURL({ size: 64 }) ?? undefined
  const errorEmbed = new MessageEmbed()
    .setColor('RED')
    .setAuthor({ name: 'An unexpected error has occured!', iconURL })
    .setDescription('Please contact the developers with the Request ID about this issue.')
    .addField('Request ID', id)
    .setTimestamp(interaction.createdTimestamp)

  if (interaction.deferred) {
    await interaction.editReply({ embeds: [errorEmbed] })
  } else {
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
  }
}

function onInteractionCreate(store: CommandStore, createLogger = pino()): (interaction: Interaction) => Awaited<void> {
  const _logger = createLogger('app', 'interactions')
  return async interaction => {
    const handler = resolveInteraction(store, interaction)
    if (!handler) return

    const reqId = randomUUID()
    const appLogger = _logger.child({ reqId })

    if (!handler.command) {
      appLogger.warn(`Handler for "${handler.key}" is missing.`)
      return
    }

    const client = interaction.client
    const logger = handler.command.logger.child({ reqId })

    try {
      appLogger.info(`Running handler for "${handler.key}"...`)

      const endTimer = timer()
      await handler.command.execute({ client, interaction, logger })

      appLogger.info({
        responseTime: endTimer(),
        msg: `Successfully ran handler for "${handler.key}".`,
      })
    } catch (error) {
      appLogger.error(`Handler for "${handler.key}" did not run successfully.`)

      logger.error('An unexpected error has occured!')
      logger.error(error)

      // If interaction hasn't been handled, reply with a generic error message.
      if (interaction.isCommand() || interaction.isContextMenu()) {
        if (interaction.replied) return

        try {
          await sendGenericError(interaction, reqId)
        } catch {
          appLogger.error('Failed to notify user of unhandled error!')
        }
      }
    }
  }
}

export default createClient
export { onInteractionCreate }
