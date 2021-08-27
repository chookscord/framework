import type { Awaited, CommandInteraction } from 'discord.js';
import type { BaseCommand, BaseContext } from '../base';
import type { NonCommandOption, SubCommandGroupOption, SubCommandOption } from '../interactions/options';

export interface SlashCommandContext extends BaseContext {
  interaction: CommandInteraction;
}

export interface BaseSlashCommand extends BaseCommand {
  execute: (ctx: SlashCommandContext) => Awaited<unknown>;
  options?: NonCommandOption[];
}

export interface SlashSubCommand extends BaseCommand {
  options: (SubCommandOption & BaseSlashCommand)[];
}

export interface SlashSubCommandGroup extends BaseCommand {
  options: (SubCommandGroupOption & SlashSubCommand)[];
}
