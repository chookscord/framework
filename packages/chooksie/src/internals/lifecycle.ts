import { LifecycleEvents } from '../types.js'

function hasLifecycle(ns: unknown): ns is Required<LifecycleEvents> {
  return ns !== null && typeof ns === 'object' && typeof (ns as LifecycleEvents).chooksOnLoad === 'function'
}

export default hasLifecycle
