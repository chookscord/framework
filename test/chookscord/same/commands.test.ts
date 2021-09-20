import * as tools from '../../../packages/chookscord/src/tools';
import * as types from '../../../packages/types';

const command: types.ChooksCommand = {
  name: 'foo',
  description: 'foo',
};

const option: types.ChooksCommandOption = {
  name: 'foo',
  description: 'foo',
  type: 'STRING',
};

describe('checking updated commands', () => {
  it('returns false for unchanged basic structure', () => {
    expect(tools.isCommandChanged(
      command,
      { ...command },
    )).toBe(false);

    expect(tools.isCommandChanged(
      command,
      { ...command, type: 'CHAT_INPUT' },
    )).toBe(false);

    expect(tools.isCommandChanged(
      command,
      { ...command, execute() {} },
    )).toBe(false);

    expect(tools.isCommandChanged(
      command,
      { ...command, options: [] },
    )).toBe(false);

    expect(tools.isCommandChanged(
      { ...command, options: [option] },
      { ...command, options: [option] },
    )).toBe(false);
  });

  it('returns true for changed basic structure', () => {
    expect(tools.isCommandChanged(
      command,
      { ...command, name: 'bar' },
    )).toBe(true);

    expect(tools.isCommandChanged(
      command,
      { ...command, description: 'bar' },
    )).toBe(true);

    expect(tools.isCommandChanged(
      command,
      { ...command, type: 'MESSAGE' },
    )).toBe(true);

    expect(tools.isCommandChanged(
      command,
      { ...command, defaultPermission: true },
    )).toBe(true);

    expect(tools.isCommandChanged(
      command,
      { ...command, options: [option] },
    )).toBe(true);

    expect(tools.isCommandChanged(
      { ...command, options: [option] },
      { ...command, options: [{ ...option, type: 'NUMBER' }] },
    )).toBe(true);
  });
});
