import { validateNonCommandOption, validateSubCommand, validateSubCommandGroup } from '../../src/lib/validation/options';
import { ChooksSubCommandOption } from 'chooksie/types';

describe('validating non command options', () => {
  describe('proper values', () => {
    test('minimal', () => {
      expect(validateNonCommandOption({
        name: 'foo',
        description: 'foo',
        type: 'STRING',
      })).toBeNull();
    });

    test('full', () => {
      expect(validateNonCommandOption({
        name: 'foo',
        description: 'foo',
        type: 'STRING',
        required: true,
        choices: [
          {
            name: 'foo',
            value: 'bar',
          },
        ],
      })).toBeNull();
    });
  });

  describe('invalid structures', () => {
    describe('invalid names', () => {
      test('missing name', () => {
        expect(typeof validateNonCommandOption({
          description: 'foo',
          type: 'STRING',
        })).toBe('string');
      });

      test('no name', () => {
        expect(typeof validateNonCommandOption({
          name: '',
          description: 'foo',
          type: 'STRING',
        })).toBe('string');
      });

      test('wrong type', () => {
        expect(typeof validateNonCommandOption({
          name: null as never,
          description: 'foo',
          type: 'STRING',
        })).toBe('string');
      });

      test('uppercase characters', () => {
        expect(typeof validateNonCommandOption({
          name: 'Uppercase',
          description: 'foo',
          type: 'STRING',
        })).toBe('string');
      });

      test('invalid characters', () => {
        expect(typeof validateNonCommandOption({
          name: 'space in name',
          description: 'foo',
          type: 'STRING',
        })).toBe('string');
      });

      test('long name', () => {
        expect(typeof validateNonCommandOption({
          name: ''.padEnd(33, 'a'),
          description: 'foo',
          type: 'STRING',
        })).toBe('string');
      });
    });

    describe('invalid descriptions', () => {
      test('missing description', () => {
        expect(typeof validateNonCommandOption({
          name: 'foo',
          type: 'STRING',
        })).toBe('string');
      });

      test('no description', () => {
        expect(typeof validateNonCommandOption({
          name: 'foo',
          description: '',
          type: 'STRING',
        })).toBe('string');
      });

      test('wrong type', () => {
        expect(typeof validateNonCommandOption({
          name: 'foo',
          description: null as never,
          type: 'STRING',
        })).toBe('string');
      });

      test('long description', () => {
        expect(typeof validateNonCommandOption({
          name: 'foo',
          description: ''.padEnd(101, 'a'),
          type: 'STRING',
        })).toBe('string');
      });
    });

    describe('invalid choices', () => {
      test('invalid type', () => {
        expect(typeof validateNonCommandOption({
          name: 'foo',
          description: 'foo',
          type: 'STRING',
          choices: {} as never,
        })).toBe('string');
      });

      test('invalid values', () => {
        expect(typeof validateNonCommandOption({
          name: 'foo',
          description: 'foo',
          type: 'STRING',
          choices: [
            {
              name: 'foo',
              value: '',
            },
          ],
        })).toBe('string');

        expect(typeof validateNonCommandOption({
          name: 'foo',
          description: 'foo',
          type: 'STRING',
          choices: [
            {
              name: '',
              value: 'foo',
            },
          ],
        })).toBe('string');
      });

      test('invalid size', () => {
        expect(typeof validateNonCommandOption({
          name: 'foo',
          description: 'foo',
          type: 'STRING',
          choices: Array.from({ length: 26 }),
        })).toBe('string');
      });

      test('invalid option type', () => {
        expect(typeof validateNonCommandOption({
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND',
          choices: [],
        })).toBe('string');
      });
    });

    describe('invalid options', () => {
      test('nested option', () => {
        expect(typeof validateNonCommandOption({
          name: 'foo',
          description: 'foo',
          type: 'STRING',
          options: [],
        })).toBe('string');
      });
    });
  });
});

