import * as lib from '../../../packages/lib';
import type * as types from '../../../packages/types';

const choice: types.ChooksCommandOptionChoice = {
  name: 'foo',
  value: 'foo',
};

const option: types.ChooksNonCommandOption = {
  name: 'foo',
  description: 'foo',
  type: 'USER',
};

const optionWithChoice: types.ChooksCommandOptionWithChoice = {
  ...option,
  type: 'STRING',
  choices: [choice],
};

const optionWithoutChoice: types.ChooksCommandOptionWithoutChoice = {
  ...option,
  type: 'BOOLEAN',
};

const subCommand: types.ChooksSubCommandOption = {
  ...option,
  type: 'SUB_COMMAND',
  execute() {},
};

const groupCommand: types.ChooksGroupCommandOption = {
  ...option,
  type: 'SUB_COMMAND_GROUP',
  options: [subCommand],
};

describe('validating options', () => {
  describe('proper structures', () => {
    test('non-command without choice', () => {
      const error = lib.validateNonCommandOption(optionWithoutChoice);
      expect(error).toBeNull();
    });

    test('non-command with choice', () => {
      const error = lib.validateNonCommandOption(optionWithChoice);
      expect(error).toBeNull();
    });
  });

  describe('invalid structures', () => {
    describe('invalid nesting', () => {
      test('nesting group commands', () => {
        const error = lib.validateGroupCommandOption({
          ...groupCommand,
          options: [groupCommand],
        });
        expect(error).toBeTruthy();
      });

      test('group in subcommand', () => {
        const error = lib.validateSubCommandOption({
          ...subCommand,
          options: [groupCommand],
        });
        expect(error).toBeTruthy();
      });

      test('nesting subcommands', () => {
        const error = lib.validateSubCommandOption({
          ...subCommand,
          options: [subCommand],
        });
        expect(error).toBeTruthy();
      });

      test('nesting options', () => {
        const error = lib.validateNonCommandOption({
          ...option,
          options: [option],
        });
        expect(error).toBeTruthy();
      });
    });

    describe('invalid options', () => {
      test('missing subcommand in group', () => {
        const error = lib.validateGroupCommandOption({
          ...groupCommand,
          options: undefined,
        });
        expect(error).toBeTruthy();
      });

      test('choices in wrong type', () => {
        const error = lib.validateOption({
          ...optionWithoutChoice,
          choices: [choice],
        });
        expect(error).toBeTruthy();
      });

      test('too many options', () => {
        const error = lib.validateOption({
          ...option,
          options: Array
            .from({ length: 26 })
            .fill(option) as types.ChooksCommandOption[],
        });
        expect(error).toBeTruthy();
      });
    });
  });
});
