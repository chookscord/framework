/* eslint-disable object-curly-newline */
import { ChooksCommand, ChooksOption, DiscordCommandType, DiscordOption, DiscordSlashCommand } from 'chooksie/types';
import { types } from '../lib';

function condAppend<T, K extends keyof T>(
  object: T,
  key: K,
  value?: T[K],
): T {
  return value === undefined
    ? object
    : { ...object, [key]: value };
}

export function transformOption(option: ChooksOption): DiscordOption {
  let res = {} as DiscordOption;
  res = condAppend(res, 'type', types.DiscordOptionType[option.type]);
  res = condAppend(res, 'name', option.name);
  res = condAppend(res, 'description', option.description);
  res = condAppend(res, 'required', option.required);
  res = condAppend(res, 'choices', option.choices);
  res = condAppend(res, 'options', option.options?.map(transformOption));
  return res;
}

export function transformCommand(command: ChooksCommand): DiscordSlashCommand {
  let res = {} as DiscordSlashCommand;
  res = condAppend(res, 'name', command.name);
  res = condAppend(res, 'description', command.description);
  res = condAppend(res, 'default_permission', command.defaultPermission);
  res = condAppend(res, 'type', command.type && DiscordCommandType[command.type]);
  res = condAppend(res, 'options', command.options?.map(transformOption));
  return res;
}

export function transformCommandList(
  commands: Iterable<ChooksCommand>,
): DiscordSlashCommand[] {
  const transformed: DiscordSlashCommand[] = [];
  for (const command of commands) {
    transformed.push(transformCommand(command));
  }
  return transformed;
}
