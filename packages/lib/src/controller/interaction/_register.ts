import type { Command } from '../..';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

export interface InteractionRegister {
  register: (commands: Command[]) => Promise<void>;
  unregister: () => Promise<void>;
}

export interface InteractionCredentials {
  token: string;
  appId: string;
}

export function createInteractionRegister(
  credentials: InteractionCredentials,
  guild?: string,
): InteractionRegister {
  console.debug('[Interaction Register]: Interaction Register created.');
  const rest = new REST({ version: '9' }).setToken(credentials.token);
  const route = guild
    ? Routes.applicationGuildCommands(credentials.appId, guild)
    : Routes.applicationCommands(credentials.appId);

  const setCommands = async (commands: Command[]) => {
    await rest.put(route, { body: commands });
  };

  return {
    async register(commands) {
      console.debug('[Interaction Register]: Registering commands...');
      await setCommands(commands);
      console.debug(`[Interaction Register]: ${commands.length} commands registered.`);
    },
    async unregister() {
      await setCommands([]);
      console.info('[Interaction Register]: Interactions cleared.');
    },
  };
}
