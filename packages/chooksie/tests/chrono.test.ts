import timer from '../src/internals/chrono'

describe('timer', () => {
  const _hrtime = process.hrtime
  const hrtime: jest.Mock = process.hrtime = <never>jest.fn()

  afterAll(() => {
    process.hrtime = _hrtime
  })

  beforeEach(() => {
    hrtime.mockReset().mockReturnValueOnce([0, 0])
  })

  test('small ms', () => {
    hrtime.mockReturnValueOnce([0, 12010000])
    expect(timer()()).toBe('12ms')
  })

  test('big ms', () => {
    hrtime.mockReturnValueOnce([0, 923450000])
    expect(timer()()).toBe('923ms')
  })

  test('s + small ms', () => {
    hrtime.mockReturnValueOnce([1, 12010000])
    expect(timer()()).toBe('1.012s')
  })

  test('s + big ms', () => {
    hrtime.mockReturnValueOnce([1, 923450000])
    expect(timer()()).toBe('1.923s')
  })

  test('s + big ms trailing', () => {
    hrtime.mockReturnValueOnce([1, 920450000])
    expect(timer()()).toBe('1.92s')
  })
})
