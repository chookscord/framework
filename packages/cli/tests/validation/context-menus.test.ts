import { validateContextCommand } from '../../src/lib/validation/commands';

describe('validating context menus', () => {
  describe('proper structures', () => {
    test('minimal', () => {
      expect(validateContextCommand({
        name: 'Foo',
        type: 'MESSAGE',
        execute() {},
      })).toBeNull();

      expect(validateContextCommand({
        name: 'Foo',
        type: 'USER',
        execute() {},
      })).toBeNull();
    });

    test('full', () => {
      expect(validateContextCommand({
        name: 'Foo',
        type: 'MESSAGE',
        defaultPermission: true,
        setup() { return {} },
        execute() {},
      })).toBeNull();

      expect(validateContextCommand({
        name: 'Foo',
        type: 'USER',
        defaultPermission: true,
        setup() { return {} },
        execute() {},
      })).toBeNull();
    });
  });

  describe('invalid structures', () => {
    test('invalid description', () => {
      expect(typeof validateContextCommand({
        name: 'Foo',
        // @ts-ignore testing
        description: 'foo',
        type: 'USER',
        execute() {},
      })).toBe('string');
    });

    test('invalid options', () => {
      expect(typeof validateContextCommand({
        name: 'Foo',
        type: 'USER',
        execute() {},
        // @ts-ignore testing
        options: [],
      })).toBe('string');
    });

    describe('invalid names', () => {
      test('invalid character', () => {
        expect(typeof validateContextCommand({
          name: 'with+symbol',
          type: 'USER',
          execute() {},
        })).toBe('string');
      });

      test('name too long', () => {
        expect(validateContextCommand({
          name: ''.padEnd(32, 'a'),
          type: 'USER',
          execute() {},
        })).toBeNull();

        expect(typeof validateContextCommand({
          name: ''.padEnd(33, 'a'),
          type: 'USER',
          execute() {},
        })).toBe('string');
      });
    });

    describe('invalid types', () => {
      test('no type', () => {
        expect(typeof validateContextCommand({
          name: 'Foo',
          execute() {},
        })).toBe('string');
      });

      test('missing type', () => {
        expect(typeof validateContextCommand({
          name: 'Foo',
          type: '' as never,
          execute() {},
        })).toBe('string');
      });

      test('invalid type', () => {
        expect(typeof validateContextCommand({
          name: 'Foo',
          type: 'CHAT_INPUT' as never,
          execute() {},
        })).toBe('string');
      });
    });

    describe('invalid handler', () => {
      test('missing handler', () => {
        expect(typeof validateContextCommand({
          name: 'Foo',
          type: 'USER',
        })).toBe('string');
      });

      test('invalid handler type', () => {
        expect(typeof validateContextCommand({
          name: 'Foo',
          type: 'USER',
          execute: null as never,
        })).toBe('string');
      });
    });

    describe('invalid setup', () => {
      test('invalid setup type', () => {
        expect(typeof validateContextCommand({
          name: 'Foo',
          type: 'USER',
          setup: null as never,
          execute() {},
        })).toBe('string');
      });
    });
  });
});
