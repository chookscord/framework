import * as lib from '../../packages/lib';

describe('store', () => {
  const store = new lib.Store<string>('test');
  const key = 'foo';
  const value = 'bar';

  afterEach(() => {
    store.clear();
  });

  it('sets and gets values', () => {
    store.set(key, value);

    expect(store.size).toBe(1);
    expect(store.get(key)).toBe(value);
    expect(store.toArray()).toStrictEqual([value]);
    for (const val of store.getAll()) {
      expect(val).toBe(value);
    }
  });

  it('emits events', () => {
    const fn = jest.fn();
    const newValue = 'qux';

    store.addEventListener('set', fn);
    store.addEventListener('remove', fn);

    store.set(key, value);
    store.set(key, newValue);
    store.delete(key);

    expect(fn).toHaveBeenCalledWith(value, null);
    expect(fn).toHaveBeenCalledWith(newValue, value);
    expect(fn).toHaveBeenCalledWith(newValue);
  });
});
