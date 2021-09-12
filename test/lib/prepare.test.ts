import * as types from '../../packages/types';

describe('interactions register', () => {
  it('prepares slash commands', () => {
    const [command] = chooks.prepareCommands([
      {
        name: 'foo',
        description: 'foo',
        execute() {},
      },
    ]);

    expect(command).toEqual({
      name: 'foo',
      description: 'foo',
      type: types.DiscordCommandType.CHAT_INPUT,
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
            execute() {},
          },
        ],
      } as unknown as types.ChooksSlashCommand,
    ]);

    const [option] = command.options!;
    expect(option).toStrictEqual({
      name: 'foo',
      description: 'foo',
      type: types.DiscordCommandOptionType.SUB_COMMAND,
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
    ] as types.ChooksCommandOptionType[];
      {
        options: options.map(option => ({ type: option })),
      } as never,
    ]);

    for (let i = 0, n = options.length; i < n; i++) {
      const type = options[i];
      const option = command.options![i];
      expect(option.type).toBe(types.DiscordCommandOptionType[type]);
    }
  });
});
