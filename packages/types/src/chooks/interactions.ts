export interface ChooksUserCommand {
  name: string;
  type: 'USER';
  execute(ctx: ChooksUserCommandContext): unknown;
}

export interface ChooksMessageCommand {
  name: string;
  type: 'MESSAGE';
  execute(ctx: ChooksMessageCommandContext): unknown;
}

export interface ChooksUserCommandContext {
}

export interface ChooksMessageCommandContext {
}
