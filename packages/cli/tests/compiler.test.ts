import { FSWatcher } from 'chokidar'
import { once } from 'events'
import { Stats } from 'fs'
import type { File } from '../src/server/compiler'
import { createWatchCompiler } from '../src/server/compiler'

describe('watch compiler', () => {
  it('compiles files', async () => {
    // Fake stats
    const stats = new Stats()
    stats.isFile = () => true

    // Target file
    const targetCode = 'foo'
    const targetFile: File = {
      source: '/foo/bar.ts',
      target: '/out/foo/bar.js',
      type: 'script',
    }

    // Mock handlers
    const onChange = jest.fn().mockReturnValue({ code: targetCode })
    const onCompile = jest.fn()

    const fakeWatcher = new FSWatcher()
    const watchCompiler = createWatchCompiler(fakeWatcher, {
      root: '/',
      outDir: '/out',
      onChange,
      onCompile,
    })

    // Listen on event and wait for it to get emitted
    const ev = once(watchCompiler, 'compile')
    fakeWatcher.emit('add', targetFile.source, stats)
    await ev

    expect(onChange).toHaveBeenCalledWith(targetFile)
    expect(onCompile).toHaveBeenCalledWith(targetFile, targetCode)
  })

  it('deletes files', async () => {
    // Target file
    const targetFile: File = {
      source: '/foo/bar.ts',
      target: '/out/foo/bar.js',
      type: 'script',
    }

    // Mock handlers
    const onDelete = jest.fn()

    const fakeWatcher = new FSWatcher()
    const watchCompiler = createWatchCompiler(fakeWatcher, {
      root: '/',
      outDir: '/out',
      onDelete,
    })

    const ev = once(watchCompiler, 'delete')
    fakeWatcher.emit('unlink', targetFile.source)
    await ev

    expect(onDelete).toHaveBeenCalledWith(targetFile)
  })
})
