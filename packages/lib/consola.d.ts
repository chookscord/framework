// @Choooks22: Don't delete this again bruh consola has wrong types
// Issue: https://github.com/unjs/consola/issues/89
import { Consola } from 'consola';

declare module 'consola' {
  export = new Consola();
}
