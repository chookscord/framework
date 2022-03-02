/* eslint-disable
  @typescript-eslint/no-var-requires,
  @typescript-eslint/no-require-imports
*/
function resolveLocal<T>(id: string): T {
  try {
    return <T>require(id)
  } catch {
    const resolved = require.resolve(id, { paths: [process.cwd()] })
    return <T>require(resolved)
  }
}

export default resolveLocal
