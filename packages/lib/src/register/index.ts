import * as responses from './responses';
import * as routes from './routes';
import type * as types from './types';
import type { DiscordCommand } from '@chookscord/types';
import { register } from './register';

export type { RegisterCooldown, RegisterResponse } from './types';

export type InteractionRegister = (interactions: DiscordCommand[]) => Promise<types.RegisterResponse>;
export interface RegisterConfig {
  token: string;
  applicationId: string;
  guildId?: string;
}

export function createRegister(config: RegisterConfig): InteractionRegister {
  const route = config.guildId
    ? routes.guild(config.applicationId, config.guildId)
    : routes.global(config.applicationId);

  return async interactions => {
    const response = await register(route, config.token, interactions);

    if (response.ok) {
      return responses.ok();
    }

    let timestamp = Date.now();
    const error = await response.json();

    if (response.status === 429) {
      timestamp += (error as types.RateLimitError).retry_after * 1000;
      return responses.rateLimit(timestamp);
    }

    return responses.invalid((error as types.ErrorResponse).errors);
  };
}
