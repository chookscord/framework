/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars */
declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development';
  }
}
