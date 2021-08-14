/* eslint-disable complexity */
import { Command, TextCommand } from '../../types';

export interface CommandStore {
  get: <Type extends 'slash' | 'text'>(
    type: Type,
    name: string
  ) => (
    Type extends 'slash' ? Command | null :
    Type extends 'text' ? TextCommand | null :
    never
  );
  set: (command: Command | TextCommand) => void;
  getAll: <Type extends 'slash' | 'text'>(
    type: Type
  ) => IterableIterator<(
    Type extends 'slash' ? Command :
    Type extends 'text' ? TextCommand :
    never
  )>;
  remove: (
    type: 'slash' | 'text',
    commandName: string
  ) => void;
  clear: () => void;
}

export function createCommandStore(): CommandStore {
  console.debug('[Command Store]: Command Store created');
  const slashStore = new Map<string, Command>();
  const textStore = new Map<string, TextCommand>();

  // Interface and logic is correct, but return type can't be inferred
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const get: CommandStore['get'] = (type, name): any => {
    switch (type) {
      case 'slash': return slashStore.get(name) ?? null;
      case 'text': return textStore.get(name) ?? null;
      default: throw new TypeError('type must be either "slash" or "text"!');
    }
  };

  const setSlashCommand = (store: Map<string, Command>, command: Command) => {
    const commandName = command.name.toLowerCase();
    if (store.has(commandName)) {
      console.warn(`[Command Store]: Command "${command.name}" already exists!`);
      return;
    }
    store.set(commandName, command);
    console.info(`[Command Store]: Command "${command.name}" has been set!`);
  };

  const isTextCommand = (command: Command | TextCommand): command is TextCommand => {
    return 'text' in command && command.text;
  };

  const setTextCommand = (store: Map<string, TextCommand>, command: TextCommand) => {
    const commandName = command.name.toLowerCase();
    if (store.has(commandName)) {
      console.warn(`[Command Store]: Text command "${command.name}" already exists!`);
      return;
    }
    store.set(commandName, command);
    console.info(`[Command Store]: Text command "${command.name}" has been set!`);

    if (!('aliases' in command)) {
      return;
    }

    if (
      !Array.isArray(command.aliases) ||
      command.aliases.some(alias => typeof alias !== 'string')
    ) {
      console.warn(`[Command Store]: Command aliases for "${command.name}" must be an array of strings!`);
      return;
    }

    for (const alias of command.aliases) {
      const aliasName = alias.toLowerCase();
      store.set(aliasName, command);
    }

    console.info(`[Command Store]: ${command.aliases} set for "${command.name}"`);
  };

  const set: CommandStore['set'] = command => {
    if (isTextCommand(command)) {
      setTextCommand(textStore, command);
    } else {
      setSlashCommand(slashStore, command);
    }
  };

  const remove: CommandStore['remove'] = (type, commandName) => {
    const command = get(type, commandName);
    if (!command) {
      console.warn('[Command Store]: Command not found!');
      return;
    }

    const store = type === 'slash'
      ? slashStore
      : textStore;

    store.delete(command.name.toLowerCase());

    if (isTextCommand(command) && Array.isArray(command.aliases)) {
      for (const alias of command.aliases) {
        const aliasName = alias.toLowerCase();
        store.delete(aliasName);
      }
    }
  };

  const clear: CommandStore['clear'] = () => {
    textStore.clear();
    slashStore.clear();
    console.info('[Command Store]: Command Store cleared.');
  };

  // Interface and logic is correct, but return type can't be inferred
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getAll: CommandStore['getAll'] = (type): any => {
    switch (type) {
      case 'slash': return slashStore.values();
      case 'text': return textStore.values();
      default: throw new TypeError('type must be either "slash" or "text"!');
    }
  };

  return {
    get,
    set,
    clear,
    remove,
    getAll,
  };
}
