/* eslint-disable @typescript-eslint/unbound-method */
import type { Client } from 'discord.js'
import { loadCommand, loadEvent, loadSubCommand } from '../src/internals/loaders'
import { createKey } from '../src/internals/resolve'

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

  test('commands', async () => {
    await loadCommand(store, {
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

    const key = createKey('foo')
    expect(store.set).toHaveBeenCalledWith(key, execute.bind())
    expect(store.set).toHaveBeenCalledWith(createKey(key, 'bar'), autocomplete.bind())
  })

  test('slash subcommands', async () => {
    await loadSubCommand(store, {
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

    const key = createKey('foo', 'bar')
    expect(store.set).toHaveBeenCalledWith(key, execute.bind())
    expect(store.set).toHaveBeenCalledWith(createKey(key, 'baz'), autocomplete.bind())
  })

  test('slash subcommand groups', async () => {
    await loadSubCommand(store, {
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

    const key = createKey('foo', 'bar', 'baz')
    expect(store.set).toHaveBeenCalledWith(key, execute.bind())
    expect(store.set).toHaveBeenCalledWith(createKey(key, 'qux'), autocomplete.bind())
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
    expect(execute.bind).toHaveBeenCalledWith(deps, { client })
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
    expect(execute.bind).toHaveBeenCalledWith(deps, { client })
  })
})
