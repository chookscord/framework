import type { BaseSlashCommand, SlashSubCommand, SlashSubCommandGroup } from './slash-command';
import type { TextCommand } from './text-command';

export * from './slash-command';
export * from './text-command';

export type SlashCommand = BaseSlashCommand | SlashSubCommand | SlashSubCommandGroup;
export type Command = SlashCommand | TextCommand;
