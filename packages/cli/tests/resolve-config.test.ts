import type { Dirent } from 'fs'
import fs from 'fs/promises'
import type { FileRef } from '../src/lib/file-refs'
import { resolveConfig } from '../src/server/resolve-config'

jest.mock('fs/promises')

describe('config resolver', () => {
  it('can resolve config', async () => {
    (fs.readdir as jest.Mock).mockReturnValue(Promise.resolve([{ isFile: () => true, name: 'chooks.config.ts' }] as Dirent[]))

    const targetCode = 'foo'
    const targetFile: FileRef = {
      source: '/chooks.config.ts',
      target: '/out/chooks.config.js',
      type: 'config',
    }

    const loader = jest.fn().mockReturnValue(42)
    const onChange = jest.fn().mockReturnValue({ code: targetCode })
    const onCompile = jest.fn()

    const config = await resolveConfig(
      { root: '/', outDir: '/out' },
      { loader, onChange, onCompile },
    )

    expect(onCompile).toHaveBeenCalledWith(targetFile, targetCode)
    expect(onChange).toHaveBeenCalledWith(targetFile)
    expect(config).toBe(42)
  })
})
