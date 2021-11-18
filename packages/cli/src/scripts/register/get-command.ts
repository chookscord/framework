import { basename, join } from 'path';
import { getDefaultImport, traverse } from 'chooksie/lib';
import type { ChooksCommand } from 'chooksie/types';
import type { ChooksLogger } from '@chookscord/logger';
import type { ValidationResult } from '../../lib/validation/tests';
import { validators } from './validators';

function isCommandInvalid(
  command: ChooksCommand,
  validator: (command: ChooksCommand) => string | null,
  logger?: ChooksLogger,
): boolean {
  const validationError = validator(command);
  if (validationError) {
    logger?.error(new Error(validationError));
  }
  return Boolean(validationError);
}

export async function getCommands(
  this: ChooksLogger,
  path: string,
): Promise<ChooksCommand[]> {
  const moduleName = basename(path) as keyof typeof validators;
  const validator = validators[moduleName] as (command: ChooksCommand) => ValidationResult;
  const commands: ChooksCommand[] = [];

  const modulePath = join(process.cwd(), '.chooks', moduleName);
  const files = traverse(modulePath, { recursive: true });

  for await (const file of files) {
    if (file.isDir) continue;
    const command = getDefaultImport(await import(file.path) as ChooksCommand);

    if (!isCommandInvalid(command, validator, this)) {
      commands.push(command);
    }
  }

  return commands;
}
