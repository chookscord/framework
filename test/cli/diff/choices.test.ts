import { diffChoice } from '../../../packages/cli/src/lib/diff';

describe('did choice update', () => {
  it('returns true for updated choices', () => {
    expect(diffChoice(
      {},
      null,
    )).toBe(true);

    expect(diffChoice(
      {
        name: 'foo',
        value: 'bar',
      },
      {
        name: 'bar',
        value: 'foo',
      },
    ));

    expect(diffChoice(
      {
        name: 'foo',
        value: 'foo',
      },
      {
        name: 'foo',
        value: 'bar',
      },
    )).toBe(true);
  });

  it('returns false for stale choices', () => {
    expect(diffChoice(
      {
        name: 'foo',
        value: 'foo',
      },
      {
        name: 'foo',
        value: 'foo',
      },
    )).toBe(false);
  });
});
