import type { InferSetupType, SlashCommand } from 'chooksie'

function setup() {
  const getMessage = () => 'Pong!'
  return { message: getMessage }
}

const pingCommand: SlashCommand<InferSetupType<typeof setup>> = {
  name: 'ping',
  description: 'Pong!',
  setup,
  async execute(ctx) {
    await ctx.interaction.reply(this.message())
  },
}

export default pingCommand
