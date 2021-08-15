import type { BotCredentials, SlashCommand } from '../..';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

export interface InteractionRegister {
  register: (commands: SlashCommand[]) => Promise<void>;
  unregister: () => Promise<void>;
}

export function createInteractionRegister(
  credentials: BotCredentials,
  guild?: string,
): InteractionRegister {
  console.debug('[Interaction Register]: Interaction Register created.');
  const rest = new REST({ version: '9' }).setToken(credentials.token);
  const route = guild
    ? Routes.applicationGuildCommands(credentials.applicationId, guild)
    : Routes.applicationCommands(credentials.applicationId);

  const setCommands = async (commands: SlashCommand[]) => {
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
