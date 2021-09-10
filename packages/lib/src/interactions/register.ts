import * as routes from './_routes';
import type * as types from '../';
import { RateLimitError, getError } from './_error';
import type { DiscordCommand } from '@chookscord/types';
import { registerCommands } from './_register';

export type GetCooldown = (now: number) => number | null;
export type RegisterInteraction = (
  commands: DiscordCommand[],
  cooldown?: GetCooldown,
) => Promise<GetCooldown | null>;

export interface InteractionRegisterConfig {
  token: string;
  applicationId: string;
  guildId?: string;
}

export function createInteractionRegister(
  config: InteractionRegisterConfig,
  options: Partial<types.Logger> = {},
): RegisterInteraction {
  options.logger?.debug('Interaction Register created.');
  const route = config.guildId
    ? routes.guild(config.applicationId, config.guildId)
    : routes.global(config.applicationId);

  const register = (commands: DiscordCommand[]) => registerCommands({
    route,
    token: config.token,
    commands,
  });

  return async (
    commands,
    onCooldown = () => null,
  ) => {
    if (onCooldown(Date.now())) {
      return onCooldown;
    }

    options.logger?.info(`Registering ${commands.length} commands...`);
    options.logger?.debug('Route:', route);
    const response = await register(commands);

    if (response.ok) {
      options.logger?.info(`${commands.length} commands successfully registered.`);
      return null;
    }

    const error = await getError(response);
    if (response.status === 429) {
      const retryAfter = (error as RateLimitError).retry_after;
      options.logger?.error(new Error(`You are being rate limited! Retry after: ${retryAfter}s.`));
      return now => retryAfter * 1000 - now;
    }

    options.logger?.error(new Error(`Failed to register interactions!\n${error}`));
    return null;
  };
}
