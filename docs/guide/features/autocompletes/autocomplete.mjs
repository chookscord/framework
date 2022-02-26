import { defineOption, defineSubcommand } from 'chooksie'

async function db() {
  const fakeDb = await import('../some-fake-db')
  return { fakeDb }
}

const getUser = defineSubcommand({
  name: 'get',
  description: 'Get an account\'s details.',
  type: 'SUB_COMMAND',
  setup: db,
  async execute(ctx) {
    const username = ctx.interaction.options.getString('username', true)
    const userDetails = await this.fakeDb.get(username)
    await ctx.interaction.reply(userDetails)
  },
  options: [
    defineOption({
      name: 'username',
      description: 'The account\'s username.',
      type: 'STRING',
      required: true,
      setup: db,
      async autocomplete(ctx) {
        const input = ctx.interaction.options.getFocused()
        const users = await this.fakeDb.getAll({ username: input })

        await ctx.interaction.respond(users.map(user => ({
          name: user.username,
          value: users.username,
        })))
      },
    }),
  ],
})
