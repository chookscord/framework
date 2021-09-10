import { Response, default as fetch } from 'node-fetch';
import { DiscordCommand } from '@chookscord/types';

interface RegisterConfig {
  route: string;
  token: string;
  commands: DiscordCommand[];
}

export function registerCommands(
  options: RegisterConfig,
): Promise<Response> {
  return fetch(options.route, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${options.token}`,
    },
    body: JSON.stringify(options.commands),
  });
}
