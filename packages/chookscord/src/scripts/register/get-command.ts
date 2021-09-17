import * as lib from '@chookscord/lib';
import * as utils from '../../utils';
import type { ChooksCommand } from '@chookscord/types';
import { basename } from 'path';
import { validators } from './validators';

function isCommandInvalid(
  command: ChooksCommand,
  validator: (command: ChooksCommand) => string | null,
  options: Partial<lib.Logger> = {},
): boolean {
  const validationError = validator(command);
  if (validationError) {
    options?.logger?.error(new Error(validationError));
  }
  return Boolean(validationError);
}

export async function getCommands(
  this: Partial<lib.Logger>,
  path: string,
): Promise<ChooksCommand[]> {
  const moduleName = basename(path) as keyof typeof validators;
  const validator = validators[moduleName];
  const commands: ChooksCommand[] = [];

  const files = lib.loadDir(
    utils.appendPath.fromOut(moduleName),
    { recursive: true },
  );

  for await (const file of files) {
    if (file.isDirectory) continue;
    const command = await utils.importDefault<ChooksCommand>(file.path);

    if (isCommandInvalid(command, validator, this)) continue;

    commands.push(command);
  }

  return commands;
}
