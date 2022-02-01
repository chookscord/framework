import type { AutocompleteInteraction, CommandInteraction } from 'discord.js'
import { createKey, resolveInteraction } from '../src/internals/resolve'

class FakeMap extends Map {
  public get = jest.fn()
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

    resolveInteraction({ command: map } as never, interaction)
    expect(map.get).toHaveBeenCalledWith('foo')
  })

  test('slash subcommand', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('command', {
      name: 'foo',
      subcommand: 'bar',
    })

    resolveInteraction({ command: map } as never, interaction)
    expect(map.get).toHaveBeenCalledWith('foo:bar')
  })

  test('slash subcommand group', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('command', {
      name: 'foo',
      group: 'baz',
      subcommand: 'bar',
    })

    resolveInteraction({ command: map } as never, interaction)
    expect(map.get).toHaveBeenCalledWith('foo:baz:bar')
  })

  test('context menu command', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('context', { name: 'foo' })

    resolveInteraction({ command: map } as never, interaction)
    expect(map.get).toHaveBeenCalledWith('foo')
  })

  test('autocomplete', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('autocomplete', {
      name: 'foo',
      option: 'baz',
    })

    resolveInteraction({ autocomplete: map } as never, interaction)
    expect(map.get).toHaveBeenCalledWith('foo:baz')
  })

  test('nested autocomplete', () => {
    const map = new FakeMap()
    const interaction = fakeInteraction('autocomplete', {
      name: 'foo',
      group: 'bar',
      subcommand: 'baz',
      option: 'qux',
    })

    resolveInteraction({ autocomplete: map } as never, interaction)
    expect(map.get).toHaveBeenCalledWith('foo:bar:baz:qux')
  })
})
