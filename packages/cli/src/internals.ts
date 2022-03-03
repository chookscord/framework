import resolveLocal from './lib/resolve'

const internals = resolveLocal<typeof import('chooksie/internals')>('chooksie/internals')
export = internals
