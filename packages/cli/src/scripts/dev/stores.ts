import { CommandModule, EventModule } from './loaders';
import { ChooksTeardown } from 'chooksie/types';
import { Store } from 'chooksie/lib';

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
    commands: new Store(),
    events: new Store(),
    lifecycles: new Store(),
  };
}
