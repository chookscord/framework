import * as lib from '@chookscord/lib';

export const validators = {
  commands: lib.validateSlashCommand,
  subcommands: lib.validateSubCommand,
  messages: lib.validateContextCommand,
  users: lib.validateContextCommand,
} as const;
