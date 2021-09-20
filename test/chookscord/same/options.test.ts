import * as tools from '../../../packages/chookscord/src/tools';
import * as types from '../../../packages/types';

const choice1: types.ChooksCommandOptionChoice = {
  name: 'foo',
  value: 'foo',
};

const choice2: types.ChooksCommandOptionChoice = {
  name: 'foo',
  value: 'bar',
};

const opt: types.ChooksCommandOption = {
  name: 'foo',
  description: 'foo',
  type: 'BOOLEAN',
};

describe('checking updated options', () => {
  it('returns false for unchanged basic structure', () => {
    expect(tools.isOptionChanged(
      opt,
      { ...opt },
    )).toBe(false);

    expect(tools.isOptionChanged(
      opt,
      { ...opt, required: false },
    )).toBe(false);
  });

  it('returns true for changed basic structure', () => {
    expect(tools.isOptionChanged(
      opt,
      { ...opt, name: 'bar' },
    )).toBe(true);

    expect(tools.isOptionChanged(
      opt,
      { ...opt, description: 'bar' },
    )).toBe(true);

    expect(tools.isOptionChanged(
      opt,
      { ...opt, type: 'CHANNEL' },
    )).toBe(true);

    expect(tools.isOptionChanged(
      opt,
      { ...opt, required: true },
    )).toBe(true);
  });

  it('returns false for unchanged nested choices', () => {
    expect(tools.isOptionChanged(
      opt,
      { ...opt, choices: [] },
    )).toBe(false);

    expect(tools.isOptionChanged(
      { ...opt, choices: [] },
      { ...opt, choices: [] },
    )).toBe(false);
  });

  it('returns true for changed nested choices', () => {
    expect(tools.isOptionChanged(
      { ...opt, choices: [choice1] },
      { ...opt, choices: [] },
    )).toBe(true);

    expect(tools.isOptionChanged(
      { ...opt, choices: [choice1] },
      { ...opt, choices: [choice2] },
    )).toBe(true);
  });

  it('returns false for unchanged nested options', () => {
    expect(tools.isOptionChanged(
      opt,
      { ...opt, options: [] },
    )).toBe(false);

    expect(tools.isOptionChanged(
      { ...opt, options: [opt] },
      { ...opt, options: [opt] },
    )).toBe(false);
  });

  it('returns true for changed nested options', () => {
    expect(tools.isOptionChanged(
      opt,
      { ...opt, options: [opt] },
    )).toBe(true);

    expect(tools.isOptionChanged(
      { ...opt, options: [opt] },
      { ...opt, options: [{ ...opt, name: 'bar' }] },
    )).toBe(true);
  });
});
