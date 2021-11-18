import { validateContextCommand, validateSlashCommand, validateSlashSubCommand } from '../../lib/validation/commands';

export const validators = {
  commands: validateSlashCommand,
  subcommands: validateSlashSubCommand,
  contexts: validateContextCommand,
};
