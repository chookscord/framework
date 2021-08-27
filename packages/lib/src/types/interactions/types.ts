export enum CommandType {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3,
}

export enum CommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP,
  STRING,
  INTEGER,
  BOOLEAN,
  USER,
  CHANNEL,
  ROLE,
  MENTIONABLE,
  NUMBER,
}
