/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars */
declare namespace NodeJS {
  export interface ProcessEnv {
    CHOOKSCORD_VERSION: string;
    NODE_ENV: 'production' | 'development';
    MODULE_TYPE: 'module' | 'commonjs';
  }
}
