import { validateChoice } from '../../../packages/cli/src/lib/validation/choices';

describe('validating choices', () => {
  it('accepts proper values', () => {
    expect(validateChoice({
      name: 'foo',
      value: 'bar',
    })).toBeNull();

    expect(validateChoice({
      name: 'foo',
      value: 0,
    })).toBeNull();
  });

  describe('invalid structures', () => {
    describe('invalid names', () => {
      test('no name', () => {
        expect(typeof validateChoice({
          value: 'foo',
        })).toBe('string');

        expect(typeof validateChoice({
          name: '',
          value: 'foo',
        })).toBe('string');
      });

      test('invalid type', () => {
        expect(typeof validateChoice({
          name: null as never,
          value: 'foo',
        }));
      });

      test('name too long', () => {
        expect(validateChoice({
          name: ''.padEnd(100, 'a'),
          value: 'foo',
        })).toBeNull();

        expect(typeof validateChoice({
          name: ''.padEnd(101, 'a'),
          value: 'foo',
        })).toBe('string');
      });
    });

    describe('invalid values', () => {
      test('no value', () => {
        expect(typeof validateChoice({
          name: 'foo',
        })).toBe('string');

        expect(typeof validateChoice({
          name: 'foo',
          value: '',
        }));
      });

      test('invalid type', () => {
        expect(typeof validateChoice({
          name: 'foo',
          value: null as never,
        })).toBe('string');
      });

      test('value too long', () => {
        expect(validateChoice({
          name: 'foo',
          value: ''.padEnd(100, 'a'),
        })).toBeNull();

        expect(typeof validateChoice({
          name: 'foo',
          value: ''.padEnd(101, 'a'),
        })).toBe('string');
      });
    });
  });
});
