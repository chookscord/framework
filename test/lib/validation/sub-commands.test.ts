import * as chooks from '@chookscord/lib';

describe('validating subcommands', () => {
  describe('proper structures', () => {
    it('accepts base structure', () => {
      const error = chooks.validateSlashSubCommand({
        name: 'foo',
        description: 'foo',
        options: [
          {
            name: 'foo',
            description: 'foo',
            type: 'SUB_COMMAND',
            execute() { /*  */ },
          },
        ],
      });
      expect(error).toBeNull();
    });
  });

  describe('invalid structures', () => {
    test('has execute in root', () => {
      const error = chooks.validateSlashSubCommand({
        name: 'foo',
        description: 'foo',
        // @ts-expect-error testing
        execute() { /*  */ },
        options: [
          {
            name: 'foo',
            description: 'foo',
            type: 'SUB_COMMAND',
            execute() { /*  */ },
          },
        ],
      });
      expect(error).toBeTruthy();
    });

    describe('invalid options', () => {
      test('no options', () => {
        // @ts-expect-error testing
        const error = chooks.validateSlashSubCommand({
          name: 'foo',
          description: 'foo',
        });
        expect(error).toBeTruthy();
      });

      test('empty options', () => {
        const error = chooks.validateSlashSubCommand({
          name: 'foo',
          description: 'foo',
          options: [],
        });
        expect(error).toBeTruthy();
      });

      test('invalid type', () => {
        const error = chooks.validateSlashSubCommand({
          name: 'foo',
          description: 'foo',
          // @ts-expect-error testing
          options: {},
        });
        expect(error).toBeTruthy();
      });

      test('invalid option type', () => {
        const error = chooks.validateSlashSubCommand({
          name: 'foo',
          description: 'foo',
          options: [
            {
              name: 'foo',
              description: 'foo',
              // @ts-expect-error testing
              type: 'STRING',
            },
          ],
        });
        expect(error).toBeTruthy();
      });

      test('deeply nested subcommand', () => {
        const error = chooks.validateSlashSubCommand({
          name: 'foo',
          description: 'foo',
          options: [
            {
              name: 'foo',
              description: 'foo',
              execute() { /*  */ },
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'foo',
                  description: 'foo',
                  // @ts-expect-error testing
                  type: 'SUB_COMMAND',
                  execute() { /*  */ },
                },
              ],
            },
          ],
        });
        expect(error).toBeTruthy();
      });
    });
  });
});
