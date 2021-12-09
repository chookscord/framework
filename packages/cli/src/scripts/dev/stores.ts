import { CommandModule, EventModule } from './loaders';
import { ChooksTeardown } from 'chooksie/types';
import { Store } from 'chooksie/lib';
import { chooksie } from '../../lib';

export type CommandStore = Store<CommandModule>;
export type EventStore = Store<EventModule>;
export type LifecycleStore = Store<ChooksTeardown>;

export interface StoreList {
  commands: CommandStore;
  events: EventStore;
  lifecycles: LifecycleStore;
}

export function createStoreList(): StoreList {
  return {
    commands: new chooksie.Store(),
    events: new chooksie.Store(),
    lifecycles: new chooksie.Store(),
  };
}
