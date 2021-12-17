import { validateEvent } from '../../src/lib/validation/events';

describe('validating event modules', () => {
  it('accepts proper values', () => {
    expect(validateEvent({
      name: 'ready',
      execute() {},
    })).toBeNull();

    expect(validateEvent({
      name: 'ready',
      once: true,
      execute() {},
      setup() { return {} },
    })).toBeNull();
  });

  describe('invalid values', () => {
    test('missing name', () => {
      expect(typeof validateEvent({
        execute() {},
      })).toBe('string');
    });

    test('missing handler', () => {
      expect(typeof validateEvent({
        name: 'ready',
      })).toBe('string');
    });

    test('invalid setup', () => {
      expect(typeof validateEvent({
        name: 'ready',
        execute() {},
        setup: {} as never,
      })).toBe('string');
    });
  });
});
