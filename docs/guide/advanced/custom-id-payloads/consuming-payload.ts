import { defineButtonHandler } from 'chooksie'

export default defineButtonHandler({
  customId: 'timer-end',
  async execute(ctx) {
    const now = Date.now()
    const startTime = Number(ctx.payload)

    const elapsed = now - startTime

    await ctx.interaction.reply({
      content: `Timer ended! Time elapsed: ${elapsed.toLocaleString()}ms`,
      ephemeral: true,
    })
  },
})
