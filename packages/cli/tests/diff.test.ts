import type { ChannelOption, Choice, MessageCommand, NumberOption, Option, SlashCommand, SlashSubcommand, StringOption, Subcommand, UserCommand } from 'chooksie'
import { diffCommand, diffOption } from '../src/lib/diff'

const noop = () => { /*  */ }

describe('module diff', () => {
  describe('diffing options', () => {
    test('same options', () => {
      const diff = diffOption(
        {
          name: 'foo',
          description: 'bar',
          type: 'SUB_COMMAND_GROUP',
          required: true,
          options: [
            {
              name: 'foo',
              description: 'bar',
              type: 'SUB_COMMAND',
              execute: noop,
              options: [
                {
                  name: 'foo',
                  description: 'bar',
                  type: 'STRING',
                  // @ts-ignore testing
                  setup: noop,
                  autocomplete: noop,
                  choices: [
                    {
                      name: 'foo',
                      value: 'bar',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'foo',
          description: 'bar',
          type: 'SUB_COMMAND_GROUP',
          required: true,
          options: [
            {
              name: 'foo',
              description: 'bar',
              type: 'SUB_COMMAND',
              execute: noop,
              options: [
                {
                  name: 'foo',
                  description: 'bar',
                  type: 'STRING',
                  autocomplete: noop,
                  required: false,
                  choices: [
                    {
                      name: 'foo',
                      value: 'bar',
                    },
                  ],
                },
              ],
            },
          ],
        },
      )

      expect(diff).toBe(false)
    })

    test('diff subcommand', () => {
      const diff = diffOption(
        {
          name: 'foo',
          description: 'bar',
          type: 'SUB_COMMAND',
          execute() {
            console.log('foo')
          },
        },
        {
          name: 'foo',
          description: 'bar',
          type: 'SUB_COMMAND',
          setup: noop,
          execute() {
            console.log('bar')
          },
        },
      )

      expect(diff).toBe(false)
    })

    test('diff name', () => {
      const diff = diffOption(
        {
          name: 'foo',
          description: 'bar',
          type: 'STRING',
        },
        {
          name: 'bar',
          description: 'bar',
          type: 'STRING',
        },
      )

      expect(diff).toBe(true)
    })

    test('diff desc', () => {
      const diff = diffOption(
        {
          name: 'foo',
          description: 'bar',
          type: 'STRING',
        },
        {
          name: 'foo',
          description: 'foo bar',
          type: 'STRING',
        },
      )

      expect(diff).toBe(true)
    })

    test('diff type', () => {
      const diff = diffOption(
        {
          name: 'foo',
          description: 'bar',
          type: 'STRING',
        },
        {
          name: 'foo',
          description: 'bar',
          type: 'NUMBER',
        },
      )

      expect(diff).toBe(true)
    })

    test('diff suboption', () => {
      const subcommand: Subcommand = {
        name: 'foo',
        description: 'bar',
        type: 'SUB_COMMAND',
        execute: noop,
      }

      const diffValue = diffOption(
        {
          ...subcommand,
          options: [
            {
              name: 'foo',
              description: 'bar',
              type: 'STRING',
            },
          ],
        },
        {
          ...subcommand,
          options: [
            {
              name: 'foo',
              description: 'bar',
              type: 'NUMBER',
            },
          ],
        },
      )

      const diffCount = diffOption(
        {
          ...subcommand,
          options: [
            {
              name: 'foo',
              description: 'bar',
              type: 'STRING',
            },
            {
              name: 'bar',
              description: 'qux',
              type: 'NUMBER',
            },
          ],
        },
        {
          ...subcommand,
          options: [
            {
              name: 'foo',
              description: 'bar',
              type: 'STRING',
            },
          ],
        },
      )

      expect(diffValue).toBe(true)
      expect(diffCount).toBe(true)
    })

    test('diff string', () => {
      const base: StringOption = {
        name: 'foo',
        description: 'bar',
        type: 'STRING',
      }

      const diffAutocomplete = diffOption(
        { ...base, autocomplete: noop },
        { ...base },
      )

      const choice1A: Choice<string> = { name: 'foo', value: 'foo' }
      const choice1B: Choice<string> = { name: 'foo', value: 'bar' }
      const choice2: Choice<string> = { name: 'bar', value: 'foo' }

      const diffChoice1 = diffOption(
        { ...base, choices: [choice1A] },
        { ...base, choices: [choice1B] },
      )

      const diffChoice2 = diffOption(
        { ...base, choices: [choice1A, choice2] },
        { ...base, choices: [choice1A] },
      )

      expect(diffAutocomplete).toBe(true)

      expect(diffChoice1).toBe(true)
      expect(diffChoice2).toBe(true)
    })

    test('diff number', () => {
      const base: NumberOption = {
        name: 'foo',
        description: 'bar',
        type: 'NUMBER',
      }

      const diffMin = diffOption(
        {
          ...base,
          minValue: 0,
          maxValue: 2,
        },
        {
          ...base,
          minValue: 1,
          maxValue: 2,
        },
      )

      const diffMax = diffOption(
        {
          ...base,
          minValue: 0,
          maxValue: 2,
        },
        {
          ...base,
          minValue: 0,
          maxValue: 1,
        },
      )

      const diffAutocomplete = diffOption(
        { ...base },
        { ...base, autocomplete: noop },
      )

      const choice1A: Choice<number> = { name: 'foo', value: 1 }
      const choice1B: Choice<number> = { name: 'foo', value: 2 }
      const choice2: Choice<number> = { name: 'bar', value: 3 }

      const diffChoice1 = diffOption(
        { ...base, choices: [choice1A] },
        { ...base, choices: [choice1B] },
      )

      const diffChoice2 = diffOption(
        { ...base, choices: [choice1A, choice2] },
        { ...base, choices: [choice1A] },
      )

      expect(diffMin).toBe(true)
      expect(diffMax).toBe(true)

      expect(diffAutocomplete).toBe(true)

      expect(diffChoice1).toBe(true)
      expect(diffChoice2).toBe(true)
    })

    test('diff channel', () => {
      const base: ChannelOption = {
        name: 'foo',
        description: 'bar',
        type: 'CHANNEL',
      }

      const diffValue = diffOption(
        { ...base, channelTypes: ['DM'] },
        { ...base, channelTypes: ['GROUP_DM'] },
      )

      const diffCount = diffOption(
        { ...base, channelTypes: ['DM'] },
        { ...base, channelTypes: ['DM', 'GUILD_PRIVATE_THREAD'] },
      )

      expect(diffValue).toBe(true)
      expect(diffCount).toBe(true)
    })
  })

  describe('diffing commands', () => {
    test('same slash command', () => {
      const option: Option = { name: 'foo', description: 'bar', type: 'STRING' }

      const diff = diffCommand(
        {
          name: 'foo',
          description: 'bar',
          type: 'CHAT_INPUT',
          setup: noop,
          execute: noop,
          options: [option],
        } as SlashCommand<void>,
        {
          name: 'foo',
          description: 'bar',
          execute: noop,
          options: [option],
        } as SlashCommand<void>,
      )

      expect(diff).toBe(false)
    })

    test('diff slash command', () => {
      const diffName = diffCommand(
        { name: 'foo', description: 'bar', execute: noop },
        { name: 'qux', description: 'bar', execute: noop },
      )

      const diffDesc = diffCommand(
        { name: 'foo', description: 'bar', execute: noop },
        { name: 'foo', description: 'qux', execute: noop },
      )

      const diffOpts = diffCommand(
        {
          name: 'foo',
          description: 'bar',
          options: [
            {
              name: 'foo',
              description: 'bar',
              type: 'SUB_COMMAND',
              execute: noop,
            },
          ],
        } as SlashSubcommand,
        {
          name: 'foo',
          description: 'bar',
          options: [
            {
              name: 'foo',
              description: 'qux',
              type: 'SUB_COMMAND',
              execute: noop,
            },
          ],
        },
      )

      expect(diffName).toBe(true)
      expect(diffDesc).toBe(true)
      expect(diffOpts).toBe(true)
    })

    test('same user command', () => {
      const diff = diffCommand(
        { name: 'foo', type: 'USER', execute: noop, defaultPermission: false } as UserCommand,
        { name: 'foo', execute: noop } as UserCommand,
      )

      expect(diff).toBe(true)
    })

    test('diff user command', () => {
      const diff = diffCommand(
        { name: 'foo', execute: noop } as UserCommand,
        { name: 'bar', execute: noop } as UserCommand,
      )

      expect(diff).toBe(true)
    })

    test('same message command', () => {
      const diff = diffCommand(
        { name: 'foo', type: 'MESSAGE', execute: noop, defaultPermission: false } as MessageCommand,
        { name: 'foo', execute: noop } as MessageCommand,
      )

      expect(diff).toBe(true)
    })

    test('diff message command', () => {
      const diff = diffCommand(
        { name: 'foo', execute: noop } as MessageCommand,
        { name: 'bar', execute: noop } as MessageCommand,
      )

      expect(diff).toBe(true)
    })
  })
})
