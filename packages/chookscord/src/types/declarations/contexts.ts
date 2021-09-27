import type {
  Client, CommandInteraction, ContextMenuInteraction, Interaction,
} from 'discord.js';
import type { Consola } from 'consola';
import type { FetchUtil } from '@chookscord/lib';

declare module '@chookscord/types' {
  interface ChooksContext {
    client: Client<true>;
    logger: Consola;
    fetch: FetchUtil;
    interaction: Interaction;
  }

  interface ChooksCommandContext {
    interaction: CommandInteraction;
  }

  interface ChooksContextCommandContext {
    interaction: ContextMenuInteraction;
  }
}
