/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { Awaitable } from 'discord.js';
import type { ChooksContext } from '@chookscord/types';

export type ChooksTeardown = () => unknown;
export type ChooksLifecycle = (ctx: ChooksContext) => Awaitable<void | ChooksTeardown>;
