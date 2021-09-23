import * as lib from '..';
import {
  ChooksCommand,
  ChooksCommandOption,
  DiscordCommand, DiscordCommandOption, DiscordCommandOptionType, DiscordCommandType,
} from '@chookscord/types';

function condAppend<T, K extends keyof T>(
  object: T,
  key: K,
  value: T[K] | undefined,
): T {
  return value === undefined
    ? object
    : { ...object, [key]: value };
}

function prepareOption(option: ChooksCommandOption): DiscordCommandOption {
  let appOption = {} as DiscordCommandOption;

  appOption = condAppend(appOption, 'name', option.name);
  appOption = condAppend(appOption, 'description', option.description);
  appOption = condAppend(appOption, 'type', DiscordCommandOptionType[option.type]);
  appOption = condAppend(appOption, 'choices', option.choices);
  appOption = condAppend(appOption, 'required', option.required);
  appOption = condAppend(appOption, 'options', option.options?.length
    ? option.options.map(prepareOption)
    : undefined);

  return appOption;
}

function prepareCommand(command: ChooksCommand): DiscordCommand {
  let appCommand = { type: DiscordCommandType.CHAT_INPUT } as DiscordCommand;

  appCommand = condAppend(appCommand, 'name', command.name);
  appCommand = condAppend(appCommand, 'description', command.description);
  appCommand = condAppend(appCommand, 'options', command.options?.length
    ? command.options.map(prepareOption)
    : undefined);

  return appCommand;
}

export function prepareCommands(
  commands: Iterable<ChooksCommand>,
  options: Partial<lib.Logger> = {},
): DiscordCommand[] {
  options.logger?.info('Preparing commands...');
  let counter = 0;
  const preparedCommands: DiscordCommand[] = [];
  for (const command of commands) {
    const appCommand = prepareCommand(command);
    preparedCommands.push(appCommand);
    options.logger?.debug(`Prepared ${++counter} commands.`);
  }
  options.logger?.info(`${counter} commands prepared.`);
  return preparedCommands;
}
