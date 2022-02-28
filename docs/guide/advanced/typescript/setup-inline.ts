import type { SlashCommand } from 'chooksie'

const pingCommand: SlashCommand<{ message: () => string }> = {
  name: 'ping',
  description: 'Pong!',
  setup() {
    const getMessage = () => 'Pong!'
    return { message: getMessage }
  },
  async execute(ctx) {
    await ctx.interaction.reply(this.message())
  },
}

export default pingCommand
