import type {
  Command,
  Config,
  Event,
  EventName,
  TextCommand,
} from './types';

export function defineConfig(config: Config): Config {
  return config;
}

export function defineCommand(command: Command): Command {
  return command;
}

export function defineTextCommand(command: TextCommand): TextCommand {
  return command;
}

export function defineEvent<T extends EventName>(event: Event<T>): Event<T> {
  return event;
}
