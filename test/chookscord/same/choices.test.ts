import * as tools from '../../../packages/chookscord/src/tools';
import * as types from '../../../packages/types';

const choice: types.ChooksCommandOptionChoice = {
  name: 'foo',
  value: 'foo',
};

describe('checking updated choices', () => {
  it('returns false for unchanged basic structure', () => {
    expect(tools.didChoiceChanged(
      choice,
      { ...choice },
    )).toBe(false);
  });

  it('returns true for changed basic structure', () => {
    expect(tools.didChoiceChanged(
      choice,
      null,
    )).toBe(true);

    expect(tools.didChoiceChanged(
      choice,
      { ...choice, name: 'bar' },
    )).toBe(true);

    expect(tools.didChoiceChanged(
      choice,
      { ...choice, value: 'bar' },
    )).toBe(true);
  });
});
