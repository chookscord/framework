/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Client } from 'discord.js';
import { CommandModule, Store } from 'chooksie';

export function attachInteractionListener(
  client: Client,
  store: Store<CommandModule>,
  logger?: Consola,
): void {
  client.on('interactionCreate', async interaction => {
    const commandName = resolveInteractionKey(interaction);
    if (!commandName) return;

    const mod = store.get(commandName);
    if (!mod) {
      logger?.warn(`Command "${commandName}" was executed, but no handlers were registered.`);
      return;
    }

    const ctx = tools.getCommandCtx(client, commandName, interaction);
    const deps = await mod.target.setup?.call(undefined) ?? {};
    const execute = mod.target.execute!.bind(deps, ctx);

    tools.executeCommand(commandName, execute);
  });
}
