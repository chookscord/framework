import { diffCommand } from '../../src/lib/diff';

describe('did slash command update', () => {
  it('returns true for updated slash commands', () => {
    expect(diffCommand(
      {},
      null,
    )).toBe(true);

    expect(diffCommand(
      { name: 'foo' },
      { name: 'bar' },
    )).toBe(true);

    expect(diffCommand(
      { description: 'foo' },
      { description: 'bar' },
    )).toBe(true);

    expect(diffCommand(
      {},
      { type: 'MESSAGE' },
    )).toBe(true);

    expect(diffCommand(
      {},
      { defaultPermission: true },
    )).toBe(true);

    expect(diffCommand(
      { options: [] },
      { options: [{ name: '', description: '', type: 'STRING' }] },
    )).toBe(true);

    expect(diffCommand(
      { options: [{ name: '', description: '', type: 'STRING' }] },
      { options: [{ name: '', description: '', type: 'NUMBER' }] },
    )).toBe(true);
  });

  it('returns false for stale slash commands', () => {
    expect(diffCommand(
      {
        name: 'foo',
        description: 'foo',
        execute() {},
      },
      {
        name: 'foo',
        description: 'foo',
        setup() { return {} },
        execute() {},
      },
    )).toBe(false);

    expect(diffCommand(
      {},
      { type: 'CHAT_INPUT' },
    )).toBe(false);

    expect(diffCommand(
      { type: 'MESSAGE' },
      { type: 'MESSAGE' },
    )).toBe(false);

    expect(diffCommand(
      {},
      { defaultPermission: false },
    )).toBe(false);

    expect(diffCommand(
      { defaultPermission: true },
      { defaultPermission: true },
    )).toBe(false);

    expect(diffCommand(
      {},
      { options: [] },
    )).toBe(false);

    expect(diffCommand(
      { options: [] },
      { options: [] },
    )).toBe(false);

    expect(diffCommand(
      { options: [{ name: '', description: '', type: 'STRING' }] },
      { options: [{ name: '', description: '', type: 'STRING' }] },
    )).toBe(false);
  });
});
