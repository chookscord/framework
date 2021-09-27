import { Response, default as fetch } from 'node-fetch';
import type { DiscordCommand } from '@chookscord/types';

export function register(
  route: string,
  token: string,
  interactions: DiscordCommand[],
): Promise<Response> {
  return fetch(route, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${token}`,
    },
    body: JSON.stringify(interactions),
  });
}
