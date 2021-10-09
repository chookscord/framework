import type { Client, CommandInteraction, ContextMenuInteraction } from 'discord.js';
import type { Consola } from 'consola';
import type { FetchUtil } from '@chookscord/lib';

declare module '@chookscord/types' {
  interface ChooksContext {
    client: Client<true>;
    logger: Consola;
    fetch: FetchUtil;
  }

  interface ChooksCommandContext extends ChooksContext {
    interaction: CommandInteraction;
  }

  interface ChooksContextCommandContext extends ChooksContext {
    interaction: ContextMenuInteraction;
  }
}
