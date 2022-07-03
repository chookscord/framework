export {}
declare module 'node:events' {
  class EventEmitter {
    public static on<T>(
      emitter: NodeJS.EventEmitter,
      eventName: string | symbol,
    ): AsyncIterableIterator<T>
  }
}
