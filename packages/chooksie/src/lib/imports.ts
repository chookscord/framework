// @Choooks22: This is recursive because dynamic imports
// add another "default" export when import commonjs files
export function getDefaultImport<T>(data: T | { default: T }): T {
  return data !== null && typeof data === 'object' && 'default' in data
    ? getDefaultImport(data.default)
    : data;
}
