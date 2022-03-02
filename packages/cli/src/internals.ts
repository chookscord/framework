import { resolveLocal } from './lib'

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const internals = resolveLocal<typeof import('chooksie/internals')>('chooksie/internals')
export = internals
