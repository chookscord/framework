import * as lib from '../../packages/lib/dist';
import type * as types from '../../packages/types';
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
  } as never);
}

describe('resolving command handlers', () => {
  const store = new lib.Store<types.ChooksCommand>();

  afterEach(() => {
    store.clear();
  });

  it('resolves slash commands', () => {
    store.set(slashCommand.name, slashCommand);
    const interaction = createInteraction(slashCommand.name);
    const command = lib.resolveCommand(store, interaction);
    expect(command).toBe(slashCommand);
  });

  it('resolves subcommands', () => {
    store.set(`${subCommand.name} ${subCommandOption.name}`, subCommand);
    const interaction = createInteraction(subCommand.name, [
      {
        name: subCommandOption.name,
        type: 1,
      },
    ]);

    const command = lib.resolveCommand(store, interaction);
    expect(command).toBe(subCommand);
  });

  it('resolved grouped subcommands', () => {
    store.set(`${subCommand.name} ${groupOption.name} ${subCommandOption.name}`, subCommand);
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

    const command = lib.resolveCommand(store, interaction);
    expect(command).toBe(subCommand);
  });
});
