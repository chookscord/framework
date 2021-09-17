import * as lib from '../../packages/lib/dist';

describe('creating command keys', () => {
  it('creates keys for slash commands', () => {
    const key = lib.createCommandKey('foo');
    expect(key).toBe('foo');
  });

  it('creates keys for subcommands', () => {
    const key = lib.createCommandKey('foo', 'bar');
    expect(key).toBe('foo bar');
  });

  it('creates keys for group commands', () => {
    const key = lib.createCommandKey('foo', 'bar', 'qux');
    expect(key).toBe('foo bar qux');
  });
});
