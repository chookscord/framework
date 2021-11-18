import { diffOption } from '../../../packages/cli/src/lib/diff';

describe('did option update', () => {
  it('returns true for updated options', () => {
    expect(diffOption(
      {},
      null,
    )).toBe(true);

    expect(diffOption(
      { name: 'foo' },
      { name: 'bar' },
    )).toBe(true);

    expect(diffOption(
      { description: 'foo' },
      { description: 'bar' },
    )).toBe(true);

    expect(diffOption(
      { type: 'STRING' },
      { type: 'NUMBER' },
    )).toBe(true);

    expect(diffOption(
      { required: true },
      {},
    )).toBe(true);

    expect(diffOption(
      { options: [] },
      { options: [{ name: '', description: '', type: 'STRING' }] },
    )).toBe(true);

    expect(diffOption(
      { choices: [] },
      { choices: [{ name: '', value: '' }] },
    )).toBe(true);

    expect(diffOption(
      { options: [{ name: '', description: '', type: 'STRING' }] },
      { options: [{ name: '', description: '', type: 'NUMBER' }] },
    )).toBe(true);

    expect(diffOption(
      { choices: [{ name: 'foo', value: 'foo' }] },
      { choices: [{ name: 'foo', value: 'bar' }] },
    )).toBe(true);
  });

  it('returns false for stale options', () => {
    expect(diffOption(
      {
        name: 'foo',
        description: 'foo',
        type: 'STRING',
      },
      {
        name: 'foo',
        description: 'foo',
        type: 'STRING',
        required: false,
      },
    )).toBe(false);

    expect(diffOption(
      { options: [] },
      { options: [] },
    )).toBe(false);

    expect(diffOption(
      { choices: [] },
      { choices: [] },
    )).toBe(false);

    expect(diffOption(
      { options: [] },
      {},
    )).toBe(false);

    expect(diffOption(
      { choices: [] },
      {},
    )).toBe(false);

    expect(diffOption(
      { options: [{ name: '', description: '', type: 'STRING' }] },
      { options: [{ name: '', description: '', type: 'STRING' }] },
    )).toBe(false);

    expect(diffOption(
      { choices: [{ name: 'foo', value: 'foo' }] },
      { choices: [{ name: 'foo', value: 'foo' }] },
    )).toBe(false);
  });
});
