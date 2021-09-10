export interface ChooksUserCommand {
  type: 'USER';
  execute(ctx: ChooksUserCommandContext): unknown;
}

export interface ChooksMessageCommand {
  type: 'MESSAGE';
  execute(ctx: ChooksMessageCommandContext): unknown;
}

export interface ChooksUserCommandContext {
}

export interface ChooksMessageCommandContext {
}
