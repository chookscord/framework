import { validateConfig, validateDevConfig } from '../src/lib/config.js'

const token = 'ODUwMzgwOTg2NTY2ODM2MjM0.YLo5Ag.v5Mgj4RykD9Y7c4lONOo9Fl1Syg'

describe('config validation', () => {
  describe('valid config', () => {
    test('minimal config', async () => {
      expect(
        await validateConfig({
          token,
          intents: [],
        }),
      ).toBeNull()
    })

    test('minimal dev config', async () => {
      expect(
        await validateDevConfig({
          token,
          devServer: 'bar',
          intents: [],
        }),
      ).toBeNull()
    })

    test('full config', async () => {
      expect(
        await validateConfig({
          token,
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
