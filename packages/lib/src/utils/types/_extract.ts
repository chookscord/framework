export type ExtractSet<T> = T extends Set<infer U> ? U : never;
export type ExtractArgs<T> = T extends (...a: infer A) => unknown ? A: never;
