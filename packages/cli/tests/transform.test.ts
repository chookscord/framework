import type { AppCommand, AppCommandOption } from 'chooksie/dist/internals/discord'
import { AppChannelType, AppCommandOptionType, AppCommandType } from 'chooksie/dist/internals/discord'
import { transformCommand, transformOption } from '../src/lib/index.js'

jest.mock('@swc/core', () => 1)

const noop = () => { /*  */ }

describe('transform options', () => {
  test('minimal', () => {
    const opt = transformOption({
      name: 'foo',
      description: 'bar',
      type: 'BOOLEAN',
    })

    expect(opt).toEqual(<AppCommandOption>{
      name: 'foo',
      description: 'bar',
      type: AppCommandOptionType.BOOLEAN,
    })
  })

  test('subcommand group', () => {
    const opt = transformOption({
      name: 'foo',
      description: 'bar',
      type: 'SUB_COMMAND_GROUP',
      options: [
        {
          name: 'foo',
          description: 'bar',
          type: 'SUB_COMMAND',
          setup: noop,
          execute: noop,
          options: [
            {
              name: 'foo',
              description: 'bar',
              type: 'BOOLEAN',
              required: true,
            },
          ],
        },
      ],
    })

    expect(opt).toStrictEqual(<AppCommandOption>{
      name: 'foo',
      description: 'bar',
      type: AppCommandOptionType.SUB_COMMAND_GROUP,
      options: [
        {
          name: 'foo',
          description: 'bar',
          type: AppCommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'foo',
              description: 'bar',
              type: AppCommandOptionType.BOOLEAN,
              required: true,
            },
          ],
        },
      ],
    })
  })

  test('channel option', () => {
    const opt = transformOption({
      name: 'foo',
      description: 'bar',
      type: 'CHANNEL',
      channelTypes: ['DM', 'GROUP_DM'],
    })

    expect(opt).toStrictEqual(<AppCommandOption>{
      name: 'foo',
      description: 'bar',
      type: AppCommandOptionType.CHANNEL,
      channel_types: [
        AppChannelType.DM,
        AppChannelType.GROUP_DM,
      ],
    })
  })

  test('number option', () => {
    const opt = transformOption({
      name: 'foo',
      description: 'bar',
      type: 'NUMBER',
      minValue: -2,
      maxValue: 22,
    })

    expect(opt).toStrictEqual(<AppCommandOption>{
      name: 'foo',
      description: 'bar',
      type: AppCommandOptionType.NUMBER,
      min_value: -2,
      max_value: 22,
    })
  })

  test('choices', () => {
    const opt = transformOption({
      name: 'foo',
      description: 'bar',
      type: 'INTEGER',
      choices: [
        {
          name: 'foo',
          value: 23,
        },
      ],
    })

    expect(opt).toStrictEqual(<AppCommandOption>{
      name: 'foo',
      description: 'bar',
      type: AppCommandOptionType.INTEGER,
      choices: [
        {
          name: 'foo',
          value: 23,
        },
      ],
    })
  })

  test('autocompletes', () => {
    const opt = transformOption({
      name: 'foo',
      description: 'bar',
      type: 'STRING',
      // @ts-ignore testing
      setup: noop,
      autocomplete: noop,
    })

    expect(opt).toStrictEqual(<AppCommandOption>{
      name: 'foo',
      description: 'bar',
      type: AppCommandOptionType.STRING,
      autocomplete: true,
    })
  })
})

describe('transform commands', () => {
  test('minimal slash', () => {
    const cmd = transformCommand({
      name: 'foo',
      description: 'bar',
      execute: noop,
    })

    expect(cmd).toStrictEqual(<AppCommand>{
      name: 'foo',
      description: 'bar',
    })
  })

  test('subcommand', () => {
    const cmd = transformCommand({
      name: 'foo',
      description: 'bar',
      type: 'CHAT_INPUT',
      setup: noop,
      execute: noop,
      defaultPermission: true,
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
            },
          ],
        },
      ],
    })

    expect(cmd).toStrictEqual(<AppCommand>{
      name: 'foo',
      description: 'bar',
      type: AppCommandType.CHAT_INPUT,
      default_permission: true,
      options: [
        {
          name: 'foo',
          description: 'bar',
          type: AppCommandOptionType.SUB_COMMAND,
          options: [
            {
              name: 'foo',
              description: 'bar',
              type: AppCommandOptionType.STRING,
            },
          ],
        },
      ],
    })
  })

  test('message command', () => {
    const cmd = transformCommand({
      name: 'foo',
      type: 'MESSAGE',
      execute: noop,
    })

    expect(cmd).toStrictEqual(<AppCommand>{
      name: 'foo',
      type: AppCommandType.MESSAGE,
    })
  })

  test('user command', () => {
    const cmd = transformCommand({
      name: 'foo',
      type: 'USER',
      execute: noop,
    })

    expect(cmd).toStrictEqual(<AppCommand>{
      name: 'foo',
      type: AppCommandType.USER,
    })
  })
})
