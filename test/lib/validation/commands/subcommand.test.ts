import * as lib from '../../../../packages/lib';
import type * as types from '../../../../packages/types';

const command: types.ChooksCommand = {
  name: 'foo',
  description: 'foo',
};

const subCommand: types.ChooksSubCommandOption = {
  name: 'foo',
  description: 'foo',
  type: 'SUB_COMMAND',
  execute() {},
};

const commandGroup = {
  name: 'foo',
  description: 'foo',
  type: 'SUB_COMMAND_GROUP',
} as types.ChooksGroupCommandOption;

describe('validating subcommands', () => {
  describe('proper structures', () => {
    it('accepts subcommands', () => {
      const error = lib.validateSubCommand({
        ...command,
        options: [subCommand],
      });
      expect(error).toBeNull();
    });

    it('accepts subcommand groups', () => {
      const error = lib.validateSubCommand({
        ...command,
        options: [
          {
            ...commandGroup,
            options: [subCommand],
          },
        ],
      });
      expect(error).toBeNull();
    });
  });

  describe('invalid structures', () => {
    describe('invalid options', () => {
      test('missing subcommands', () => {
        const error = lib.validateSubCommand(command);
        expect(error).toBeTruthy();
      });

      test('too many subcommands', () => {
        const error = lib.validateSubCommand({
          ...command,
          options: Array
            .from({ length: 26 })
            .fill(subCommand) as types.ChooksSubCommandOption[],
        });
        expect(error).toBeTruthy();
      });

      test.todo('non-command options alongside subcommands');
    });
  });
});