describe('validating subcommand options', () => {
  describe('proper values', () => {
    test('minimal', () => {
      expect(validateSubCommand({
        name: 'foo',
        description: 'foo',
        type: 'SUB_COMMAND',
        execute() {},
      })).toBeNull();
    });

    test('full', () => {
      expect(validateSubCommand({
        name: 'foo',
        description: 'foo',
        type: 'SUB_COMMAND',
        setup() { return {} },
        execute() {},
        options: [
          {
            name: 'foo',
            description: 'foo',
            type: 'STRING',
          },
        ],
      })).toBeNull();
    });
  });

  describe('invalid structures', () => {
    test('invalid type', () => {
      expect(typeof validateSubCommand({
        name: 'foo',
        description: 'foo',
        type: 'STRING',
        // @ts-ignore testing
        execute() {},
      })).toBe('string');
    });

    test('missing handler', () => {
      expect(typeof validateSubCommand({
        name: 'foo',
        description: 'foo',
        type: 'SUB_COMMAND',
      })).toBe('string');
    });

    test('invalid setup', () => {
      expect(typeof validateSubCommand({
        name: 'foo',
        description: 'foo',
        type: 'SUB_COMMAND',
        setup: null as never,
        execute() {},
      })).toBe('string');
    });

    test('invalid choice', () => {
      expect(typeof validateSubCommand({
        name: 'foo',
        description: 'foo',
        type: 'SUB_COMMAND',
        execute() {},
        choices: [],
      })).toBe('string');
    });

    describe('invalid options', () => {
      test('invalid option', () => {
        expect(typeof validateSubCommand({
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND',
          execute() {},
          options: [null as never],
        })).toBe('string');
      });

      test('too many options', () => {
        expect(typeof validateSubCommand({
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND',
          execute() {},
          options: Array.from({ length: 26 }),
        })).toBe('string');
      });

      test('invalid nesting', () => {
        expect(typeof validateSubCommand({
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND',
          execute() {},
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'SUB_COMMAND',
            },
          ],
        })).toBe('string');

        expect(typeof validateSubCommand({
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND',
          execute() {},
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'SUB_COMMAND_GROUP',
            },
          ],
        })).toBe('string');
      });
    });
  });
});

describe('validating subcommand groups', () => {
  const subCommand: ChooksSubCommandOption = {
    name: 'foo',
    description: 'foo',
    type: 'SUB_COMMAND',
    execute() {},
  };

  describe('proper values', () => {
    test('minimal', () => {
      expect(validateSubCommandGroup({
        name: 'foo',
        description: 'foo',
        type: 'SUB_COMMAND_GROUP',
        options: [
          {
            name: 'foo',
            description: 'foo',
            type: 'SUB_COMMAND',
            execute() {},
          },
        ],
      })).toBeNull();
    });

    test('full', () => {
      expect(validateSubCommandGroup({
        name: 'foo',
        description: 'foo',
        type: 'SUB_COMMAND_GROUP',
        required: true,
        options: [
          {
            name: 'foo',
            description: 'foo',
            type: 'SUB_COMMAND',
            required: true,
            setup() { return {} },
            execute() {},
            options: [
              {
                name: 'foo',
                description: 'foo',
                type: 'STRING',
              },
            ],
          },
        ],
      })).toBeNull();
    });
  });

  describe('invalid structures', () => {
    test('invalid type', () => {
      expect(typeof validateSubCommandGroup({
        name: 'foo',
        description: 'foo',
        type: 'STRING',
        options: [subCommand],
      })).toBe('string');
    });

    test('invalid handler', () => {
      expect(typeof validateSubCommandGroup({
        name: 'foo',
        description: 'foo',
        type: 'SUB_COMMAND_GROUP',
        // @ts-ignore testing
        execute() {},
        options: [subCommand],
      })).toBe('string');
    });

    test('invalid setup', () => {
      expect(typeof validateSubCommandGroup({
        name: 'foo',
        description: 'foo',
        type: 'SUB_COMMAND_GROUP',
        // @ts-ignore testing
        setup() {},
        options: [subCommand],
      })).toBe('string');
    });

    test('invalid choice', () => {
      expect(typeof validateSubCommandGroup({
        name: 'foo',
        description: 'foo',
        type: 'SUB_COMMAND_GROUP',
        options: [subCommand],
        choices: [],
      })).toBe('string');
    });

    describe('invalid options', () => {
      test('missing options', () => {
        expect(typeof validateSubCommandGroup({
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND_GROUP',
        })).toBe('string');
      });

      test('no options', () => {
        expect(typeof validateSubCommandGroup({
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND_GROUP',
          options: [],
        })).toBe('string');
      });

      test('invalid nesting', () => {
        expect(typeof validateSubCommandGroup({
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'STRING',
            },
          ],
        })).toBe('string');

        expect(typeof validateSubCommandGroup({
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'SUB_COMMAND_GROUP',
              options: [subCommand],
            },
          ],
        })).toBe('string');
      });
    });
  });
});
