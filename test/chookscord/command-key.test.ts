import * as utils from '../../packages/chookscord/src/utils';

describe('creating command keys', () => {
  it('creates keys for slash commands', () => {
    const key = utils.createCommandKey('foo');
    expect(key).toBe('foo');
  });

  it('creates keys for subcommands', () => {
    const key = utils.createCommandKey('foo', 'bar');
    expect(key).toBe('foo.bar');
  });

  it('creates keys for group commands', () => {
    const key = utils.createCommandKey('foo', 'bar', 'qux');
    expect(key).toBe('foo.bar.qux');
  });
});
