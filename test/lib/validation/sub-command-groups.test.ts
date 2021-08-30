import * as chooks from '@chookscord/lib';

describe('validating subcommand groups', () => {
  describe('proper structures', () => {
    it('accepts base structure', () => {
      const error = chooks.validateSubCommandGroup({
        name: 'foo',
        description: 'foo',
        options: [
          {
            name: 'foo',
            description: 'foo',
            type: 'SUB_COMMAND_GROUP',
            options: [
              {
                name: 'foo',
                description: 'foo',
                type: 'SUB_COMMAND',
                execute() { /*  */ },
              },
            ],
          },
        ],
      });
      expect(error).toBeNull();
    });

    it('accepts options in subcommand', () => {
      const error = chooks.validateSubCommandGroup({
        name: 'foo',
        description: 'foo',
        options: [
          {
            name: 'foo',
            description: 'foo',
            type: 'SUB_COMMAND_GROUP',
            options: [
              {
                name: 'foo',
                description: 'foo',
                type: 'SUB_COMMAND',
                execute() { /*  */ },
                options: [
                  {
                    name: 'foo',
                    description: 'foo',
                    type: 'STRING',
                  },
                ],
              },
            ],
          },
        ],
      });
      expect(error).toBeNull();
    });
  });

  describe('invalid structures', () => {
    describe('invalid executes', () => {
      test('execute in root', () => {
        const error = chooks.validateSubCommandGroup({
          name: 'foo',
          description: 'foo',
          // @ts-expect-error testing
          execute() { /*  */ },
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'SUB_COMMAND_GROUP',
              options: [
                {
                  name: 'foo',
                  description: 'foo',
                  type: 'SUB_COMMAND',
                  execute() { /*  */ },
                },
              ],
            },
          ],
        });
        expect(error).toBeTruthy();
      });

      test('execute in subcommand group', () => {
        const error = chooks.validateSubCommandGroup({
          name: 'foo',
          description: 'foo',
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'SUB_COMMAND_GROUP',
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
            },
          ],
        });
        expect(error).toBeTruthy();
      });

      test('no execute in subcommand', () => {
        const error = chooks.validateSubCommandGroup({
          name: 'foo',
          description: 'foo',
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'SUB_COMMAND_GROUP',
              options: [
                // @ts-expect-error testing
                {
                  name: 'foo',
                  description: 'foo',
                  type: 'SUB_COMMAND',
                },
              ],
            },
          ],
        });
        expect(error).toBeTruthy();
      });
    });

    describe('invalid options', () => {
      describe('subgroups', () => {
        test('no base options', () => {
          // @ts-expect-error testing
          const error = chooks.validateSubCommandGroup({
            name: 'foo',
            description: 'foo',
          });
          expect(error).toBeTruthy();
        });

        test('empty base options', () => {
          const error = chooks.validateSubCommandGroup({
            name: 'foo',
            description: 'foo',
            options: [],
          });
          expect(error).toBeTruthy();
        });

        test('subcommand group not in base option', () => {
          const error = chooks.validateSubCommandGroup({
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

        test('subcommand in base option', () => {
          const error = chooks.validateSubCommandGroup({
            name: 'foo',
            description: 'foo',
            options: [
              {
                name: 'foo',
                description: 'foo',
                // @ts-expect-error testing
                type: 'SUB_COMMAND',
                execute() { /*  */ },
              },
            ],
          });
          expect(error).toBeTruthy();
        });

        test('no subcommand options', () => {
          const error = chooks.validateSubCommandGroup({
            name: 'foo',
            description: 'foo',
            options: [
              // @ts-expect-error testing
              {
                name: 'foo',
                description: 'foo',
                type: 'SUB_COMMAND_GROUP',
              },
            ],
          });
          expect(error).toBeTruthy();
        });

        test('empty subcommand options', () => {
          const error = chooks.validateSubCommandGroup({
            name: 'foo',
            description: 'foo',
            options: [
              {
                name: 'foo',
                description: 'foo',
                type: 'SUB_COMMAND_GROUP',
                options: [],
              },
            ],
          });
          expect(error).toBeTruthy();
        });

        test('subcommand not in subcommand group options', () => {
          const error = chooks.validateSubCommandGroup({
            name: 'foo',
            description: 'foo',
            options: [
              {
                name: 'foo',
                description: 'foo',
                type: 'SUB_COMMAND_GROUP',
                options: [
                  {
                    name: 'foo',
                    description: 'foo',
                    // @ts-expect-error testing
                    type: 'STRING',
                  },
                ],
              },
            ],
          });
          expect(error).toBeTruthy();
        });

        test('subcommand group in subcommand group options', () => {
          const error = chooks.validateSubCommandGroup({
            name: 'foo',
            description: 'foo',
            options: [
              {
                name: 'foo',
                description: 'foo',
                type: 'SUB_COMMAND_GROUP',
                options: [
                  {
                    name: 'foo',
                    description: 'foo',
                    // @ts-expect-error testing
                    type: 'SUB_COMMAND_GROUP',
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
              },
            ],
          });
          expect(error).toBeTruthy();
        });
      });
    });
  });
});
