import type { AutocompleteInteraction, CommandInteraction } from 'discord.js'
import { createKey, resolveInteraction } from '../src/internals/resolve'

const command = { [Symbol('foo')]: 0 }
class FakeMap extends Map {
  public get = jest.fn().mockReturnValue(command)
}

function fakeInteraction(type: 'command' | 'user' | 'message' | 'autocomplete', opts: {
  name: string
  group?: string
  subcommand?: string
  option?: string
}) {
  return {
    isCommand: () => type === 'command',
    isUserContextMenu: () => type === 'user',
    isMessageContextMenu: () => type === 'message',
    isContextMenu: () => type === 'user' || type === 'message',
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

    const key = createKey('cmd', 'foo')
    const res = resolveInteraction(map, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, command })
  })

  test('slash subcommand', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('command', {
      name: 'foo',
      subcommand: 'bar',
    })

    const key = createKey('cmd', 'foo', 'bar')
    const res = resolveInteraction(map, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, command })
  })

  test('slash subcommand group', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('command', {
      name: 'foo',
      group: 'baz',
      subcommand: 'bar',
    })

    const key = createKey('cmd', 'foo', 'baz', 'bar')
    const res = resolveInteraction(map, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, command })
  })

  test('user command', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('user', { name: 'foo' })

    const key = createKey('usr', 'foo')
    const res = resolveInteraction(map, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, command })
  })

  test('message command', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('message', { name: 'foo' })

    const key = createKey('msg', 'foo')
    const res = resolveInteraction(map, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, command })
  })

  test('autocomplete', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('autocomplete', {
      name: 'foo',
      option: 'baz',
    })

    const key = createKey('auto', 'foo', 'baz')
    const res = resolveInteraction(map, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, command })
  })

  test('nested autocomplete', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('autocomplete', {
      name: 'foo',
      group: 'bar',
      subcommand: 'baz',
      option: 'qux',
    })

    const key = createKey('auto', 'foo', 'bar', 'baz', 'qux')
    const res = resolveInteraction(map, interaction)

    expect(map.get).toHaveBeenCalledWith(key)
    expect(res).toStrictEqual({ key, command })
  })
})
