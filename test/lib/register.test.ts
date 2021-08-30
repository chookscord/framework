/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any */
import * as chooks from '@chookscord/lib';

describe('interactions register', () => {
  const _store = new chooks.CommandStore();
  const register = chooks.createInteractionRegister({
    applicationId: '',
    token: '',
  });

  afterEach(() => {
    _store.clear();
  });

  test('it prepares slash commands', () => {
    const store = _store as chooks.CommandStore<chooks.BaseSlashCommand>;
    store.set('foo', {
      name: 'foo',
      description: 'foo',
      execute() { /*  */ },
    });
    store.set('bar', {
      name: 'bar',
      description: 'bar',
      execute() { /*  */ },
    });

    const commands = chooks.prepareCommands(store.getAll());

    expect(commands).toBeInstanceOf(Array);
    expect(commands.length).toBe(2);

    for (const command of commands) {
      expect((command as any).execute).toBeUndefined();
    }
  });

  test('it prepares subcommands', () => {
    const store = _store as chooks.CommandStore<chooks.SlashSubCommand>;
    store.set('foo', {
      name: 'foo',
      description: 'foo',
      options: [
        {
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND',
          execute() { /*  */ },
        },
      ],
    });

    const [command] = chooks.prepareCommands(store.getAll());
    const [option] = command.options!;

    expect(option.type).toBe(chooks.CommandOptionType.SUB_COMMAND);
    expect((option as any).execute).toBeUndefined();
  });

  test('it prepares subcommand groups', () => {
    const store = _store as chooks.CommandStore<chooks.SlashSubCommandGroup>;
    store.set('foo', {
      name: 'foo',
      description: 'foo',
      options: [
        {
          name: 'foo',
          description: 'foo',
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'foo',
              description: 'foo',
              type: 'SUB_COMMAND',
              execute() { /*  */ },
            },
          ],
        },
      ],
    });

    const [command] = chooks.prepareCommands(store.getAll());
    const [option] = command.options!;
    const [subCommand] = option.options!;

    expect(option.type).toBe(chooks.CommandOptionType.SUB_COMMAND_GROUP);
    expect(subCommand.type).toBe(chooks.CommandOptionType.SUB_COMMAND);
    expect((subCommand as any).execute).toBeUndefined();
  });

  test.todo('it prepares user commands');
  test.todo('it prepares message commands');
});
