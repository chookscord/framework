export const enum ExitCode {
  InvalidCommand = 64,
  MissingFile = 72,
  BuildFail = 73,
  Validation = 78,
}

export class ValidationError extends Error {
  constructor(message?: string) {
    super(message);
    super.name = 'ValidationError';
  }
}
