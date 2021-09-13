import type { Client, CommandInteraction } from 'discord.js';
import type { Consola } from 'consola';
import type { FetchUtil } from '@chookscord/lib';

declare module '@chookscord/types' {
  interface ChooksSlashCommandContext {
    client: Client<true>;
    logger: Consola;
    fetch: FetchUtil;
    interaction: CommandInteraction;
  }
}
