/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { Awaitable } from 'discord.js';
import type { ChooksContext } from './chooks';

export type ChooksTeardown = () => unknown;
export type ChooksLifecycle = (ctx: ChooksContext) => Awaitable<void | ChooksTeardown>;
