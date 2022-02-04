/* eslint-disable
@typescript-eslint/no-unsafe-assignment,
@typescript-eslint/consistent-type-imports,
@typescript-eslint/no-require-imports,
@typescript-eslint/no-var-requires */

function resolveLocal<T>(id: string): T {
  try {
    return <T>require(id)
  } catch {
    const resolved = require.resolve(id, { paths: [process.cwd()] })
    return <T>require(resolved)
  }
}

const internals = resolveLocal<typeof import('chooksie/internals')>('chooksie/internals')
export = internals
