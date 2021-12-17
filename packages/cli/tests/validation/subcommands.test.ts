import { ChooksCommandGroupOption, ChooksSubCommandOption } from 'chooksie/types';
import { validateSlashSubCommand } from '../../src/lib/validation/commands';

describe('validating slash subcommands', () => {
  const subCommand: ChooksSubCommandOption = {
    name: 'foo',
    description: 'foo',
    type: 'SUB_COMMAND',
    execute() {},
  };

  const subCommandGroup: ChooksCommandGroupOption = {
    name: 'foo',
    description: 'foo',
    type: 'SUB_COMMAND_GROUP',
    options: [subCommand],
  };

  describe('proper structures', () => {
    test('minimal subcommand', () => {
      expect(validateSlashSubCommand({
        name: 'foo',
        description: 'foo',
        options: [subCommand],
      })).toBeNull();
    });

    test('minimal subcommand group', () => {
      expect(validateSlashSubCommand({
        name: 'foo',
        description: 'foo',
        options: [subCommandGroup],
      }));
    });

    test('full subcommand', () => {
      expect(validateSlashSubCommand({
        name: 'foo',
        description: 'foo',
        defaultPermission: true,
        type: 'CHAT_INPUT',
        options: [subCommand],
      })).toBeNull();
    });

    test('full subcommand group', () => {
      expect(validateSlashSubCommand({
        name: 'foo',
        description: 'foo',
        defaultPermission: true,
        type: 'CHAT_INPUT',
        options: [subCommandGroup],
      })).toBeNull();
    });
  });

  describe('invalid structures', () => {
    test('invalid handler', () => {
      expect(typeof validateSlashSubCommand({
        name: 'foo',
        description: 'foo',
        // @ts-ignore testing
        execute() {},
        options: [subCommand],
      })).toBe('string');
    });

    test('invalid setup', () => {
      expect(typeof validateSlashSubCommand({
        name: 'foo',
        description: 'foo',
        // @ts-ignore testing
        setup() { return {} },
        options: [subCommand],
      })).toBe('string');
    });

    test('invalid type', () => {
      expect(typeof validateSlashSubCommand({
        name: 'foo',
        description: 'foo',
        type: 'USER' as never,
        options: [subCommand],
      })).toBe('string');
    });

    describe('invalid options', () => {
      test('no options', () => {
        expect(typeof validateSlashSubCommand({
          name: 'foo',
          description: 'foo',
        })).toBe('string');
      });

      test('empty options', () => {
        expect(typeof validateSlashSubCommand({
          name: 'foo',
          description: 'foo',
          options: [],
        })).toBe('string');
      });

      test('non-command option in options', () => {
        expect(typeof validateSlashSubCommand({
          name: 'foo',
          description: 'foo',
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'STRING',
            } as never,
          ],
        })).toBe('string');
      });
    });
  });
});
