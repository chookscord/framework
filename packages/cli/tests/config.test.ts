import { validateConfig } from '../src/lib/config'

describe('config validation', () => {
  describe('valid config', () => {
    test('minimal config', async () => {
      expect(
        await validateConfig({
          credentials: {
            token: 'bar',
          },
          intents: [],
        }),
      ).toBeNull()
    })

    test('full config', async () => {
      expect(
        await validateConfig({
          credentials: {
            token: 'bar',
            appId: 'foo',
          },
          intents: [],
          client: {
            options: {},
          },
        }),
      ).toBeNull()
    })
  })

  describe('invalid configs', () => {
    test('wrong credentials', async () => {
      expect(
        await validateConfig({
          intents: [],
        }),
      ).toBeInstanceOf(Error)

      expect(
        await validateConfig({
          credentials: {
            appId: 'bar',
          },
          intents: [],
        }),
      ).toBeInstanceOf(Error)
    })
  })
})
