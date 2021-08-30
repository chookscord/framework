import * as chooks from '@chookscord/lib';

describe('validating slash commands', () => {
  describe('proper structures', () => {
    it('accepts base structure', () => {
      const error = chooks.validateSlashCommand({
        name: 'foo',
        description: 'foo',
        execute() { /*  */ },
      });
      expect(error).toBeNull();
    });

    it('accepts options', () => {
      const error = chooks.validateSlashCommand({
        name: 'foo',
        description: 'foo',
        execute() { /*  */ },
        options: [
          {
            name: 'foo',
            description: 'foo',
            type: 'STRING',
          },
        ],
      });
      expect(error).toBeNull();
    });
  });

  describe('invalid structures', () => {
    describe('invalid names', () => {
      test('no name', () => {
        const error = chooks.validateSlashCommand({
          name: '',
          description: 'foo',
          execute() { /*  */ },
        });
        expect(error).toBeTruthy();
      });

      test('uppercase in name', () => {
        const error = chooks.validateSlashCommand({
          name: 'Foo',
          description: 'foo',
          execute() { /*  */ },
        });
        expect(error).toBeTruthy();
      });

      test('invalid character in name', () => {
        const error = chooks.validateSlashCommand({
          name: 'with space',
          description: 'foo',
          execute() { /*  */ },
        });
        expect(error).toBeTruthy();
      });

      test('long name', () => {
        const error = chooks.validateSlashCommand({
          name: 'laoreetnoncurabiturgravidaarcuactortor',
          description: 'foo',
          execute() { /*  */ },
        });
        expect(error).toBeTruthy();
      });
    });

    describe('invalid description', () => {
      test('no description', () => {
        const error = chooks.validateSlashCommand({
          name: 'foo',
          description: '',
          execute() { /*  */ },
        });
        expect(error).toBeTruthy();
      });

      test('long description', () => {
        const error = chooks.validateSlashCommand({
          name: 'foo',
          // string length over 100
          description: 'laoreet non curabitur gravida arcu ac tortor dignissim convallis aenean et tortor at risus viverra adipiscing at in tellus integer',
          execute() { /*  */ },
        });
        expect(error).toBeTruthy();
      });
    });

    test('no execute', () => {
      // @ts-expect-error testing
      const error = chooks.validateSlashCommand({
        name: 'foo',
        description: 'foo',
      });
      expect(error).toBeTruthy();
    });
  });
});
