import type { Client, CommandInteraction, ContextMenuInteraction } from 'discord.js';
import type { Consola } from 'consola';
import type { FetchUtil } from '@chookscord/lib';

declare module '@chookscord/types' {
  interface ChooksCommandContext {
    client: Client<true>;
    logger: Consola;
    fetch: FetchUtil;
    interaction: CommandInteraction;
  }

  interface ChooksMessageCommandContext {
    client: Client<true>;
    logger: Consola;
    fetch: FetchUtil;
    interaction: ContextMenuInteraction;
  }

  interface ChooksUserCommandContext {
    client: Client<true>;
    logger: Consola;
    fetch: FetchUtil;
    interaction: ContextMenuInteraction;
  }
}
