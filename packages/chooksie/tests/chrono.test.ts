import timer from '../src/internals/chrono.js'

describe('timer', () => {
  const _hrtime = process.hrtime
  const hrtime: jest.Mock = process.hrtime = <never>jest.fn()

  afterAll(() => {
    process.hrtime = _hrtime
  })

  beforeEach(() => {
    hrtime.mockReset().mockReturnValueOnce([0, 0])
  })

  test('ms', () => {
    hrtime.mockReturnValueOnce([0, 923450000])
    expect(timer()()).toBe(923.45)
  })

  test('s', () => {
    hrtime.mockReturnValueOnce([1, 12010000])
    expect(timer()()).toBe(1012.01)
  })
})
