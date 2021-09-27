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
  client.on('interactionCreate', interaction => {
    const commandName = resolveInteractionKey(interaction);
    if (!commandName) return;

    const command = store.get(commandName);
    if (!command) {
      logger?.warn(`Command "${commandName}" was executed, but no handlers were registered.`);
      return;
    }

    const ctx = tools.getCommandCtx(client, commandName, interaction);
    const execute = command.execute.bind(command, ctx);

    tools.executeCommand(commandName, execute);
  });
}
