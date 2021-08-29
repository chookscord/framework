import { join } from 'path';

export const appendPath = {
  fromRoot(...paths: string[]): string {
    return join(process.cwd(), ...paths);
  },
  fromOut(...paths: string[]): string {
    return this.fromRoot('.chooks', ...paths);
  },
} as const;
