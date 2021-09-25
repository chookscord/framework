import * as lib from '@chookscord/lib';

export const validators = {
  commands: lib.validateSlashCommand,
  subcommands: lib.validateSubCommand,
  messages: lib.validateMessageCommand,
  users: lib.validateUserCommand,
} as const;
