import * as lib from '../../../../packages/lib';

describe('validating message commands', () => {
  describe('proper structures', () => {
    it('accepts base structure', () => {
      expect(lib.validateUserCommand({
        name: 'foo',
        type: 'USER',
        execute() {},
      })).toBeNull();
    });

    it('accepts uppercase in name', () => {
      expect(lib.validateUserCommand({
        name: 'Foo',
        type: 'USER',
        execute() {},
      })).toBeNull();
    });

    it('accepts spaces in name', () => {
      expect(lib.validateUserCommand({
        name: 'With Space',
        type: 'USER',
        execute() {},
      })).toBeNull();
    });
  });

  describe('invalid structures', () => {
    describe('invalid names', () => {
      test('missing name', () => {
        // @ts-expect-error testing
        expect(lib.validateUserCommand({
          type: 'USER',
          execute() {},
        })).toBeTruthy();
      });

      test('long name', () => {
        expect(lib.validateUserCommand({
          // length > 32
          name: 'laoreetnoncurabiturgravidaarcuactortor',
          type: 'USER',
          execute() {},
        })).toBeTruthy();
      });

      test('invalid character', () => {
        expect(lib.validateUserCommand({
          name: 'with/slash',
          type: 'USER',
          execute() {},
        })).toBeTruthy();
      });
    });

    describe('invalid type', () => {
      test('wrong type', () => {
        expect(lib.validateUserCommand({
          // @ts-expect-error testing
          type: 'MESSAGE',
          name: 'foo',
          execute() {},
        })).toBeTruthy();
      });

      test('missing type', () => {
        expect(lib.validateUserCommand({
          // @ts-expect-error testing
          type: '',
          name: 'foo',
          execute() {},
        })).toBeTruthy();
      });
    });

    test('invalid description', () => {
      expect(lib.validateUserCommand({
        // @ts-expect-error testing
        description: 'foo',
        name: 'foo',
        type: 'USER',
        execute() {},
      })).toBeTruthy();
    });

    test('missing execute', () => {
      // @ts-expect-error testing
      expect(lib.validateUserCommand({
        name: 'foo',
        type: 'USER',
      }));
    });
  });
});
