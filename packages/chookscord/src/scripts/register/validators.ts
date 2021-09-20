import * as lib from '@chookscord/lib';

export const validators = {
  commands: lib.validateSlashCommand,
  subcommands: lib.validateSubCommand,
} as const;