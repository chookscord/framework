import * as lib from '../../../packages/lib';
import type * as types from '../../../packages/types';

const choice = {
  name: 'foo',
  value: 'foo',
} as types.DiscordCommandOptionChoice;

describe('validating choices', () => {
  describe('proper structures', () => {
    it('accepts a single choice', () => {
      const error = lib.validateChoice(choice);
      expect(error).toBeNull();
    });

    it('accepts a list of choices', () => {
      const error = lib.validateChoiceList([choice]);
      expect(error).toBeNull();
    });
  });

  describe('invalid structures', () => {
    test('invalid name', () => {
      const error = lib.validateChoice({
        name: '',
        value: 'foo',
      });
      expect(error).toBeTruthy();
    });

    describe('invalid values', () => {
      test('invalid type', () => {
        const error = lib.validateChoice({
          name: 'foo',
          // @ts-expect-error testing
          value: null,
        });
        expect(error).toBeTruthy();
      });

      test('no value', () => {
        const error = lib.validateChoice({
          name: 'foo',
          value: '',
        });
        expect(error).toBeTruthy();
      });

      test('value too long', () => {
        const error = lib.validateChoice({
          name: 'foo',
          // length > 100
          value: 'malesuada fames ac turpis egestas sed tempus urna et pharetra pharetra massa massa ultricies mi quis hendrerit dolor magna eget',
        });
        expect(error).toBeTruthy();
      });
    });
  });
});
