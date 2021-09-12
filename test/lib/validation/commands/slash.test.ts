import * as lib from '../../../../packages/lib/dist';
import type * as types from '../../../../packages/types/dist';

const command: types.ChooksSlashCommand = {
  name: 'foo',
  description: 'foo',
  execute() {},
};

const option: types.ChooksNonCommandOption = {
  name: 'foo',
  description: 'foo',
  type: 'STRING',
};

describe('validating slash commands', () => {
  describe('proper structures', () => {
    it('accepts base structure', () => {
      const error = lib.validateSlashCommand(command);
      expect(error).toBeNull();
    });

    it('accepts options', () => {
      const error = lib.validateSlashCommand({
        ...command,
        options: [option],
      });
      expect(error).toBeNull();
    });
  });

  describe('invalid structures', () => {
    describe('invalid names', () => {
      test('no name', () => {
        const error = lib.validateSlashCommand({
          name: '',
          description: 'foo',
          execute() {},
        });
        expect(error).toBeTruthy();
      });

      test('uppercase in name', () => {
        const error = lib.validateSlashCommand({
          name: 'Foo',
          description: 'foo',
          execute() {},
        });
        expect(error).toBeTruthy();
      });

      test('invalid character in name', () => {
        const error = lib.validateSlashCommand({
          name: 'with space',
          description: 'foo',
          execute() {},
        });
        expect(error).toBeTruthy();
      });

      test('long name', () => {
        const error = lib.validateSlashCommand({
          // length > 32
          name: 'laoreetnoncurabiturgravidaarcuactortor',
          description: 'foo',
          execute() {},
        });
        expect(error).toBeTruthy();
      });
    });

    describe('invalid description', () => {
      test('no description', () => {
        const error = lib.validateSlashCommand({
          name: 'foo',
          description: '',
          execute() {},
        });
        expect(error).toBeTruthy();
      });

      test('long description', () => {
        const error = lib.validateSlashCommand({
          name: 'foo',
          // length > 100
          description: 'laoreet non curabitur gravida arcu ac tortor dignissim convallis aenean et tortor at risus viverra adipiscing at in tellus integer',
          execute() {},
        });
        expect(error).toBeTruthy();
      });
    });

    test('no execute', () => {
      // @ts-expect-error testing
      const error = lib.validateSlashCommand({
        name: 'foo',
        description: 'foo',
      });
      expect(error).toBeTruthy();
    });

    describe('invalid options', () => {
      test('nested subcommand', () => {
        const error = lib.validateSlashCommand({
          ...command,
          // @ts-expect-error testing
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'SUB_COMMAND',
              execute() {},
            },
          ] as types.ChooksSubCommandOption[],
        });
        expect(error).toBeTruthy();
      });

      test('nested subcommand group', () => {
        const error = lib.validateSlashCommand({
          ...command,
          // @ts-expect-error testing
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'SUB_COMMAND_GROUP',
              options: [],
            },
          ] as types.ChooksGroupCommandOption[],
        });
        expect(error).toBeTruthy();
      });

      test('too many options', () => {
        const error = lib.validateSlashCommand({
          ...command,
          options: Array
            .from({ length: 26 })
            .fill(option) as types.ChooksNonCommandOption[],
        });
        expect(error).toBeTruthy();
      });
    });
  });
});
