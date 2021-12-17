import { DiscordCommandType, DiscordOptionType } from '../../../chooksie/src/types/chooks/discord';
import { transformCommand, transformOption } from '../../src/lib/transform';
import { ChooksSubCommandOption } from '../../../chooksie/src/types/chooks/options';

describe('transforming options', () => {
  it('can transform regular options', () => {
    for (const key in DiscordOptionType) {
      const option = transformOption({
        name: 'foo',
        description: 'foo',
        type: key as never,
        required: true,
        choices: [
          {
            name: 'bar',
            value: 'bar',
          },
        ],
      });

      expect(option).toStrictEqual({
        name: 'foo',
        description: 'foo',
        type: DiscordOptionType[key],
        required: true,
        choices: [
          {
            name: 'bar',
            value: 'bar',
          },
        ],
      });
    }
  });

  it('can transform subcommands', () => {
    const option = transformOption({
      name: 'foo',
      description: 'foo',
      type: 'SUB_COMMAND',
      setup() { return {} },
      execute() {},
    } as ChooksSubCommandOption);

    expect(option).toStrictEqual({
      name: 'foo',
      description: 'foo',
      type: DiscordOptionType.SUB_COMMAND,
    });
  });

  it('can transform nested options', () => {
    const option = transformOption({
      name: 'foo',
      description: 'foo',
      type: 'STRING',
      options: [
        {
          name: 'bar',
          description: 'bar',
          type: 'STRING',
        },
      ],
    });

    expect(option).toStrictEqual({
      name: 'foo',
      description: 'foo',
      type: DiscordOptionType.STRING,
      options: [
        {
          name: 'bar',
          description: 'bar',
          type: DiscordOptionType.STRING,
        },
      ],
    });
  });
});

describe('transforming commands', () => {
  it('transforms slash commands', () => {
    const command = transformCommand({
      name: 'foo',
      description: 'foo',
      defaultPermission: true,
      setup() { return {} },
      execute() {},
      options: [
        {
          name: 'bar',
          description: 'bar',
          type: 'SUB_COMMAND',
          required: true,
          setup() { return {} },
          execute() {},
        } as ChooksSubCommandOption,
      ],
    });

    expect(command).toStrictEqual({
      name: 'foo',
      description: 'foo',
      default_permission: true,
      options: [
        {
          name: 'bar',
          description: 'bar',
          type: DiscordOptionType.SUB_COMMAND,
          required: true,
        },
      ],
    });
  });

  it('transform context menus', () => {
    const contextMenu = transformCommand({
      name: 'foo',
      type: 'MESSAGE',
      setup() { return {} },
      execute() {},
    });

    expect(contextMenu).toStrictEqual({
      name: 'foo',
      type: DiscordCommandType.MESSAGE,
    });
  });
});
