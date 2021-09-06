import * as lib from '..';

function condAppend<T, K extends keyof T>(
  object: T,
  key: K,
  value: T[K] | undefined,
): T {
  return value === undefined
    ? object
    : { ...object, [key]: value };
}

function prepareOption(option: lib.CommandOption & { choices?: (lib.CommandChoice)[] }): lib.ApplicationOption {
  const subOptions = (option as lib.SubCommandOption).options;
  let appOption = {} as lib.ApplicationOption;

  appOption = condAppend(appOption, 'name', option.name);
  appOption = condAppend(appOption, 'description', option.description);
  appOption = condAppend(appOption, 'type', lib.CommandOptionType[option.type]);
  appOption = condAppend(appOption, 'choices', option.choices);
  appOption = condAppend(appOption, 'required', option.required);
  appOption = condAppend(appOption, 'options', subOptions?.length
    ? subOptions.map(prepareOption)
    : undefined);

  return appOption;
}

function prepareCommand(command: lib.SlashCommand): lib.ApplicationSlashCommand {
  let appCommand = {
    type: lib.CommandType.CHAT_INPUT,
  } as lib.ApplicationSlashCommand;

  appCommand = condAppend(appCommand, 'name', command.name);
  appCommand = condAppend(appCommand, 'description', command.description);
  appCommand = condAppend(appCommand, 'options', command.options?.length
    ? command.options.map(prepareOption)
    : undefined);

  return appCommand;
}

export function prepareCommands(
  commands: Iterable<lib.SlashCommand>,
  options: Partial<lib.Logger> = {},
): lib.BaseApplicationCommand[] {
  options.logger?.info('Preparing commands...');
  let counter = 0;
  const preparedCommands: lib.ApplicationSlashCommand[] = [];
  for (const command of commands) {
    const appCommand = prepareCommand(command);
    preparedCommands.push(appCommand);
    options.logger?.debug(`Prepared ${++counter} commands.`);
  }
  options.logger?.info(`${counter} commands prepared.`);
  return preparedCommands;
}
