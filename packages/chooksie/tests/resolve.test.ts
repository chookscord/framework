import type { AutocompleteInteraction, CommandInteraction } from 'discord.js'
import { createKey, resolveInteraction } from '../src/internals/resolve'

const execute = { [Symbol('foo')]: 0 }
class FakeMap extends Map {
  public get = jest.fn().mockReturnValue(execute)
}

function fakeInteraction(type: 'command' | 'context' | 'autocomplete', opts: {
  name: string
  group?: string
  subcommand?: string
  option?: string
}) {
  return {
    isCommand: () => type === 'command',
    isContextMenu: () => type === 'context',
    isAutocomplete: () => type === 'autocomplete',
    commandName: opts.name,
    options: {
      getSubcommand: () => opts.subcommand ?? null,
      getSubcommandGroup: () => opts.group ?? null,
      getFocused: (): unknown => ({ name: opts.option ?? null }),
    },
  } as CommandInteraction | AutocompleteInteraction
}

describe('resolving interactions', () => {
  test('interaction keys', () => {
    const minimal = createKey('command')
    expect(minimal).toBe('command')

    const full = createKey('command', 'group', 'subcommand', 'option')
    expect(full).toBe('command:group:subcommand:option')

    const partial = createKey('command', null, 'subcommand', null)
    expect(partial).toBe('command:subcommand')
  })

  test('slash command', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('command', { name: 'foo' })

    const key = createKey('foo')
    const res = resolveInteraction(<never>{ command: map }, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, execute })
  })

  test('slash subcommand', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('command', {
      name: 'foo',
      subcommand: 'bar',
    })

    const key = createKey('foo', 'bar')
    const res = resolveInteraction(<never>{ command: map }, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, execute })
  })

  test('slash subcommand group', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('command', {
      name: 'foo',
      group: 'baz',
      subcommand: 'bar',
    })

    const key = createKey('foo', 'baz', 'bar')
    const res = resolveInteraction(<never>{ command: map }, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, execute })
  })

  test('context menu command', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('context', { name: 'foo' })

    const key = createKey('foo')
    const res = resolveInteraction(<never>{ command: map }, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, execute })
  })

  test('autocomplete', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('autocomplete', {
      name: 'foo',
      option: 'baz',
    })

    const key = createKey('foo', 'baz')
    const res = resolveInteraction(<never>{ autocomplete: map }, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, execute })
  })

  test('nested autocomplete', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('autocomplete', {
      name: 'foo',
      group: 'bar',
      subcommand: 'baz',
      option: 'qux',
    })

    const key = createKey('foo', 'bar', 'baz', 'qux')
    const res = resolveInteraction(<never>{ autocomplete: map }, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, execute })
  })
})
