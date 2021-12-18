import { ChooksSubCommandOption } from 'chooksie/types';
import { validateSlashCommand } from '../../src/lib/validation/commands';

describe('validating slash commands', () => {
  describe('proper structures', () => {
    test('minimal', () => {
      expect(validateSlashCommand({
        name: 'foo',
        description: 'foo',
        execute() {},
      })).toBeNull();
    });

    test('full', () => {
      expect(validateSlashCommand({
        name: 'foo',
        description: 'foo',
        type: 'CHAT_INPUT',
        defaultPermission: true,
        setup() { return {} },
        execute() {},
        options: [
          {
            name: 'foo',
            description: 'foo',
            type: 'STRING',
          },
        ],
      })).toBeNull();
    });
  });

  describe('invalid structures', () => {
    describe('invalid names', () => {
      test('missing name', () => {
        expect(typeof validateSlashCommand({
          description: 'foo',
          execute() {},
        })).toBe('string');
      });

      test('no name', () => {
        expect(typeof validateSlashCommand({
          name: '',
          description: 'foo',
          execute() {},
        })).toBe('string');
      });

      test('invalid type', () => {
        expect(typeof validateSlashCommand({
          name: null as never,
          description: 'foo',
          execute() {},
        })).toBe('string');
      });

      test('uppercase in name', () => {
        expect(typeof validateSlashCommand({
          name: 'Uppercase',
          description: 'foo',
          execute() {},
        })).toBe('string');
      });

      test('invalid characters', () => {
        expect(typeof validateSlashCommand({
          name: 'space in name',
          description: 'foo',
          execute() {},
        })).toBe('string');
      });

      test('name too long', () => {
        expect(validateSlashCommand({
          name: ''.padEnd(32, 'a'),
          description: 'foo',
          execute() {},
        })).toBeNull();

        expect(typeof validateSlashCommand({
          name: ''.padEnd(33, 'a'),
          description: 'foo',
          execute() {},
        })).toBe('string');
      });
    });

    describe('invalid descriptions', () => {
      test('missing description', () => {
        expect(typeof validateSlashCommand({
          name: 'foo',
          execute() {},
        })).toBe('string');
      });

      test('no description', () => {
        expect(typeof validateSlashCommand({
          name: 'foo',
          description: '',
          execute() {},
        })).toBe('string');
      });

      test('invalid type', () => {
        expect(typeof validateSlashCommand({
          name: 'foo',
          description: null as never,
          execute() {},
        })).toBe('string');
      });

      test('name too long', () => {
        expect(validateSlashCommand({
          name: 'foo',
          description: ''.padEnd(100, 'a'),
          execute() {},
        })).toBeNull();

        expect(typeof validateSlashCommand({
          name: 'foo',
          description: ''.padEnd(101, 'a'),
          execute() {},
        })).toBe('string');
      });
    });

    describe('invalid handler', () => {
      test('missing handler', () => {
        expect(typeof validateSlashCommand({
          name: 'foo',
          description: 'foo',
        })).toBe('string');
      });

      test('invalid handler type', () => {
        expect(typeof validateSlashCommand({
          name: 'foo',
          description: 'foo',
          execute: null as never,
        })).toBe('string');
      });
    });

    test('invalid type', () => {
      expect(typeof validateSlashCommand({
        name: 'foo',
        description: 'foo',
        type: 'USER' as never,
        execute() {},
      })).toBe('string');

      expect(typeof validateSlashCommand({
        name: 'foo',
        description: 'foo',
        type: null as never,
        execute() {},
      })).toBe('string');
    });

    test('invalid setup', () => {
      expect(typeof validateSlashCommand({
        name: 'foo',
        description: 'foo',
        setup: null as never,
        execute() {},
      })).toBe('string');
    });

    describe('invalid options', () => {
      test('too many options', () => {
        expect(typeof validateSlashCommand({
          name: 'foo',
          description: 'foo',
          execute() {},
          options: Array.from({ length: 26 }),
        })).toBe('string');
      });

      test('invalid nesting', () => {
        const subCommand: ChooksSubCommandOption = {
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND',
          execute() {},
        };

        expect(typeof validateSlashCommand({
          name: 'foo',
          description: 'foo',
          execute() {},
          options: [subCommand as never],
        })).toBe('string');

        expect(typeof validateSlashCommand({
          name: 'foo',
          description: 'foo',
          execute() {},
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'SUB_COMMAND_GROUP' as never,
              // @ts-ignore testing
              options: [subCommand],
            },
          ],
        })).toBe('string');
      });
    });
  });
});
