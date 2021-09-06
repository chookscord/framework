/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any */
import * as chooks from '@chookscord/lib';

describe('interactions register', () => {
  it('prepares slash commands', () => {
    const [command] = chooks.prepareCommands([
      {
        name: 'foo',
        description: 'foo',
        execute() { /*  */ },
      },
    ]);

    expect(command).toEqual({
      name: 'foo',
      description: 'foo',
      type: chooks.CommandType.CHAT_INPUT,
    });
  });

  it('prepares subcommands', () => {
    const [command] = chooks.prepareCommands([
      {
        options: [
          {
            name: 'foo',
            description: 'foo',
            type: 'SUB_COMMAND',
            execute() { /*  */ },
          },
        ],
      } as unknown as chooks.SlashSubCommand,
    ]);

    const [option] = command.options!;
    expect(option).toStrictEqual({
      name: 'foo',
      description: 'foo',
      type: chooks.CommandOptionType.SUB_COMMAND,
    });
  });

  it('prepares options', () => {
    const options = [
      'BOOLEAN',
      'CHANNEL',
      'INTEGER',
      'MENTIONABLE',
      'NUMBER',
      'ROLE',
      'STRING',
      'SUB_COMMAND',
      'SUB_COMMAND_GROUP',
      'USER',
    ] as chooks.CommandOption['type'][];
    const [command] = chooks.prepareCommands([
      {
        options: options.map(option => ({ type: option })),
      } as never,
    ]);

    for (let i = 0, n = options.length; i < n; i++) {
      const type = options[i];
      const option = command.options![i];
      expect(option.type).toBe(chooks.CommandOptionType[type]);
    }
  });
});
