import * as tools from '../../packages/chookscord/src/tools';

const fakeImport = jest.fn(<T>(value: T) => value);

describe('importing files', () => {
  it('imports files', async () => {
    const file = await tools.loadFile(
      fakeImport,
      'foo',
    );
    expect(fakeImport).toHaveBeenCalledWith('foo');
    expect(file.ok).toBe(true);
    // @ts-ignore testing
    expect(file.data).toBe('foo');
  });

  it('validates proper files', async () => {
    const file = await tools.loadFile(
      fakeImport,
      'foo',
      value => value === 'foo' ? null : 'Error',
    );
    expect(file.ok).toBe(true);
    // @ts-ignore testing
    expect(file.data).toBe('foo');
  });

  it('rejects invalid files', async () => {
    const file = await tools.loadFile(
      fakeImport,
      'foo',
      value => value === 'bar' ? null : 'Error',
    );
    expect(file.ok).toBe(false);
    // @ts-ignore testing
    expect(file.error).toBeTruthy();
  });
});
