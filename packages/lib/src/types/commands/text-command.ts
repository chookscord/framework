import type { Awaited, Message, PermissionString } from 'discord.js';
import type { BaseCommand, BaseContext } from '../base';

export interface TextCommandContext extends BaseContext {
  message: Message;
  args: string[];
}

export interface TextCommand extends BaseCommand {
  permissions?: PermissionString[];
  execute: (ctx: TextCommandContext) => Awaited<unknown>;
}
