import * as lib from '../../../../packages/lib';

describe('validating context commands', () => {
  describe('proper structures', () => {
    it('accepts base structure for user commands', () => {
      expect(lib.validateContextCommand({
        name: 'foo',
        type: 'USER',
        execute() {},
      })).toBeNull();
    });

    it('accepts base structure for message commands', () => {
      expect(lib.validateContextCommand({
        name: 'foo',
        type: 'MESSAGE',
        execute() {},
      })).toBeNull();
    });

    it('accepts uppercase in name', () => {
      expect(lib.validateContextCommand({
        name: 'Foo',
        type: 'USER',
        execute() {},
      })).toBeNull();
    });

    it('accepts spaces in name', () => {
      expect(lib.validateContextCommand({
        name: 'With Space',
        type: 'USER',
        execute() {},
      })).toBeNull();
    });
  });

  describe('invalid structures', () => {
    describe('invalid names', () => {
      test('missing name', () => {
        expect(lib.validateContextCommand({
          type: 'USER',
          execute() {},
        })).toBeTruthy();
      });

      test('long name', () => {
        expect(lib.validateContextCommand({
          // length > 32
          name: 'laoreetnoncurabiturgravidaarcuactortor',
          type: 'USER',
          execute() {},
        })).toBeTruthy();
      });

      test('invalid character', () => {
        expect(lib.validateContextCommand({
          name: 'with/slash',
          type: 'USER',
          execute() {},
        })).toBeTruthy();
      });
    });

    describe('invalid type', () => {
      test('wrong type', () => {
        expect(lib.validateContextCommand({
          // @ts-expect-error testing
          type: 'CHAT_INPUT',
          name: 'foo',
          execute() {},
        })).toBeTruthy();
      });

      test('missing type', () => {
        expect(lib.validateContextCommand({
          name: 'foo',
          execute() {},
        })).toBeTruthy();
      });
    });

    test('invalid description', () => {
      expect(lib.validateContextCommand({
        // @ts-expect-error testing
        description: 'foo',
        name: 'foo',
        type: 'USER',
        execute() {},
      })).toBeTruthy();
    });

    test('missing execute', () => {
      expect(lib.validateContextCommand({
        name: 'foo',
        type: 'USER',
      }));
    });
  });
});
