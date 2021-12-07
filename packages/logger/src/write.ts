import { __PREFIX, isPrefix } from './utils';
import { EOL } from 'os';
import { formatError } from './format';

export interface WriteOptions {
  out: (...args: unknown[]) => void;
  prominent?: boolean;
}

function prepareMessage(message: unknown) {
  if (message instanceof Error) return formatError(message);
  if (isPrefix(message)) return message[__PREFIX];
  return message;
}

function resize(messages: unknown[], prominent = false) {
  return prominent
    ? [EOL, ...messages, EOL]
    : messages;
}

export function write(options: WriteOptions, ...messages: unknown[]): void {
  const newMessages = messages.map(prepareMessage);
  options.out(...resize(newMessages, options.prominent));
}
