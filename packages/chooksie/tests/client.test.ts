import { Client } from 'discord.js'
import createClient from '../src/internals/client.js'

describe('create client', () => {
  it('throws on missing intents', () => {
    const create = () => {
      createClient({})
    }

    expect(create).toThrow()
  })

  test('create client', () => {
    const client = createClient({ intents: [] })
    expect(client).toBeInstanceOf(Client)
  })
})
