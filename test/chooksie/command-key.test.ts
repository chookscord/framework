import { createCommandKey } from '../../packages/chooksie/src/utils/commands';

describe('creating command keys', () => {
  it('creates keys for slash commands', () => {
    const key = createCommandKey('foo');
    expect(key).toBe('foo');
  });

  it('creates keys for subcommands', () => {
    const key = createCommandKey('foo', 'bar');
    expect(key).toBe('foo.bar');
  });

  it('creates keys for group commands', () => {
    const key = createCommandKey('foo', 'bar', 'qux');
    expect(key).toBe('foo.bar.qux');
  });
});
