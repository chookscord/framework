import { WrappedRequest, fetch } from '@chookscord/fetch';
import type { DiscordSlashCommand } from 'chooksie/types';

export function register(
  route: string,
  token: string,
  interactions: DiscordSlashCommand[],
): WrappedRequest {
  return fetch(route, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bot ${token}`,
    },
    body: JSON.stringify(interactions),
  });
}
