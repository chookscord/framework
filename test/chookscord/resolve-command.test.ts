import * as lib from '../../packages/lib';
import type * as types from '../../packages/types';
import * as utils from '../../packages/chookscord/src/utils';
import { Client, CommandInteraction } from 'discord.js';

// Hack because I don't wanna deal with discord.js' private interfaces.
interface Option {
  name: string;
  type: 1 | 2;
  options?: Option[];
}

const client = new Client({ intents: [] });

const subCommandOption: types.ChooksSubCommandOption = {
  name: 'qux',
  description: 'qux',
  type: 'SUB_COMMAND',
  execute() {},
};

const groupOption: types.ChooksGroupCommandOption = {
  name: 'bar',
  description: 'bar',
  type: 'SUB_COMMAND_GROUP',
  options: [subCommandOption],
};

const slashCommand: types.ChooksSlashCommand = {
  name: 'foo',
  description: 'foo',
  execute() {},
};

const subCommand: types.ChooksSubCommand = {
  name: 'foo',
  description: 'foo',
  options: [
    groupOption,
    subCommandOption,
  ],
};

function createInteraction(name: string, options: Option[] = []) {
  return new CommandInteraction(client, {
    user: {},
    data: {
      name,
      options,
    },
    type: 2, // https://github.com/discordjs/discord.js/blob/0266f280960729b27bf65ba0ee7b7bd8659f304d/src/util/Constants.js#L945
  } as never);
}

describe('resolving command handlers', () => {
  const store = new lib.Store<types.ChooksCommand>();

  afterEach(() => {
    store.clear();
  });

  it('resolves slash commands', () => {
    const key = utils.createCommandKey(slashCommand.name);
    store.set(key, slashCommand);
    const interaction = createInteraction(slashCommand.name);
    const command = utils.resolveCommand(store, interaction);
    expect(command).toBe(slashCommand);
  });

  it('resolves subcommands', () => {
    const key = utils.createCommandKey(
      subCommand.name,
      subCommandOption.name,
    );

    store.set(key, subCommand);
    const interaction = createInteraction(subCommand.name, [
      {
        name: subCommandOption.name,
        type: 1,
      },
    ]);

    const command = utils.resolveCommand(store, interaction);
    expect(command).toBe(subCommand);
  });

  it('resolves grouped subcommands', () => {
    const key = utils.createCommandKey(
      subCommand.name,
      groupOption.name,
      subCommandOption.name,
    );
    store.set(key, subCommand);

    const interaction = createInteraction(subCommand.name, [
      {
        name: groupOption.name,
        type: 2,
        options: [
          {
            name: subCommandOption.name,
            type: 1,
          },
        ],
      },
    ]);

    const command = utils.resolveCommand(store, interaction);
    expect(command).toBe(subCommand);
  });
});
