import Store from '../src/lib/store.js'

describe('store', () => {
  const store = new Store<number>()

  afterEach(() => {
    store.clear()
  })

  describe('store events', () => {
    test('on add event', () => {
      const cb = jest.fn()
      store.events.on('add', cb)

      store.set('foo', 0)
      store.set('foo', 1)

      expect(cb).toHaveBeenCalledTimes(2)
      expect(cb).toHaveBeenCalledWith(0, null)
      expect(cb).toHaveBeenCalledWith(1, 0)
    })

    test('on delete event', () => {
      const cb = jest.fn()
      store.events.on('delete', cb)

      store.set('foo', 0).delete('foo')

      expect(cb).toHaveBeenCalledWith(0)
      expect(cb).toHaveBeenCalledTimes(1)
    })
  })
})
