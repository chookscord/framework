import * as chooks from '@chookscord/lib';
import type { ExtractArgs } from '@chookscord/lib/src/utils/types/_extract';

describe('command store', () => {
  const store = new chooks.CommandStore<chooks.SlashCommand>();

  const command1 = {
    name: 'foo',
    description: 'foo',
    execute() { /*  */ },
  } as chooks.BaseSlashCommand;

  const command2 = {
    name: 'bar',
    description: 'bar',
    execute() { /*  */ },
  } as chooks.BaseSlashCommand;

  it('should get and set', () => {
    expect(store.size).toBe(0);
    store.set(command1.name, command1);
    const command = store.get(command1.name);

    expect(command).toBe(command1);
    expect(store.size).toBe(1);
  });

  it('should emit on set', () => {
    type Listener = ExtractArgs<chooks.CommandSetListener>;
    const listener = jest.fn<unknown, Listener>((command, oldCommand) => {
      if (command.name === 'foo') {
        expect(command).toBe(command1);
        expect(oldCommand).not.toBeNull();
      } else if (command.name === 'bar') {
        expect(command).toBe(command2);
        expect(oldCommand).toBeNull();
      }
    });

    store.addEventListener('set', listener);
    expect(store.size).toBe(1);

    store.set(command1.name, command1);
    store.set(command2.name, command2);
    store.removeEventListener('set', listener);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(store.size).toBe(2);
  });

  it('should emit on delete', () => {
    type Listener = ExtractArgs<chooks.CommandRemoveListener>;
    const listener = jest.fn<unknown, Listener>(oldCommand => {
      if (oldCommand.name === 'foo') {
        expect(oldCommand).toBe(command1);
      } else if (oldCommand.name === 'bar') {
        expect(oldCommand).toBe(command2);
      }
    });

    store.addEventListener('remove', listener);
    expect(store.size).toBe(2);

    store.delete(command1.name);
    store.delete(command2.name);
    store.removeEventListener('remove', listener);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(store.size).toBe(0);
  });

  it('should not count aliases', () => {
    expect(store.size).toBe(0);
    store.set('foo', command1);
    store.set('bar', command1);
    expect(store.size).toBe(1);
  });
});
