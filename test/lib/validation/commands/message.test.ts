import * as lib from '../../../../packages/lib';

describe('validating message commands', () => {
  describe('proper structures', () => {
    it('accepts base structure', () => {
      expect(lib.validateMessageCommand({
        name: 'foo',
        type: 'MESSAGE',
        execute() {},
      })).toBeNull();
    });

    it('accepts uppercase in name', () => {
      expect(lib.validateMessageCommand({
        name: 'Foo',
        type: 'MESSAGE',
        execute() {},
      })).toBeNull();
    });

    it('accepts spaces in name', () => {
      expect(lib.validateMessageCommand({
        name: 'With Space',
        type: 'MESSAGE',
        execute() {},
      })).toBeNull();
    });
  });

  describe('invalid structures', () => {
    describe('invalid names', () => {
      test('missing name', () => {
        // @ts-expect-error testing
        expect(lib.validateMessageCommand({
          type: 'MESSAGE',
          execute() {},
        })).toBeTruthy();
      });

      test('long name', () => {
        expect(lib.validateMessageCommand({
          // length > 32
          name: 'laoreetnoncurabiturgravidaarcuactortor',
          type: 'MESSAGE',
          execute() {},
        })).toBeTruthy();
      });

      test('invalid character', () => {
        expect(lib.validateMessageCommand({
          name: 'with/slash',
          type: 'MESSAGE',
          execute() {},
        })).toBeTruthy();
      });
    });

    describe('invalid type', () => {
      test('wrong type', () => {
        expect(lib.validateMessageCommand({
          // @ts-expect-error testing
          type: 'USER',
          name: 'foo',
          execute() {},
        })).toBeTruthy();
      });

      test('missing type', () => {
        expect(lib.validateMessageCommand({
          // @ts-expect-error testing
          type: '',
          name: 'foo',
          execute() {},
        })).toBeTruthy();
      });
    });

    test('invalid description', () => {
      expect(lib.validateMessageCommand({
        // @ts-expect-error testing
        description: 'foo',
        name: 'foo',
        type: 'MESSAGE',
        execute() {},
      })).toBeTruthy();
    });

    test('missing execute', () => {
      // @ts-expect-error testing
      expect(lib.validateMessageCommand({
        name: 'foo',
        type: 'MESSAGE',
      }));
    });
  });
});
