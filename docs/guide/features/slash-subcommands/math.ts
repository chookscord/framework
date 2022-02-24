import { defineOption, defineSlashSubcommand, defineSubcommand } from 'chooksie'
import type { CommandInteraction } from 'discord.js'

const numbers = [
  defineOption({
    name: 'x',
    description: 'The first number.',
    type: 'NUMBER',
    required: true,
  }),
  defineOption({
    name: 'y',
    description: 'The second number.',
    type: 'NUMBER',
    required: true,
  }),
]

function setup() {
  const getNumbers = (interaction: CommandInteraction) => {
    const x = interaction.options.getNumber('x', true)
    const y = interaction.options.getNumber('y', true)
    return [x, y] as const
  }

  return { getNumbers }
}

const addition = defineSubcommand({
  name: 'add',
  description: 'Add two numbers.',
  type: 'SUB_COMMAND',
  setup,
  async execute(ctx) {
    const [x, y] = this.getNumbers(ctx.interaction)
    await ctx.interaction.reply(`${x} + ${y} = ${x + y}`)
  },
  options: numbers,
})

const subtraction = defineSubcommand({
  name: 'subtract',
  description: 'Subtracts two numbers.',
  type: 'SUB_COMMAND',
  setup,
  async execute(ctx) {
    const [x, y] = this.getNumbers(ctx.interaction)
    await ctx.interaction.reply(`${x} - ${y} = ${x - y}`)
  },
  options: numbers,
})

export default defineSlashSubcommand({
  name: 'math',
  description: 'Do math stuff.',
  options: [
    addition,
    subtraction,
  ],
})
