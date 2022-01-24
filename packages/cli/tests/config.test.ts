import { validateConfig } from '../src/lib/config'

describe('config validation', () => {
  describe('valid config', () => {
    test('minimal config', () => {
      expect(
        validateConfig({
          credentials: {
            token: 'bar',
          },
        }),
      ).toBeNull()
    })

    test('full config', () => {
      expect(
        validateConfig({
          credentials: {
            token: 'bar',
            appId: 'foo',
          },
        }),
      ).toBeNull()
    })
  })

  describe('invalid configs', () => {
    test('wrong credentials', () => {
      expect(
        validateConfig({
        }),
      ).toBeInstanceOf(Error)

      expect(
        validateConfig({
          credentials: {
            appId: 'bar',
          },
        }),
      ).toBeInstanceOf(Error)
    })
  })
})
