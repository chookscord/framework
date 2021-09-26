export type DefaultExport<T> = { default: T };

export type UnwrapPromise<T> = T extends Promise<infer U>
  ? U
  : T;

export type FlattenPromise<T> = T extends Promise<infer U>
  ? FlattenPromise<U>
  : Promise<T>;
