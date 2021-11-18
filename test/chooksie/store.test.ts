import { Store } from '../../packages/chooksie/src/lib/store';

describe('store', () => {
  const store = new Store<number>();

  afterEach(() => {
    store.clear();
  });

  describe('basic operations', () => {
    test('setters and getters', () => {
      store.set('foo', 0);
      expect(store.get('foo')).toBe(0);
      expect(store.get('bar')).toBe(null);
    });

    test('removing values', () => {
      store.set('foo', 0);
      expect(store.delete('foo')).toBe(true);
      expect(store.delete('bar')).toBe(false);
    });

    test('size', () => {
      expect(store.size).toBe(0);
      store.set('foo', 0);
      store.set('bar', 0);
      expect(store.size).toBe(2);
      expect(store.sizeUnique).toBe(1);
    });

    test('clear', () => {
      store.set('foo', 0);
      store.clear();
      expect(store.size).toBe(0);
    });
  });

  describe('complex methods', () => {
    test('get all', () => {
      store.set('foo', 0);
      store.set('bar', 0);

      for (const value of store.getAll()) {
        expect(value).toBe(0);
      }

      const cb = jest.fn();
      for (const value of store.getAll(true)) {
        cb(value);
      }

      expect(cb).toHaveBeenCalledWith(0);
      expect(cb).toHaveBeenCalledTimes(1);
    });

    test('get all (array)', () => {
      store.set('foo', 0);
      store.set('bar', 0);

      expect(store.toArray()).toStrictEqual([0, 0]);
      expect(store.toArray(true)).toStrictEqual([0]);
    });

    test('get entries', () => {
      store.set('foo', 0);
      store.set('bar', 0);
      expect([...store.entries()]).toStrictEqual([['foo', 0], ['bar', 0]]);
    });
  });

  describe('store events', () => {
    test('set event', () => {
      const cb = jest.fn();
      store.on('set', cb);

      store.set('foo', 0);
      store.set('foo', 1);

      expect(cb).toHaveBeenCalledTimes(2);
      expect(cb).toHaveBeenCalledWith(0, null);
      expect(cb).toHaveBeenCalledWith(1, 0);
    });

    test('remove event', () => {
      const cb = jest.fn();
      store.on('remove', cb);

      store.set('foo', 0).delete('foo');

      expect(cb).toHaveBeenCalledWith(0);
      expect(cb).toHaveBeenCalledTimes(1);
    });

    test('clearing events', () => {
      const fn = jest.fn();

      store.on('set', fn).off('set', fn);
      store.set('foo', 0);

      expect(fn).not.toHaveBeenCalled();
    });
  });
});
