import { randomUUID } from 'crypto'
import type { CommandInteraction, ContextMenuInteraction, Interaction } from 'discord.js'
import { Client, MessageEmbed } from 'discord.js'
import type { ChooksConfig, CommandStore } from '../types'
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

function onInteractionCreate(store: CommandStore, createLogger = pino): (interaction: Interaction) => Awaited<void> {
  const logger = createLogger()('app', 'interactions')
  return async interaction => {
    const handler = resolveInteraction(store, interaction)
    if (!handler) return

    if (!handler.command) {
      logger.warn(`Handler for "${handler.key}" is missing.`)
      return
    }

    const reqId = randomUUID()

    try {
      const client = interaction.client
      const _logger = handler.command.logger.child({ requestId: reqId })
      await handler.command.execute({ client, interaction, logger: _logger })
    } catch (error) {
      logger.error(`Handler for "${handler.key}" threw an error!`)
      logger.error(error)

      // If interaction hasn't been handled, reply with a generic error message.
      if (interaction.isCommand() || interaction.isContextMenu()) {
        if (interaction.replied) return

        try {
          await sendGenericError(interaction, reqId)
        } catch {
          logger.error('Failed to notify user of unhandled error!')
        }
      }
    }
  }
}

export default createClient
export { onInteractionCreate }
