import * as lib from '@chookscord/lib';

export const validators = {
  commands: lib.validateSlashCommand,
  subcommands: lib.validateSubCommand,
  contexts: lib.validateContextCommand,
} as const;
