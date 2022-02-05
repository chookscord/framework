import { validateConfig, validateDevConfig } from '../src/lib/config'

describe('config validation', () => {
  describe('valid config', () => {
    test('minimal config', async () => {
      expect(
        await validateConfig({
          token: 'foo',
          intents: [],
        }),
      ).toBeNull()
    })

    test('minimal dev config', async () => {
      expect(
        await validateDevConfig({
          token: 'foo',
          devServer: 'bar',
          intents: [],
        }),
      ).toBeNull()
    })

    test('full config', async () => {
      expect(
        await validateConfig({
          token: 'foo',
          intents: [],
          devServer: 'bar',
          client: {
            options: {},
          },
        }),
      ).toBeNull()
    })
  })

  describe('invalid configs', () => {
    test('missing credentials', async () => {
      expect(
        await validateConfig({
          intents: [],
        }),
      ).toBeInstanceOf(Error)
    })

    test('missing dev guild id', async () => {
      expect(
        await validateDevConfig({
          token: 'foo',
          intents: [],
        }),
      ).toBeInstanceOf(Error)
    })
  })
})
