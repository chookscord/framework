import type { Dirent } from 'fs'
import fs from 'fs/promises'
import type { FileRef } from '../src/lib/file-refs'
import { resolveConfig } from '../src/server/resolve-config'

jest.mock('fs/promises')
;(<jest.Mock>fs.readdir).mockReturnValue(Promise.resolve([{ isFile: () => true, name: 'chooks.config.ts' }] as Dirent[]))

const targetFile: FileRef = {
  source: '/chooks.config.ts',
  target: '/out/chooks.config.js',
  type: 'config',
}

describe('config resolver', () => {
  const loader = jest.fn()
  const onChange = jest.fn()
  const onCompile = jest.fn()
  const validator = jest.fn()

  beforeEach(() => {
    loader.mockReset()
    onChange.mockReset()
    onCompile.mockReset()
    validator.mockReset()
  })

  it('can resolve config', async () => {
    const fakeCode = 'foo'
    const fakeConfig = {}

    loader.mockReturnValue(fakeConfig)
    onChange.mockReturnValue({ code: fakeCode })
    validator.mockReturnValue(null)

    const config = await resolveConfig(
      { root: '/', outDir: '/out' },
      { loader, onChange, onCompile, validator },
    )

    expect(onCompile).toHaveBeenCalledWith(targetFile, fakeCode)
    expect(onChange).toHaveBeenCalledWith(targetFile)
    expect(validator).toHaveBeenCalledWith(fakeConfig)
    expect(config).toBe(fakeConfig)
  })

  it('validates config', async () => {
    onChange.mockReturnValue({ code: 23 })
    validator.mockReturnValue('Error')

    const test = () => resolveConfig(
      { root: '/', outDir: '/out' },
      { loader, onChange, onCompile, validator },
    )

    await expect(test).rejects.toThrowError(new Error('Error'))
  })
})