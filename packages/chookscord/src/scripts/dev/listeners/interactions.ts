/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as lib from '@chookscord/lib';
import * as tools from '../../../tools';
import type { Client } from 'discord.js';
import type { CommandModule } from '../../../types';
import type { Consola } from 'consola';
import { resolveInteractionKey } from '../../../utils';

export function attachInteractionListener(
  client: Client,
  store: lib.Store<CommandModule>,
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
    const deps = await mod.target.dependencies?.call(undefined) ?? {};
    const execute = mod.target.execute!.bind(deps, ctx);

    tools.executeCommand(commandName, execute);
  });
}
