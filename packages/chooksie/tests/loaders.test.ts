/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/unbound-method */
import type { Client } from 'discord.js'
import type { Logger } from 'pino'
import _pino from 'pino'
import { loadEvent, loadSlashCommand, loadSlashSubcommand } from '../src/internals/loaders.js'
import { createKey } from '../src/internals/resolve.js'

jest.mock('pino', () => {
  const pino = jest.fn() as unknown as Logger
  pino.child = jest.fn(val => val) as never
  return () => pino
})

const pino = _pino()

class FakeMap extends Map {
  public set = jest.fn()
}

const mockFnBind = (): jest.Mock & { bind: jest.Mock } => {
  const fn = jest.fn().mockImplementation((self: unknown) => self)
  const bind = jest.fn()
  fn.bind = bind
  return <never>fn
}

describe('loaders', () => {
  const execute = mockFnBind()
  const autocomplete = mockFnBind()
  const deps = { [Symbol('foo')]: 23 }
  const setup = jest.fn().mockReturnValue(Promise.resolve(deps))

  const store = new FakeMap()

  afterEach(() => {
    store.set.mockClear()
    execute.mockClear()
    autocomplete.mockClear()
    setup.mockClear()
  })

  test('slash commands', async () => {
    await loadSlashCommand(store, {
      name: 'foo',
      description: '',
      setup,
      execute,
      options: [
        {
          name: 'bar',
          description: '',
          type: 'STRING',
          setup,
          autocomplete,
        },
      ],
    })

    expect(setup).toHaveBeenCalledTimes(2)
    expect(execute.bind).toHaveBeenCalledWith(deps)
    expect(autocomplete.bind).toHaveBeenCalledWith(deps)

    const parentKey = 'foo'
    const key = createKey('cmd', parentKey)

    expect(store.set).toHaveBeenCalledWith(key, {
      execute: execute.bind(),
      logger: pino.child({ type: 'command', name: key }),
    })

    const autocompleteKey = createKey('auto', parentKey, 'bar')
    expect(store.set).toHaveBeenCalledWith(autocompleteKey, {
      execute: autocomplete.bind(),
      logger: pino.child({ type: 'autocomplete', name: autocompleteKey }),
    })
  })

  test('slash subcommands', async () => {
    await loadSlashSubcommand(store, {
      name: 'foo',
      description: '',
      options: [
        {
          name: 'bar',
          description: '',
          type: 'SUB_COMMAND',
          setup,
          execute,
          options: [
            {
              name: 'baz',
              description: '',
              type: 'STRING',
              setup,
              autocomplete,
            },
          ],
        },
      ],
    })

    expect(setup).toHaveBeenCalledTimes(2)
    expect(execute.bind).toHaveBeenCalledWith(deps)
    expect(autocomplete.bind).toHaveBeenCalledWith(deps)

    const parentKey = createKey('foo', 'bar')
    const key = createKey('cmd', parentKey)

    expect(store.set).toHaveBeenCalledWith(key, {
      execute: execute.bind(),
      logger: pino.child({ type: 'subcommand', name: key }),
    })

    const autocompleteKey = createKey('auto', parentKey, 'baz')
    expect(store.set).toHaveBeenCalledWith(autocompleteKey, {
      execute: autocomplete.bind(),
      logger: pino.child({ type: 'autocomplete', name: autocompleteKey }),
    })
  })

  test('slash subcommand groups', async () => {
    await loadSlashSubcommand(store, {
      name: 'foo',
      description: '',
      options: [
        {
          name: 'bar',
          description: '',
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'baz',
              description: '',
              type: 'SUB_COMMAND',
              setup,
              execute,
              options: [
                {
                  name: 'qux',
                  description: '',
                  type: 'STRING',
                  setup,
                  autocomplete,
                },
              ],
            },
          ],
        },
      ],
    })

    expect(setup).toHaveBeenCalledTimes(2)
    expect(execute.bind).toHaveBeenCalledWith(deps)
    expect(autocomplete.bind).toHaveBeenCalledWith(deps)

    const parentKey = createKey('foo', 'bar', 'baz')
    const key = createKey('cmd', parentKey)

    expect(store.set).toHaveBeenCalledWith(key, {
      execute: execute.bind(),
      logger: pino.child({ type: 'subcommand', name: key }),
    })

    const autocompleteKey = createKey('auto', parentKey, 'qux')
    expect(store.set).toHaveBeenCalledWith(autocompleteKey, {
      execute: autocomplete.bind(),
      logger: pino.child({ type: 'autocomplete', name: autocompleteKey }),
    })
  })

  test('events', async () => {
    const client = <unknown>{
      on: jest.fn(),
      once: jest.fn(),
    } as Client

    await loadEvent(client, {
      name: 'ready',
      setup,
      execute,
    })

    expect(client.on).toHaveBeenCalled()
    expect(client.once).not.toHaveBeenCalled()

    expect(execute.bind).toHaveBeenCalledWith(deps)
  })

  test('once events', async () => {
    const client = <unknown>{
      on: jest.fn(),
      once: jest.fn(),
    } as Client

    await loadEvent(client, {
      name: 'ready',
      once: true,
      setup,
      execute,
    })

    expect(client.on).not.toHaveBeenCalled()
    expect(client.once).toHaveBeenCalled()

    expect(execute.bind).toHaveBeenCalledWith(deps)
  })
})
