import { Client, ClientApplication } from 'discord.js';
import { Command, EventContext } from '../../types';

export interface InteractionRegister {
  set: (command: Command[]) => void;
  clear: () => void;
}

export function createInteractionRegister(
  ctx: EventContext,
): InteractionRegister {
  console.debug('[Interaction Register]: Interaction Register created.');
  const application = new ClientApplication(ctx.client, {});
  ctx.client.application = application;

  const set: InteractionRegister['set'] = commands => {
    const setCommands = () => {
      application.commands.set(commands);
    };

    if (!ctx.client.isReady()) {
      setCommands();
    } else {
      (ctx.client as Client).once('ready', setCommands);
    }
  };

  const clear: InteractionRegister['clear'] = () => {
    application.commands.set([]);
    console.info('[Interaction Register]: Interactions cleared.');
  };

  return {
    set,
    clear,
  };
}
