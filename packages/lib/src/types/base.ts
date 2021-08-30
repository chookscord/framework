import type { Client } from 'discord.js';

export interface BaseContext {
  client: Client<true>;
}

export interface BaseCommand {
  name: string;
  description: string;
}
