import * as types from '@chookscord/types';

function condAppend<T, K extends keyof T>(
  object: T,
  key: K,
  value?: T[K],
): T {
  return value === undefined
    ? object
    : { ...object, [key]: value };
}

export function transformOption(
  option: types.ChooksCommandOption,
): types.DiscordCommandOption {
  let res = {} as types.DiscordCommandOption;
  res = condAppend(
    res,
    'type',
    types.DiscordCommandOptionType[option.type],
  );
  res = condAppend(
    res,
    'name',
    option.name,
  );
  res = condAppend(
    res,
    'description',
    option.description,
  );
  res = condAppend(
    res,
    'required',
    res.required,
  );
  res = condAppend(
    res,
    'choices',
    option.choices,
  );
  res = condAppend(
    res,
    'options',
    option.options?.map(transformOption),
  );
  return res;
}

export function transformCommand(
  command: types.ChooksCommand,
): types.DiscordCommand {
  let res = {} as types.DiscordCommand;
  res = condAppend(
    res,
    'type',
    command.type && types.DiscordCommandType[command.type],
  );
  res = condAppend(
    res,
    'name',
    command.name,
  );
  res = condAppend(
    res,
    'description',
    command.description,
  );
  res = condAppend(
    res,
    'options',
    command.options?.map(transformOption),
  );
  res = condAppend(
    res,
    'default_permission',
    res.default_permission,
  );
  return res;
}

export function transformCommandList(
  commands: Iterable<types.ChooksCommand>,
): types.DiscordCommand[] {
  const transformed: types.DiscordCommand[] = [];

  for (const command of commands) {
    const appCommand = transformCommand(command);
    transformed.push(appCommand);
  }

  return transformed;
}
